import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin-auth";
import {
  EMPLOYEE_SESSION_COOKIE,
  isValidEmployeeSessionToken,
} from "@/lib/employee-auth";
import {
  generateInterviewAccessToken,
  hashInterviewAccessToken,
} from "@/lib/interview/access-token";
import { buildAppUrl } from "@/lib/app-url";
import { sendInterviewInvitationEmail } from "@/lib/emailService";

const TOKEN_EXPIRY_DAYS = 7;

/**
 * POST /api/admin/interviews/regenerate-link
 *
 * Regenerates the interview access token for a candidate application or purchase.
 * - Resets status to AI_INVITED
 * - Deletes any previous/stale interviewSession so the candidate can retake freshly
 * - Merges the new link into purchase.completionNotes
 * - Optionally sends an updated invitation email to the candidate
 *
 * Accessible by both Admin and Employee sessions.
 */
export async function POST(request: NextRequest) {
  const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const employeeToken = request.cookies.get(EMPLOYEE_SESSION_COOKIE)?.value;
  const isAdmin = isValidAdminSessionToken(adminToken);
  const isEmployee = isValidEmployeeSessionToken(employeeToken);

  if (!isAdmin && !isEmployee) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { applicationId, purchaseId, sendEmail = true, candidateEmail } = body as {
      applicationId?: string;
      purchaseId?: string;
      sendEmail?: boolean;
      candidateEmail?: string;
    };

    if (!applicationId && !purchaseId && !candidateEmail) {
      return NextResponse.json(
        { error: "applicationId, purchaseId, or candidateEmail is required." },
        { status: 400 },
      );
    }

    // 1. Locate the application
    let application: any = null;

    if (applicationId) {
      application = await prisma.candidateApplication.findUnique({
        where: { id: applicationId },
        include: {
          template: true,
          purchase: true,
        },
      });
    }

    let purchaseRecord: any = null;
    if (purchaseId) {
      purchaseRecord = await prisma.purchase.findUnique({
        where: { id: purchaseId },
      });
    }

    if (!application && purchaseRecord) {
      application = await prisma.candidateApplication.findFirst({
        where: {
          OR: [
            { purchaseId: purchaseRecord.id },
            { candidateEmail: purchaseRecord.candidateEmail.toLowerCase().trim() },
          ],
        },
        include: {
          template: true,
          purchase: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!application && candidateEmail) {
      application = await prisma.candidateApplication.findFirst({
        where: { candidateEmail: candidateEmail.toLowerCase().trim() },
        include: {
          template: true,
          purchase: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Fallback: If no application exists yet, but purchase exists, auto-create one
    if (!application && purchaseRecord) {
      let templateId: string | null = null;
      let focusAreas: string | null = null;

      if (purchaseRecord.completionNotes) {
        try {
          const notes = JSON.parse(purchaseRecord.completionNotes);
          if (notes.templateId) templateId = notes.templateId;
          if (notes.focusAreas) focusAreas = notes.focusAreas;
        } catch {
          // ignore
        }
      }

      let template = templateId
        ? await prisma.interviewTemplate.findUnique({ where: { id: templateId } })
        : null;

      if (!template) {
        // Find best active template or default
        template = await prisma.interviewTemplate.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        });
      }

      if (!template) {
        return NextResponse.json(
          { error: "No interview template found to link this application to." },
          { status: 404 },
        );
      }

      const tempToken = generateInterviewAccessToken();
      const tempHash = hashInterviewAccessToken(tempToken);
      const tempExpiry = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

      application = await prisma.candidateApplication.create({
        data: {
          templateId: template.id,
          purchaseId: purchaseRecord.id,
          candidateName: purchaseRecord.candidateName.trim(),
          candidateEmail: purchaseRecord.candidateEmail.toLowerCase().trim(),
          candidatePhone: purchaseRecord.candidatePhone || null,
          interviewPreference: "AI",
          focusAreas,
          accessTokenHash: tempHash,
          accessTokenExpiresAt: tempExpiry,
          status: "AI_INVITED",
        },
        include: {
          template: true,
          purchase: true,
        },
      });
    }

    if (!application) {
      return NextResponse.json({ error: "Candidate application not found." }, { status: 404 });
    }

    // 2. Generate a fresh interview access token
    const newAccessToken = generateInterviewAccessToken();
    const newAccessTokenHash = hashInterviewAccessToken(newAccessToken);
    const newAccessTokenExpiresAt = new Date(
      Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    // 3. Delete any existing sessions so candidate starts fresh without "Interview Completed" blocking them
    await prisma.interviewSession.deleteMany({
      where: { applicationId: application.id },
    });

    // 4. Update the candidateApplication
    await prisma.candidateApplication.update({
      where: { id: application.id },
      data: {
        accessTokenHash: newAccessTokenHash,
        accessTokenExpiresAt: newAccessTokenExpiresAt,
        status: "AI_INVITED",
        purchaseId: purchaseRecord?.id || application.purchaseId || undefined,
      },
    });

    const interviewLink = buildAppUrl(`/interview/${newAccessToken}`);

    // 5. Update purchase completionNotes to persist the interviewLink
    const targetPurchase = purchaseRecord || application.purchase;
    if (targetPurchase) {
      let existingNotes: Record<string, unknown> = {};
      if (targetPurchase.completionNotes) {
        try {
          existingNotes = JSON.parse(targetPurchase.completionNotes);
        } catch {
          // not JSON, keep empty
        }
      }

      const updatedNotes = JSON.stringify({
        ...existingNotes,
        interviewLink,
        lastRegeneratedAt: new Date().toISOString(),
      });

      await prisma.purchase.update({
        where: { id: targetPurchase.id },
        data: {
          mockInterviewStatus: "INVITED",
          completionNotes: updatedNotes,
        },
      });
    }

    // 6. Send invitation email if requested
    let emailSent = false;
    let emailError: string | null = null;

    if (sendEmail) {
      try {
        await sendInterviewInvitationEmail({
          candidateName: application.candidateName,
          candidateEmail: application.candidateEmail,
          jobRole: application.template.jobRole,
          interviewPreference: "AI",
          interviewLink,
          interviewDescription: application.template.interviewDescription || undefined,
          durationMinutes: application.template.durationMinutes || 30,
        });
        emailSent = true;
      } catch (err: any) {
        console.error("[regenerate-link] Failed to send email:", err);
        emailError = err?.message || "Failed to send email";
      }
    }

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      purchaseId: targetPurchase?.id || null,
      candidateName: application.candidateName,
      candidateEmail: application.candidateEmail,
      jobRole: application.template.jobRole,
      interviewLink,
      expiresAt: newAccessTokenExpiresAt.toISOString(),
      emailSent,
      emailError,
      message: emailSent
        ? `Fresh interview link generated and emailed to ${application.candidateEmail}.`
        : `Fresh interview link generated. Valid for ${TOKEN_EXPIRY_DAYS} days.`,
    });
  } catch (error: any) {
    console.error("[regenerate-link] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to regenerate interview link." },
      { status: 500 },
    );
  }
}
