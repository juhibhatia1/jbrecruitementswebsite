import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, isRateLimited } from "@/lib/rate-limiter";
import {
  generateInterviewAccessToken,
  hashInterviewAccessToken,
} from "@/lib/interview/access-token";
import {
  sendInterviewInvitationEmail,
  sendNewApplicationAlertEmail,
} from "@/lib/emailService";
import { buildAppUrl } from "@/lib/app-url";

const TOKEN_EXPIRY_DAYS = 7;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many applications submitted. Please try again in an hour." },
      { status: 429 },
    );
  }

  try {
    const body = (await request.json()) as {
      templateId?: string;
      candidateName?: string;
      candidateEmail?: string;
      candidatePhone?: string;
      linkedInUrl?: string;
      interviewPreference?: string;
    };

    const { templateId, candidateName, candidateEmail, interviewPreference } = body;

    if (!templateId || !candidateName || !candidateEmail || !interviewPreference) {
      return NextResponse.json(
        { error: "templateId, candidateName, candidateEmail, and interviewPreference are required." },
        { status: 400 },
      );
    }

    if (!["AI", "MANUAL"].includes(interviewPreference)) {
      return NextResponse.json(
        { error: "interviewPreference must be AI or MANUAL." },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidateEmail)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const template = await prisma.interviewTemplate.findUnique({
      where: { id: templateId, isActive: true },
    });

    if (!template) {
      return NextResponse.json({ error: "Opportunity not found or no longer available." }, { status: 404 });
    }

    const accessToken = generateInterviewAccessToken();
    const accessTokenHash = hashInterviewAccessToken(accessToken);
    const accessTokenExpiresAt = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const application = await prisma.candidateApplication.create({
      data: {
        templateId,
        candidateName: String(candidateName).trim(),
        candidateEmail: String(candidateEmail).trim().toLowerCase(),
        candidatePhone: body.candidatePhone ? String(body.candidatePhone).trim() : null,
        linkedInUrl: body.linkedInUrl ? String(body.linkedInUrl).trim() : null,
        interviewPreference: interviewPreference as "AI" | "MANUAL",
        accessTokenHash,
        accessTokenExpiresAt,
        status: interviewPreference === "AI" ? "AI_INVITED" : "MANUAL_REVIEW_PENDING",
      },
    });

    const interviewLink =
      interviewPreference === "AI" ? buildAppUrl(`/interview/${accessToken}`) : undefined;

    try {
      await sendInterviewInvitationEmail({
        candidateName: application.candidateName,
        candidateEmail: application.candidateEmail,
        jobRole: template.jobRole,
        interviewPreference: interviewPreference as "AI" | "MANUAL",
        interviewLink,
        interviewDescription: template.interviewDescription,
        durationMinutes: template.durationMinutes,
      });
    } catch (emailErr) {
      console.error("Failed to send invitation email:", emailErr);
    }

    try {
      await sendNewApplicationAlertEmail({
        candidateName: application.candidateName,
        candidateEmail: application.candidateEmail,
        candidatePhone: application.candidatePhone,
        linkedInUrl: application.linkedInUrl,
        jobRole: template.jobRole,
        interviewPreference: interviewPreference as "AI" | "MANUAL",
        applicationId: application.id,
      });
    } catch (emailErr) {
      console.error("Failed to send alert email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      message:
        interviewPreference === "AI"
          ? "Application submitted! Check your email for the interview link."
          : "Application received! Our team will be in touch shortly.",
    });
  } catch (error) {
    console.error("Interview application error:", error);
    return NextResponse.json({ error: "Failed to submit application." }, { status: 500 });
  }
}
