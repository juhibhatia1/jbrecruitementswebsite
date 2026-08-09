import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateInterviewAccessToken,
  hashInterviewAccessToken,
} from "@/lib/interview/access-token";
import {
  sendInterviewInvitationEmail,
  sendNewApplicationAlertEmail,
} from "@/lib/emailService";
import { buildAppUrl } from "@/lib/app-url";
import { candidateApplicationSafeSelect } from "@/lib/candidate-application-select";

interface RequestBody {
  purchaseId: string;
  templateId: string;
  resumeUrl?: string;
  resumeText?: string;
  linkedInUrl?: string;
  careerGoal?: string;
  selfIntroNotes?: string;
  yearsOfExperience?: string;
  jobApplicationLink?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const {
      purchaseId,
      templateId,
      resumeUrl,
      resumeText,
      linkedInUrl,
      careerGoal,
      selfIntroNotes,
      yearsOfExperience,
      jobApplicationLink,
    } = body;

    if (!purchaseId || !templateId) {
      return NextResponse.json(
        { error: "Missing required fields: purchaseId, templateId" },
        { status: 400 }
      );
    }

    // 1. Verify Purchase
    let purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase) {
      purchase = await prisma.purchase.findUnique({
        where: { gatewayTransactionId: purchaseId },
      });
    }

    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    if (purchase.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `Payment for this purchase is in status: ${purchase.status}` },
        { status: 400 }
      );
    }

    const purchasedMockInterview =
      purchase.serviceName.toLowerCase().includes("ai mock interview") ||
      purchase.serviceName.toLowerCase().includes("mock interview");

    if (!purchasedMockInterview) {
      return NextResponse.json(
        { error: "This purchase does not include an AI Mock Interview service." },
        { status: 400 }
      );
    }

    // 2. Look up if already active
    let application = await prisma.candidateApplication.findFirst({
      where: { purchaseId: purchase.id },
      select: candidateApplicationSafeSelect,
    });

    if (application) {
      // Retrieve raw token if possible (we can't since it's hashed, but we can generate a new one if it's expired,
      // or return the success. For now, since they already activated it, they should have the link or we can regenerate)
      const accessToken = generateInterviewAccessToken();
      const accessTokenHash = hashInterviewAccessToken(accessToken);
      const accessTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      application = await prisma.candidateApplication.update({
        where: { id: application.id },
        data: {
          accessTokenHash,
          accessTokenExpiresAt,
        },
        select: candidateApplicationSafeSelect,
      });

      const interviewLink = buildAppUrl(`/interview/${accessToken}`);
      return NextResponse.json({ success: true, interviewLink });
    }

    // 3. Verify Template
    const template = await prisma.interviewTemplate.findUnique({
      where: { id: templateId, isActive: true },
    });

    if (!template) {
      return NextResponse.json({ error: "Interview template not found" }, { status: 404 });
    }

    // 4. Activate application & link to purchase
    const accessToken = generateInterviewAccessToken();
    const accessTokenHash = hashInterviewAccessToken(accessToken);
    const accessTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const candidateEmailLower = purchase.candidateEmail.trim().toLowerCase();

    application = await prisma.candidateApplication.create({
      data: {
        templateId: template.id,
        purchaseId: purchase.id,
        candidateName: purchase.candidateName.trim(),
        candidateEmail: candidateEmailLower,
        candidatePhone: purchase.candidatePhone || null,
        linkedInUrl: linkedInUrl || null,
        resumeUrl: resumeUrl || null,
        resumeText: resumeText || null,
        interviewPreference: "AI",
        careerGoal: careerGoal || null,
        selfIntroNotes: selfIntroNotes || null,
        yearsOfExperience: yearsOfExperience || null,
        jobApplicationLink: jobApplicationLink || null,
        accessTokenHash,
        accessTokenExpiresAt,
        status: "AI_INVITED",
      },
    });

    const interviewLink = buildAppUrl(`/interview/${accessToken}`);

    // 5. Send confirmation emails
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
      console.error("Failed to send activation emails:", emailErr);
    }

    return NextResponse.json({ success: true, interviewLink });
  } catch (error: any) {
    console.error("Error activating bundle mock interview:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
