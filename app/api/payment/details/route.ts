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
    let meta: Record<string, string> = {};
    let purchaseTime = new Date();
    let isStripe = true;

    // 1. Look up the purchase record first to identify the gateway
    let purchase = await prisma.purchase.findUnique({
      where: { gatewayTransactionId: paymentIntentId },
    });

    if (!purchase) {
      purchase = await prisma.purchase.findUnique({
        where: { id: paymentIntentId },
      });
    }

    // 2. Try looking up any pre-existing candidate application linked to this purchase
    let linkedApplication = null;
    if (purchase) {
      linkedApplication = await prisma.candidateApplication.findFirst({
        where: { purchaseId: purchase.id },
      });
    }

    if (purchase && purchase.paymentGateway === "PAYU") {
      isStripe = false;
      if (purchase.status !== "COMPLETED") {
        return NextResponse.json({ isCoach: false, isAi: false, status: purchase.status.toLowerCase() });
      }
      purchaseTime = new Date(purchase.createdAt);

      // Parse checkout metadata stored in completionNotes
      if (purchase.completionNotes) {
        try {
          meta = JSON.parse(purchase.completionNotes);
        } catch (e) {
          console.error("Failed to parse completionNotes as metadata JSON:", e);
        }
      }

      // If we couldn't parse metadata but there's a pre-created CandidateApplication,
      // we can heal the meta object from the database application record
      if (!meta.interviewTemplateId && linkedApplication) {
        meta = {
          ...meta,
          candidateName: linkedApplication.candidateName,
          candidateEmail: linkedApplication.candidateEmail,
          interviewTemplateId: linkedApplication.templateId,
          interviewPreference: linkedApplication.interviewPreference,
          applicationId: linkedApplication.id,
          linkedInUrl: linkedApplication.linkedInUrl || "",
        };
      }
    }

    if (isStripe) {
      try {
        const stripeClient = getStripe();
        const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
          return NextResponse.json({ isCoach: false, isAi: false, status: paymentIntent.status });
        }

        purchaseTime = new Date(paymentIntent.created * 1000);
        meta = (paymentIntent.metadata as any) || {};
      } catch (stripeErr) {
        // If Stripe fails, but we have a valid completed DB purchase, fall back to DB details
        if (purchase && purchase.status === "COMPLETED") {
          isStripe = false;
          purchaseTime = new Date(purchase.createdAt);
        } else {
          throw stripeErr;
        }
      }
    }

    // Check if the purchase includes an AI Mock Interview
    const purchasedMockInterview = purchase && (
      purchase.serviceName.toLowerCase().includes("ai mock interview") ||
      purchase.serviceName.toLowerCase().includes("mock interview")
    );

    // If they purchased a mock interview but haven't activated it (no linked candidate application),
    // signal to the frontend that setup is required by returning interviewLink: null.
    if (purchasedMockInterview && !linkedApplication) {
      return NextResponse.json({
        isCoach: false,
        isAi: true,
        candidateName: purchase?.candidateName || meta.candidateName || null,
        candidateEmail: purchase?.candidateEmail || meta.candidateEmail || null,
        purchaseId: purchase?.id || "",
        interviewLink: null,
      });
    }

    // Merge application metadata if it was found
    if (linkedApplication) {
      if (!meta.interviewTemplateId) {
        meta.interviewTemplateId = linkedApplication.templateId;
      }
      if (!meta.interviewPreference) {
        meta.interviewPreference = linkedApplication.interviewPreference;
      }
      if (!meta.applicationId) {
        meta.applicationId = linkedApplication.id;
      }
      if (!meta.candidateEmail) {
        meta.candidateEmail = linkedApplication.candidateEmail;
      }
      if (!meta.candidateName) {
        meta.candidateName = linkedApplication.candidateName;
      }
    }

    if (purchase) {
      if (!meta.candidateEmail && purchase.candidateEmail) {
        meta.candidateEmail = purchase.candidateEmail;
      }
      if (!meta.candidateName && purchase.candidateName) {
        meta.candidateName = purchase.candidateName;
      }
    }

    const interviewPreference = meta.interviewPreference || "AI";
    const isCoach = interviewPreference === "MANUAL";
    const isAi = interviewPreference === "AI";

    if (!meta.candidateEmail) {
      return NextResponse.json({
        isCoach: false,
        isAi: false,
        candidateName: purchase?.candidateName || meta.candidateName || null,
        candidateEmail: purchase?.candidateEmail || meta.candidateEmail || null,
      });
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

    // Safety fallback: if no template ID is present, treat as general service
    if (!meta.interviewTemplateId) {
      return NextResponse.json({
        isCoach: false,
        isAi: false,
        candidateName: purchase?.candidateName || meta.candidateName || null,
        candidateEmail: purchase?.candidateEmail || meta.candidateEmail || null,
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
              gte: new Date(purchaseTime.getTime() - 10 * 60000), // 10 min buffer
            },
          },
          orderBy: { createdAt: "desc" },
          select: candidateApplicationSafeSelect,
        });
      }

      // 3. Broader fallback: any APPLIED application for this template+email
      if (!application) {
        application = await prisma.candidateApplication.findFirst({
          where: {
            templateId: template.id,
            candidateEmail: candidateEmailLower,
            interviewPreference: "AI",
            status: "APPLIED",
          },
          orderBy: { createdAt: "desc" },
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

      // If webhook already activated the application, retrieve the stored interview link
      if (application && application.status !== "APPLIED") {
        // The webhook stores the interview link in purchase.completionNotes as JSON: { interviewLink: "..." }
        const purchaseRecord = purchase || (application.purchaseId
          ? await prisma.purchase.findUnique({ where: { id: application.purchaseId } })
          : null);
        if (purchaseRecord?.completionNotes) {
          try {
            const notes = JSON.parse(purchaseRecord.completionNotes) as { interviewLink?: string };
            if (notes.interviewLink) {
              return NextResponse.json({
                isCoach: false,
                isAi: true,
                candidateName: application.candidateName,
                candidateEmail: application.candidateEmail,
                applicationId: application.id,
                interviewLink: notes.interviewLink,
                purchaseId: purchaseRecord.id,
              });
            }
          } catch {
            // completionNotes is not JSON or doesn't have interviewLink — fall through to create new token
          }
        }
        // Webhook activated but link not stored (legacy) — generate a new token and update the application
        const accessToken = generateInterviewAccessToken();
        rawToken = accessToken;
        const accessTokenHash = hashInterviewAccessToken(accessToken);
        const TOKEN_EXPIRY_DAYS = 7;
        const accessTokenExpiresAt = new Date(
          Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        );
        application = await prisma.candidateApplication.update({
          where: { id: application.id },
          data: { accessTokenHash, accessTokenExpiresAt },
          select: candidateApplicationSafeSelect,
        });

        const interviewLink = buildAppUrl(`/interview/${accessToken}`);

        if (purchaseRecord) {
          let existingNotes: Record<string, unknown> = {};
          if (purchaseRecord.completionNotes) {
            try {
              existingNotes = JSON.parse(purchaseRecord.completionNotes);
            } catch {}
          }
          await prisma.purchase.update({
            where: { id: purchaseRecord.id },
            data: {
              mockInterviewStatus: "INVITED",
              completionNotes: JSON.stringify({ ...existingNotes, interviewLink }),
            },
          });
        }

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
        } catch (emailErr) {
          console.error("Failed to send AI notifications in details fallback:", emailErr);
        }
      } else if (!application) {
        // Self-healing: webhook hasn't fired yet — create application now
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
        // Application pre-created by checkout but webhook hasn't fired yet — activate it now
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

    return NextResponse.json({
      isCoach: false,
      isAi: false,
      candidateName: purchase?.candidateName || meta.candidateName || null,
      candidateEmail: purchase?.candidateEmail || meta.candidateEmail || null,
    });
  } catch (error: any) {
    console.error("Error retrieving payment details:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve payment details" }, { status: 500 });
  }
}
