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
import { sendInterviewInvitationEmail } from "@/lib/emailService";

/**
 * POST /api/admin/interviews/send-link-email
 *
 * Sends or resends the interview invitation email to the candidate.
 * Accepts either:
 * - applicationId
 * - purchaseId
 * - interviewLink (explicitly provided)
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
    const { applicationId, purchaseId, interviewLink } = body as {
      applicationId?: string;
      purchaseId?: string;
      interviewLink?: string;
    };

    if (!applicationId && !purchaseId && !interviewLink) {
      return NextResponse.json(
        { error: "applicationId, purchaseId, or interviewLink is required." },
        { status: 400 },
      );
    }

    let application: any = null;
    let resolvedLink = interviewLink?.trim() || "";

    if (applicationId) {
      application = await prisma.candidateApplication.findUnique({
        where: { id: applicationId },
        include: { template: true, purchase: true },
      });
    }

    if (!application && purchaseId) {
      const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
      });
      if (purchase) {
        if (!resolvedLink && purchase.completionNotes) {
          try {
            const notes = JSON.parse(purchase.completionNotes);
            if (notes.interviewLink) resolvedLink = notes.interviewLink;
          } catch {
            // ignore
          }
        }
        application = await prisma.candidateApplication.findFirst({
          where: {
            OR: [
              { purchaseId: purchase.id },
              { candidateEmail: purchase.candidateEmail.toLowerCase().trim() },
            ],
          },
          include: { template: true, purchase: true },
          orderBy: { createdAt: "desc" },
        });
      }
    }

    if (!resolvedLink && application?.purchase?.completionNotes) {
      try {
        const notes = JSON.parse(application.purchase.completionNotes);
        if (notes.interviewLink) resolvedLink = notes.interviewLink;
      } catch {
        // ignore
      }
    }

    if (!resolvedLink) {
      return NextResponse.json(
        { error: "No interview link found. Please click 'Regenerate Link' to generate a fresh link." },
        { status: 400 },
      );
    }

    const candidateName = application?.candidateName || application?.purchase?.candidateName || "Candidate";
    const candidateEmail = application?.candidateEmail || application?.purchase?.candidateEmail;
    const jobRole = application?.template?.jobRole || application?.purchase?.serviceName || "AI Mock Interview";
    const durationMinutes = application?.template?.durationMinutes || 30;
    const interviewDescription = application?.template?.interviewDescription || undefined;

    if (!candidateEmail) {
      return NextResponse.json({ error: "Candidate email not found." }, { status: 400 });
    }

    await sendInterviewInvitationEmail({
      candidateName,
      candidateEmail,
      jobRole,
      interviewPreference: "AI",
      interviewLink: resolvedLink,
      durationMinutes,
      interviewDescription,
    });

    return NextResponse.json({
      success: true,
      candidateEmail,
      message: `Interview invitation email successfully sent to ${candidateEmail}.`,
    });
  } catch (error: any) {
    console.error("[send-link-email] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send interview invitation email." },
      { status: 500 },
    );
  }
}
