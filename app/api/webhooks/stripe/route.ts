import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendPurchaseEmails } from "@/lib/emailService";

let stripe: Stripe | null = null;

function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured on the server.");
    }
    stripe = new Stripe(key, {
      apiVersion: "2026-05-27.dahlia",
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

      // Update the Purchase record
      const purchase = await prisma.purchase.update({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: {
          status: "COMPLETED",
          country: billingCountry,
        },
      });

      console.log(`Updated Purchase in database: ${purchase.id}. Status: COMPLETED`);

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
      await sendPurchaseEmails(purchase);
      console.log(`Purchase emails sent successfully for Purchase ID: ${purchase.id}`);

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
