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

    const meta = paymentIntent.metadata;
    const interviewPreference = meta.interviewPreference || "AI";
    const isCoach = interviewPreference === "MANUAL";
    const isAi = interviewPreference === "AI";

    if (!meta.interviewTemplateId || !meta.candidateEmail) {
      return NextResponse.json({ isCoach: false, isAi: false });
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
      let application = await prisma.candidateApplication.findFirst({
        where: {
          templateId: template.id,
          candidateEmail: candidateEmailLower,
          interviewPreference: "MANUAL",
        },
      });

      // Self-healing creation if webhook hasn't fired yet
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
            candidatePhone: null,
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
      });
    }

    // ── CASE 2: AI Mock Interview (AI) ──────────────────────────────────────
    if (isAi) {
      let application = await prisma.candidateApplication.findFirst({
        where: {
          templateId: template.id,
          candidateEmail: candidateEmailLower,
          interviewPreference: "AI",
        },
      });

      let rawToken = "";

      // Self-healing creation if webhook hasn't fired yet
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
          },
        });

        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          process.env.NEXT_PUBLIC_SITE_URL ||
          "https://jbrecruitments.com";
        const interviewLink = `${appUrl.replace(/\/$/, "")}/interview/${accessToken}`;

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
            candidatePhone: null,
            linkedInUrl: application.linkedInUrl,
            jobRole: template.jobRole,
            interviewPreference: "AI",
            applicationId: application.id,
          });
        } catch (emailErr) {
          console.error("Failed to send AI notifications in details route:", emailErr);
        }
      }

      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://jbrecruitments.com";
      const startUrl = rawToken 
        ? `${appUrl.replace(/\/$/, "")}/interview/${rawToken}` 
        : "";

      return NextResponse.json({
        isCoach: false,
        isAi: true,
        candidateName: application.candidateName,
        candidateEmail: application.candidateEmail,
        applicationId: application.id,
        interviewLink: startUrl,
      });
    }

    return NextResponse.json({ isCoach: false, isAi: false });
  } catch (error: any) {
    console.error("Error retrieving payment details:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve payment details" }, { status: 500 });
  }
}
