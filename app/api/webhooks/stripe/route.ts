import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendPurchaseEmails, sendInterviewInvitationEmail, sendNewApplicationAlertEmail } from "@/lib/emailService";
import {
  generateInterviewAccessToken,
  hashInterviewAccessToken,
} from "@/lib/interview/access-token";

let stripe: Stripe | null = null;

function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured on the server.");
    }
    stripe = new Stripe(key, {
      apiVersion: "2026-05-27.dahlia" as any,
    });
  }
  return stripe;
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature provided" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let stripeClient: Stripe;
  try {
    stripeClient = getStripe();
  } catch (err: any) {
    console.error(err.message);
    return NextResponse.json({ error: "Stripe not configured on the server." }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripeClient.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
      300 // Explicitly set 300 seconds (5 minutes) tolerance to protect against replay attacks
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log(`PaymentIntent for ${paymentIntent.amount} succeeded. ID: ${paymentIntent.id}`);

    // Extract billing country
    let billingCountry = null;
    try {
      const charge = paymentIntent.latest_charge
        ? await stripeClient.charges.retrieve(paymentIntent.latest_charge as string)
        : null;
      billingCountry = charge?.billing_details?.address?.country || null;
    } catch (chargeErr) {
      console.warn("Could not retrieve billing country details:", chargeErr);
    }

    try {
      // Find the Purchase record first to check status (protect against duplicate webhook deliveries)
      const existingPurchase = await prisma.purchase.findUnique({
        where: { stripePaymentIntentId: paymentIntent.id },
      });

      if (existingPurchase && existingPurchase.status === "COMPLETED") {
        console.log(`Purchase with PaymentIntent ID ${paymentIntent.id} is already COMPLETED. Skipping fulfillment.`);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      // Calculate delivery deadline based on service name (defaults to 5 days, 48 hours for Ask Me Anything, 3 days for Interview Prep)
      const created = new Date(existingPurchase?.createdAt || new Date());
      const service = existingPurchase?.serviceName || "";
      let days = 5;
      if (service.includes("Ask Me Anything")) {
        days = 2;
      } else if (service.includes("Interview Prep")) {
        days = 3;
      }
      const deliveryDeadline = new Date(created.getTime() + days * 24 * 60 * 60 * 1000);

      // Update the Purchase record
      const purchase = await prisma.purchase.update({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: {
          status: "COMPLETED",
          country: billingCountry,
          deliveryDeadline,
        },
      });

      console.log(`Updated Purchase in database: ${purchase.id}. Status: COMPLETED`);

      // ── If this is an AI mock interview purchase, create the application ──
      const meta = paymentIntent.metadata;
      if (
        meta.interviewPreference === "AI" &&
        meta.interviewTemplateId &&
        meta.candidateName &&
        meta.candidateEmail
      ) {
        try {
          const template = await prisma.interviewTemplate.findUnique({
            where: { id: meta.interviewTemplateId, isActive: true },
          });

          if (template) {
            // Check if already created by success page details endpoint
            const existing = await prisma.candidateApplication.findFirst({
              where: {
                templateId: template.id,
                candidateEmail: meta.candidateEmail.trim().toLowerCase(),
                interviewPreference: "AI",
              },
            });
            if (existing) {
              console.log(`AI application ${existing.id} already exists (likely created by success page). Skipping creation.`);
              return;
            }

            const TOKEN_EXPIRY_DAYS = 7;
            const accessToken = generateInterviewAccessToken();
            const accessTokenHash = hashInterviewAccessToken(accessToken);
            const accessTokenExpiresAt = new Date(
              Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
            );

            const application = await prisma.candidateApplication.create({
              data: {
                templateId: template.id,
                candidateName: meta.candidateName.trim(),
                candidateEmail: meta.candidateEmail.trim().toLowerCase(),
                candidatePhone: null,
                linkedInUrl: meta.linkedInUrl || null,
                interviewPreference: "AI",
                accessTokenHash,
                accessTokenExpiresAt,
                status: "AI_INVITED",
              },
            });

            const appUrl =
              process.env.NEXT_PUBLIC_APP_URL ||
              process.env.NEXT_PUBLIC_SITE_URL ||
              "https://jbrecruitments.com";
            const interviewLink = `${appUrl}/interview/${accessToken}`;

            // Send invitation email to candidate
            await sendInterviewInvitationEmail({
              candidateName: application.candidateName,
              candidateEmail: application.candidateEmail,
              jobRole: template.jobRole,
              interviewPreference: "AI",
              interviewLink,
              interviewDescription: template.interviewDescription,
              durationMinutes: template.durationMinutes,
            });

            // Alert the admin
            await sendNewApplicationAlertEmail({
              candidateName: application.candidateName,
              candidateEmail: application.candidateEmail,
              candidatePhone: null,
              linkedInUrl: application.linkedInUrl,
              jobRole: template.jobRole,
              interviewPreference: "AI",
              applicationId: application.id,
            });

            console.log(
              `AI interview application ${application.id} created and link emailed to ${application.candidateEmail}`,
            );
          } else {
            console.warn(
              `AI mock interview template ${meta.interviewTemplateId} not found or inactive. Skipping application creation.`,
            );
          }
        } catch (interviewErr) {
          console.error("Failed to create AI interview application from webhook:", interviewErr);
          // Do NOT return 500 here — purchase is already marked COMPLETED.
          // Emit an alert but don't cause Stripe to re-deliver.
        }
      }

      // ── If this is a MANUAL (Coach) mock interview purchase, create the application ──
      if (
        meta.interviewPreference === "MANUAL" &&
        meta.interviewTemplateId &&
        meta.candidateName &&
        meta.candidateEmail
      ) {
        try {
          const template = await prisma.interviewTemplate.findUnique({
            where: { id: meta.interviewTemplateId, isActive: true },
          });

          if (template) {
            // Generate a token so admin can look up the application later
            const accessToken = generateInterviewAccessToken();
            const accessTokenHash = hashInterviewAccessToken(accessToken);
            const accessTokenExpiresAt = new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days for coach sessions
            );

            const application = await prisma.candidateApplication.create({
              data: {
                templateId: template.id,
                candidateName: meta.candidateName.trim(),
                candidateEmail: meta.candidateEmail.trim().toLowerCase(),
                candidatePhone: null,
                linkedInUrl: meta.linkedInUrl || null,
                interviewPreference: "MANUAL",
                accessTokenHash,
                accessTokenExpiresAt,
                status: "MANUAL_REVIEW_PENDING",
              },
            });

            const calLink = process.env.NEXT_PUBLIC_CAL_LINK || "jbrecruitments/mock-interview";
            const appUrl =
              process.env.NEXT_PUBLIC_APP_URL ||
              process.env.NEXT_PUBLIC_SITE_URL ||
              "https://jbrecruitments.com";
            const calSchedulingLink = calLink.startsWith("http")
              ? calLink
              : `${appUrl.replace(/\/$/, "")}/${calLink}`;

            // Send invitation email with Cal.com booking link
            await sendInterviewInvitationEmail({
              candidateName: application.candidateName,
              candidateEmail: application.candidateEmail,
              jobRole: template.jobRole,
              interviewPreference: "MANUAL",
              calSchedulingLink,
              interviewDescription: template.interviewDescription,
              durationMinutes: template.durationMinutes,
            });

            // Alert the admin
            await sendNewApplicationAlertEmail({
              candidateName: application.candidateName,
              candidateEmail: application.candidateEmail,
              candidatePhone: null,
              linkedInUrl: application.linkedInUrl,
              jobRole: template.jobRole,
              interviewPreference: "MANUAL",
              applicationId: application.id,
            });

            console.log(
              `Coach interview application ${application.id} created and Cal link emailed to ${application.candidateEmail}`,
            );
          } else {
            console.warn(
              `Coach mock interview template ${meta.interviewTemplateId} not found or inactive. Skipping application creation.`,
            );
          }
        } catch (coachErr) {
          console.error("Failed to create Coach interview application from webhook:", coachErr);
          // Do NOT return 500 here — purchase is already marked COMPLETED.
        }
      }

      // Record completed funnel event
      try {
        await prisma.funnelEvent.create({
          data: {
            serviceName: purchase.serviceName,
            eventType: "COMPLETED",
          },
        });
        console.log(`Logged COMPLETED funnel event for ${purchase.serviceName}`);
      } catch (funnelErr) {
        console.warn("Could not log completed funnel event:", funnelErr);
      }

      // Trigger the email alerts
      const emailResult = await sendPurchaseEmails(purchase);
      if (emailResult.success) {
        console.log(`Purchase emails sent successfully for Purchase ID: ${purchase.id}`);
      } else {
        console.error(`Failed to send purchase emails for Purchase ID: ${purchase.id}. Error:`, emailResult.error);
      }

    } catch (dbErr) {
      console.error("Failed to update purchase database record or send emails:", dbErr);
      // Return 500 so Stripe retries the webhook
      return NextResponse.json({ error: "Database or email execution failed" }, { status: 500 });
    }
  } else {
    console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
