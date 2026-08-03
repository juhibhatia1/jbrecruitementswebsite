import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin-auth";
import {
  generateInterviewAccessToken,
  hashInterviewAccessToken,
} from "@/lib/interview/access-token";
import { buildAppUrl } from "@/lib/app-url";

const TOKEN_EXPIRY_DAYS = 7;

type RouteContext = { params: Promise<{ applicationId: string }> };

/**
 * POST /api/admin/applications/[applicationId]/refresh-token
 *
 * Regenerates the interview access token for a given candidate application.
 * Resets status back to AI_INVITED so the candidate can retake the interview.
 *
 * Requires a valid admin session cookie.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  // Auth check
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId } = await params;

  if (!applicationId) {
    return NextResponse.json({ error: "applicationId is required." }, { status: 400 });
  }

  try {
    // Verify the application exists
    const application = await prisma.candidateApplication.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        candidateName: true,
        candidateEmail: true,
        interviewPreference: true,
        status: true,
        template: { select: { jobRole: true } },
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

    return NextResponse.json({
      success: true,
      applicationId,
      candidateName: application.candidateName,
      candidateEmail: application.candidateEmail,
      jobRole: application.template.jobRole,
      interviewLink,
      expiresAt: newAccessTokenExpiresAt.toISOString(),
      message: `Token refreshed. Status reset to AI_INVITED. New link is valid for ${TOKEN_EXPIRY_DAYS} days.`,
    });
  } catch (err) {
    console.error("[refresh-token] Error:", err);
    return NextResponse.json({ error: "Failed to refresh token." }, { status: 500 });
  }
}
