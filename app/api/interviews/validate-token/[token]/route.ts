import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashInterviewAccessToken } from "@/lib/interview/access-token";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ valid: false, reason: "missing_token" }, { status: 400 });
    }

    let tokenHash: string;
    try {
      tokenHash = hashInterviewAccessToken(token);
    } catch {
      return NextResponse.json({ valid: false, reason: "server_config_error" }, { status: 500 });
    }

    const application = await prisma.candidateApplication.findUnique({
      where: { accessTokenHash: tokenHash },
      include: {
        template: {
          select: {
            jobRole: true,
            experienceLevel: true,
            durationMinutes: true,
            difficultyLevel: true,
            interviewDescription: true,
            techStack: true,
            requiredSkills: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ valid: false, reason: "invalid_token" }, { status: 404 });
    }

    if (application.accessTokenExpiresAt.getTime() < Date.now()) {
      return NextResponse.json({ valid: false, reason: "expired" }, { status: 410 });
    }

    if (application.status === "INTERVIEW_COMPLETED") {
      return NextResponse.json({ valid: false, reason: "already_completed" }, { status: 409 });
    }

    if (application.status === "TOKEN_EXPIRED" || application.status === "CANCELLED") {
      return NextResponse.json({ valid: false, reason: "not_available" }, { status: 410 });
    }

    if (application.interviewPreference !== "AI") {
      return NextResponse.json({ valid: false, reason: "not_ai_interview" }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      candidateName: application.candidateName,
      template: application.template,
      expiresAt: application.accessTokenExpiresAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ valid: false, reason: "server_error" }, { status: 500 });
  }
}
