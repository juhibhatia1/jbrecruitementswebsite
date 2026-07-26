import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  generateInterviewAccessToken,
  hashInterviewAccessToken,
} from "@/lib/interview/access-token";
import {
  sendInterviewInvitationEmail,
  sendNewApplicationAlertEmail,
} from "@/lib/emailService";
import { candidateApplicationSafeSelect } from "@/lib/candidate-application-select";
import { buildAppUrl, getAppBaseUrl } from "@/lib/app-url";

let stripe: Stripe | null = null;

function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured.");
    }
    stripe = new Stripe(key, {
      apiVersion: "2026-05-27.dahlia" as any,
    });
  }
  return stripe;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentIntentId = searchParams.get("payment_intent");

  if (!paymentIntentId) {
    return NextResponse.json({ error: "Missing payment_intent parameter" }, { status: 400 });
  }

  try {
    const stripeClient = getStripe();
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ isCoach: false, isAi: false, status: paymentIntent.status });
    }

    const purchaseTime = new Date(paymentIntent.created * 1000);
    const purchase = await prisma.purchase.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    const meta = paymentIntent.metadata;
    const interviewPreference = meta.interviewPreference || "AI";
    const isCoach = interviewPreference === "MANUAL";
    const isAi = interviewPreference === "AI";

    if (!meta.candidateEmail) {
      return NextResponse.json({ isCoach: false, isAi: false });
    }

    if (isCoach && meta.jobRole && !meta.interviewTemplateId) {
      return NextResponse.json({
        isCoach: true,
        isAi: false,
        candidateName: purchase?.candidateName || meta.candidateName || "Candidate",
        candidateEmail: purchase?.candidateEmail || meta.candidateEmail,
        purchaseId: purchase?.id || "",
        jobRole: meta.jobRole,
        yearsOfExperience: meta.yearsOfExperience || "",
        applicationLink: meta.applicationLink || "",
        interviewBrief: meta.interviewBrief || "",
        mockInterviewStatus: purchase?.mockInterviewStatus || "PENDING_SCHEDULE",
        mockInterviewDate: purchase?.mockInterviewDate ? purchase.mockInterviewDate.toISOString() : null,
        bookingLink: buildAppUrl(`/payment/success?payment_intent=${paymentIntentId}`),
      });
    }

    // Lookup template
    const template = await prisma.interviewTemplate.findUnique({
      where: { id: meta.interviewTemplateId, isActive: true },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const candidateEmailLower = meta.candidateEmail.trim().toLowerCase();

    // ── CASE 1: Coach Mock Interview (MANUAL) ───────────────────────────────
    if (isCoach) {
      let application = null;

      // 1. Try lookup by applicationId if available
      if (meta.applicationId) {
        application = await prisma.candidateApplication.findUnique({
          where: { id: meta.applicationId },
          select: candidateApplicationSafeSelect,
        });
      }

      // 2. Otherwise try lookup by email and template
      if (!application) {
        application = await prisma.candidateApplication.findFirst({
          where: {
            templateId: template.id,
            candidateEmail: candidateEmailLower,
            interviewPreference: "MANUAL",
            createdAt: {
              gte: new Date(purchaseTime.getTime() - 60000), // 1 min buffer
            },
          },
          select: candidateApplicationSafeSelect,
        });
      }

      // Self-heal purchase association if application exists but lacks purchaseId
      if (application && !application.purchaseId && purchase) {
        application = await prisma.candidateApplication.update({
          where: { id: application.id },
          data: { purchaseId: purchase.id },
          select: candidateApplicationSafeSelect,
        });
      }

      // Self-healing creation or activation if webhook hasn't fired yet
      if (!application) {
        const accessToken = generateInterviewAccessToken();
        const accessTokenHash = hashInterviewAccessToken(accessToken);
        const accessTokenExpiresAt = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
        );

        application = await prisma.candidateApplication.create({
          data: {
            templateId: template.id,
            candidateName: (meta.candidateName || "Candidate").trim(),
            candidateEmail: candidateEmailLower,
            candidatePhone: null,
            linkedInUrl: meta.linkedInUrl || null,
            interviewPreference: "MANUAL",
            accessTokenHash,
            accessTokenExpiresAt,
            status: "MANUAL_REVIEW_PENDING",
            purchaseId: purchase?.id || null,
          },
        });

        const calLink = process.env.NEXT_PUBLIC_CAL_LINK || "jbrecruitments/mock-interview";
        const calSchedulingLink = calLink.startsWith("http")
          ? calLink
          : `${getAppBaseUrl()}/${calLink.replace(/^\/+/, "")}`;

        // Send email notifications
        try {
          await sendInterviewInvitationEmail({
            candidateName: application.candidateName,
            candidateEmail: application.candidateEmail,
            jobRole: template.jobRole,
            interviewPreference: "MANUAL",
            calSchedulingLink,
            interviewDescription: template.interviewDescription,
            durationMinutes: template.durationMinutes,
          });

          await sendNewApplicationAlertEmail({
            candidateName: application.candidateName,
            candidateEmail: application.candidateEmail,
            candidatePhone: application.candidatePhone,
            linkedInUrl: application.linkedInUrl,
            jobRole: template.jobRole,
            interviewPreference: "MANUAL",
            applicationId: application.id,
          });
        } catch (emailErr) {
          console.error("Failed to send coach notifications in details route:", emailErr);
        }
      } else if (application.status === "APPLIED") {
        // Activate pre-created application
        const accessToken = generateInterviewAccessToken();
        const accessTokenHash = hashInterviewAccessToken(accessToken);
        const accessTokenExpiresAt = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
        );

        application = await prisma.candidateApplication.update({
          where: { id: application.id },
          data: {
            status: "MANUAL_REVIEW_PENDING",
            accessTokenHash,
            accessTokenExpiresAt,
            purchaseId: purchase?.id || null,
          },
        });

        const calLink = process.env.NEXT_PUBLIC_CAL_LINK || "jbrecruitments/mock-interview";
        const calSchedulingLink = calLink.startsWith("http")
          ? calLink
          : `${getAppBaseUrl()}/${calLink.replace(/^\/+/, "")}`;

        // Send email notifications
        try {
          await sendInterviewInvitationEmail({
            candidateName: application.candidateName,
            candidateEmail: application.candidateEmail,
            jobRole: template.jobRole,
            interviewPreference: "MANUAL",
            calSchedulingLink,
            interviewDescription: template.interviewDescription,
            durationMinutes: template.durationMinutes,
          });

          await sendNewApplicationAlertEmail({
            candidateName: application.candidateName,
            candidateEmail: application.candidateEmail,
            candidatePhone: application.candidatePhone,
            linkedInUrl: application.linkedInUrl,
            jobRole: template.jobRole,
            interviewPreference: "MANUAL",
            applicationId: application.id,
          });
        } catch (emailErr) {
          console.error("Failed to send coach notifications in details route:", emailErr);
        }
      }

      return NextResponse.json({
        isCoach: true,
        isAi: false,
        candidateName: application.candidateName,
        candidateEmail: application.candidateEmail,
        applicationId: application.id,
        purchaseId: purchase?.id || "",
      });
    }

    // ── CASE 2: AI Mock Interview (AI) ──────────────────────────────────────
    if (isAi) {
      let application = null;

      // 1. Try lookup by applicationId if available
      if (meta.applicationId) {
        application = await prisma.candidateApplication.findUnique({
          where: { id: meta.applicationId },
          select: candidateApplicationSafeSelect,
        });
      }

      // 2. Otherwise try lookup by email and template
      if (!application) {
        application = await prisma.candidateApplication.findFirst({
          where: {
            templateId: template.id,
            candidateEmail: candidateEmailLower,
            interviewPreference: "AI",
            createdAt: {
              gte: new Date(purchaseTime.getTime() - 60000), // 1 min buffer
            },
          },
          select: candidateApplicationSafeSelect,
        });
      }

      // Self-heal purchase association if application exists but lacks purchaseId
      if (application && !application.purchaseId && purchase) {
        application = await prisma.candidateApplication.update({
          where: { id: application.id },
          data: { purchaseId: purchase.id },
          select: candidateApplicationSafeSelect,
        });
      }

      let rawToken = "";

      // Self-healing creation or activation if webhook hasn't fired yet
      if (!application) {
        const accessToken = generateInterviewAccessToken();
        rawToken = accessToken;
        const accessTokenHash = hashInterviewAccessToken(accessToken);
        const TOKEN_EXPIRY_DAYS = 7;
        const accessTokenExpiresAt = new Date(
          Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        );

        application = await prisma.candidateApplication.create({
          data: {
            templateId: template.id,
            candidateName: (meta.candidateName || "Candidate").trim(),
            candidateEmail: candidateEmailLower,
            candidatePhone: null,
            linkedInUrl: meta.linkedInUrl || null,
            interviewPreference: "AI",
            accessTokenHash,
            accessTokenExpiresAt,
            status: "AI_INVITED",
            purchaseId: purchase?.id || null,
          },
        });

        const interviewLink = buildAppUrl(`/interview/${accessToken}`);

        // Send email notifications
        try {
          await sendInterviewInvitationEmail({
            candidateName: application.candidateName,
            candidateEmail: application.candidateEmail,
            jobRole: template.jobRole,
            interviewPreference: "AI",
            interviewLink,
            interviewDescription: template.interviewDescription,
            durationMinutes: template.durationMinutes,
          });

          await sendNewApplicationAlertEmail({
            candidateName: application.candidateName,
            candidateEmail: application.candidateEmail,
            candidatePhone: application.candidatePhone,
            linkedInUrl: application.linkedInUrl,
            jobRole: template.jobRole,
            interviewPreference: "AI",
            applicationId: application.id,
          });
        } catch (emailErr) {
          console.error("Failed to send AI notifications in details route:", emailErr);
        }
      } else if (application.status === "APPLIED") {
        const accessToken = generateInterviewAccessToken();
        rawToken = accessToken;
        const accessTokenHash = hashInterviewAccessToken(accessToken);
        const TOKEN_EXPIRY_DAYS = 7;
        const accessTokenExpiresAt = new Date(
          Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        );

        application = await prisma.candidateApplication.update({
          where: { id: application.id },
          data: {
            status: "AI_INVITED",
            accessTokenHash,
            accessTokenExpiresAt,
            purchaseId: purchase?.id || null,
          },
        });

        const interviewLink = buildAppUrl(`/interview/${accessToken}`);

        // Send email notifications
        try {
          await sendInterviewInvitationEmail({
            candidateName: application.candidateName,
            candidateEmail: application.candidateEmail,
            jobRole: template.jobRole,
            interviewPreference: "AI",
            interviewLink,
            interviewDescription: template.interviewDescription,
            durationMinutes: template.durationMinutes,
          });

          await sendNewApplicationAlertEmail({
            candidateName: application.candidateName,
            candidateEmail: application.candidateEmail,
            candidatePhone: application.candidatePhone,
            linkedInUrl: application.linkedInUrl,
            jobRole: template.jobRole,
            interviewPreference: "AI",
            applicationId: application.id,
          });
        } catch (emailErr) {
          console.error("Failed to send AI notifications in details route:", emailErr);
        }
      }

      const startUrl = rawToken 
        ? buildAppUrl(`/interview/${rawToken}`)
        : "";

      return NextResponse.json({
        isCoach: false,
        isAi: true,
        candidateName: application.candidateName,
        candidateEmail: application.candidateEmail,
        applicationId: application.id,
        interviewLink: startUrl,
        purchaseId: purchase?.id || "",
      });
    }

    return NextResponse.json({ isCoach: false, isAi: false });
  } catch (error: any) {
    console.error("Error retrieving payment details:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve payment details" }, { status: 500 });
  }
}
