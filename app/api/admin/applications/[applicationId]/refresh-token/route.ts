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

type RouteContext = { params: Promise<{ applicationId: string }> };

/**
 * POST /api/admin/applications/[applicationId]/refresh-token
 *
 * Regenerates the interview access token for a given candidate application.
 * Resets status back to AI_INVITED so the candidate can retake the interview.
 *
 * Requires a valid admin or employee session cookie.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  // Auth check
  const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const employeeToken = request.cookies.get(EMPLOYEE_SESSION_COOKIE)?.value;
  const isAdmin = isValidAdminSessionToken(adminToken);
  const isEmployee = isValidEmployeeSessionToken(employeeToken);

  if (!isAdmin && !isEmployee) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId } = await params;

  if (!applicationId) {
    return NextResponse.json({ error: "applicationId is required." }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { sendEmail = false } = body as { sendEmail?: boolean };

    // Verify the application exists
    const application = await prisma.candidateApplication.findUnique({
      where: { id: applicationId },
      include: {
        template: true,
        purchase: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    if (application.interviewPreference !== "AI") {
      return NextResponse.json(
        { error: "This application is not an AI interview — no token to refresh." },
        { status: 400 },
      );
    }

    // Delete any existing sessions so candidate starts fresh
    await prisma.interviewSession.deleteMany({
      where: { applicationId },
    });

    // Generate a fresh token
    const newAccessToken = generateInterviewAccessToken();
    const newAccessTokenHash = hashInterviewAccessToken(newAccessToken);
    const newAccessTokenExpiresAt = new Date(
      Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    // Update the application: new token + reset status to AI_INVITED
    await prisma.candidateApplication.update({
      where: { id: applicationId },
      data: {
        accessTokenHash: newAccessTokenHash,
        accessTokenExpiresAt: newAccessTokenExpiresAt,
        status: "AI_INVITED",
      },
    });

    const interviewLink = buildAppUrl(`/interview/${newAccessToken}`);

    if (application.purchase) {
      let existingNotes: Record<string, unknown> = {};
      if (application.purchase.completionNotes) {
        try {
          existingNotes = JSON.parse(application.purchase.completionNotes);
        } catch {
          // ignore
        }
      }
      await prisma.purchase.update({
        where: { id: application.purchase.id },
        data: {
          mockInterviewStatus: "INVITED",
          completionNotes: JSON.stringify({ ...existingNotes, interviewLink }),
        },
      });
    }

    let emailSent = false;
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
      } catch (e) {
        console.error("Failed to email refreshed token to candidate:", e);
      }
    }

    return NextResponse.json({
      success: true,
      applicationId,
      candidateName: application.candidateName,
      candidateEmail: application.candidateEmail,
      jobRole: application.template.jobRole,
      interviewLink,
      expiresAt: newAccessTokenExpiresAt.toISOString(),
      emailSent,
      message: `Token refreshed. Status reset to AI_INVITED. New link is valid for ${TOKEN_EXPIRY_DAYS} days.`,
    });
  } catch (err) {
    console.error("[refresh-token] Error:", err);
    return NextResponse.json({ error: "Failed to refresh token." }, { status: 500 });
  }
}
