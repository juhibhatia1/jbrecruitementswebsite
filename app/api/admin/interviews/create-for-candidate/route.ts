import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";
import { EMPLOYEE_SESSION_COOKIE, isValidEmployeeSessionToken } from "@/lib/employee-auth";
import { generateInterviewAccessToken, hashInterviewAccessToken } from "@/lib/interview/access-token";
import { sendInterviewInvitationEmail } from "@/lib/emailService";
import { buildAppUrl } from "@/lib/app-url";
import { extractTextFromFile } from "@/lib/rag/document-parsers";

const TEMPLATE_MODEL = process.env.OPENAI_TEMPLATE_MODEL || "gpt-4o";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    const employeeToken = cookieStore.get(EMPLOYEE_SESSION_COOKIE)?.value;

    const isAdmin = isValidAdminSessionToken(adminToken);
    const isEmployee = isValidEmployeeSessionToken(employeeToken);

    if (!isAdmin && !isEmployee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let candidateName = "";
    let candidateEmail = "";
    let candidatePhone = "";
    let linkedInUrl = "";
    let interviewPreference: "AI" | "MANUAL" = "AI";
    let templateId = "";
    let jobRole = "";
    let experienceLevel = "Mid Level";
    let difficultyLevel = "Medium";
    let durationMinutes = 30;
    let jobDescription = "";
    let careerGoal = "";
    let focusAreas = "";
    let resumeText = "";
    let paymentUtr = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      candidateName = String(formData.get("candidateName") || "").trim();
      candidateEmail = String(formData.get("candidateEmail") || "").trim().toLowerCase();
      candidatePhone = String(formData.get("candidatePhone") || "").trim();
      linkedInUrl = String(formData.get("linkedInUrl") || "").trim();
      interviewPreference = formData.get("interviewPreference") === "MANUAL" ? "MANUAL" : "AI";
      templateId = String(formData.get("templateId") || "").trim();
      jobRole = String(formData.get("jobRole") || "").trim();
      experienceLevel = String(formData.get("experienceLevel") || "Mid Level").trim();
      difficultyLevel = String(formData.get("difficultyLevel") || "Medium").trim();
      durationMinutes = Number(formData.get("durationMinutes") || 30);
      jobDescription = String(formData.get("jobDescription") || "").trim();
      careerGoal = String(formData.get("careerGoal") || "").trim();
      focusAreas = String(formData.get("focusAreas") || "").trim();
      paymentUtr = String(formData.get("paymentUtr") || "").trim();

      const resumeFile = formData.get("resume") as File | null;
      if (resumeFile && resumeFile.size > 0) {
        try {
          const buffer = Buffer.from(await resumeFile.arrayBuffer());
          resumeText = await extractTextFromFile(buffer, resumeFile.name);
        } catch (err) {
          console.warn("Failed to extract resume text from uploaded file:", err);
        }
      }
    } else {
      const body = await request.json();
      candidateName = String(body.candidateName || "").trim();
      candidateEmail = String(body.candidateEmail || "").trim().toLowerCase();
      candidatePhone = String(body.candidatePhone || "").trim();
      linkedInUrl = String(body.linkedInUrl || "").trim();
      interviewPreference = body.interviewPreference === "MANUAL" ? "MANUAL" : "AI";
      templateId = String(body.templateId || "").trim();
      jobRole = String(body.jobRole || "").trim();
      experienceLevel = String(body.experienceLevel || "Mid Level").trim();
      difficultyLevel = String(body.difficultyLevel || "Medium").trim();
      durationMinutes = Number(body.durationMinutes || 30);
      jobDescription = String(body.jobDescription || "").trim();
      careerGoal = String(body.careerGoal || "").trim();
      focusAreas = String(body.focusAreas || "").trim();
      resumeText = String(body.resumeText || "").trim();
      paymentUtr = String(body.paymentUtr || "").trim();
    }

    if (!candidateName || !candidateEmail) {
      return NextResponse.json(
        { error: "Candidate Name and Candidate Email are required." },
        { status: 400 }
      );
    }

    let template = null;

    // 1. If existing template selected
    if (templateId && templateId !== "custom") {
      template = await prisma.interviewTemplate.findUnique({
        where: { id: templateId },
      });
    }

    // 2. If custom role or custom JD provided, generate custom template via AI
    if (!template) {
      const roleName = jobRole || "Software Engineer";
      
      if (jobDescription.length >= 20 && process.env.OPENAI_API_KEY) {
        try {
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          const promptText = `You are a senior technical recruiter. Design a ${durationMinutes}-minute mock interview structure for role "${roleName}" (${experienceLevel}, ${difficultyLevel}).
Job Description:
${jobDescription}
Resume:
${resumeText || "Not provided"}

Respond ONLY with valid JSON:
{
  "interviewDescription": "2-3 sentence overview",
  "techStack": ["skill1", "skill2"],
  "requiredSkills": ["skill1", "skill2"],
  "systemInstructions": "Full system prompt for AI interviewer"
}`;

          const response = await openai.chat.completions.create({
            model: TEMPLATE_MODEL,
            messages: [{ role: "user", content: promptText }],
          });

          const rawContent = response.choices[0]?.message?.content || "";
          const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            template = await prisma.interviewTemplate.create({
              data: {
                ownerRole: isAdmin ? "ADMIN" : "EMPLOYEE",
                jobRole: roleName,
                experienceLevel,
                difficultyLevel,
                durationMinutes,
                techStack: Array.isArray(parsed.techStack) ? parsed.techStack : [roleName],
                requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [roleName],
                interviewDescription: parsed.interviewDescription || `Mock interview for ${roleName}`,
                systemInstructions: parsed.systemInstructions || `You are an AI interviewer for ${roleName}.`,
                isActive: true,
              },
            });
          }
        } catch (aiErr) {
          console.warn("AI custom template creation warning, fallback used:", aiErr);
        }
      }

      // Fallback active template if AI generation omitted or failed
      if (!template) {
        template = await prisma.interviewTemplate.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        });

        if (!template) {
          template = await prisma.interviewTemplate.create({
            data: {
              ownerRole: isAdmin ? "ADMIN" : "EMPLOYEE",
              jobRole: roleName,
              experienceLevel,
              techStack: [roleName],
              requiredSkills: ["Technical Competency"],
              durationMinutes,
              difficultyLevel,
              interviewDescription: `Mock interview for ${roleName}`,
              systemInstructions: `You are an expert AI interviewer conducting a technical interview for a ${roleName} position.`,
              isActive: true,
            },
          });
        }
      }
    }

    const finalRole = jobRole || template.jobRole;
    const serviceName = interviewPreference === "AI"
      ? `AI Mock Interview: ${finalRole}`
      : `Coach Mock Interview: ${finalRole}`;

    // Create Purchase Record
    const purchase = await prisma.purchase.create({
      data: {
        candidateName,
        candidateEmail,
        candidatePhone: candidatePhone || null,
        serviceName,
        amount: 0,
        currency: "USD",
        stripePaymentIntentId: `manual_upi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        status: "COMPLETED",
        mockInterviewStatus: interviewPreference === "AI" ? "INVITED" : "PENDING_SCHEDULE",
        completionNotes: JSON.stringify({
          jobRole: finalRole,
          experienceLevel,
          difficultyLevel,
          yearsOfExperience: experienceLevel,
          focusAreas,
          careerGoal,
          paymentMethod: "UPI_QR_CODE",
          paymentUtr: paymentUtr || undefined,
          createdBy: isAdmin ? "ADMIN" : "EMPLOYEE",
        }),
      },
    });

    // Create CandidateApplication Record
    const accessToken = generateInterviewAccessToken();
    const accessTokenHash = hashInterviewAccessToken(accessToken);
    const accessTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const application = await prisma.candidateApplication.create({
      data: {
        templateId: template.id,
        candidateName,
        candidateEmail,
        candidatePhone: candidatePhone || null,
        linkedInUrl: linkedInUrl || null,
        resumeText: resumeText || null,
        careerGoal: careerGoal || null,
        focusAreas: focusAreas || null,
        yearsOfExperience: experienceLevel,
        interviewPreference,
        accessTokenHash,
        accessTokenExpiresAt,
        status: interviewPreference === "AI" ? "AI_INVITED" : "APPLIED",
        purchaseId: purchase.id,
      },
    });

    const interviewLink = buildAppUrl(`/interview/${accessToken}`);
    const bookingLink = buildAppUrl(`/payment/success?payment_intent=${purchase.stripePaymentIntentId}`);

    // Send Invitation Email to Candidate
    let emailSent = false;
    try {
      await sendInterviewInvitationEmail({
        candidateName,
        candidateEmail,
        jobRole: finalRole,
        interviewPreference,
        interviewLink,
        bookingLink,
        interviewDescription: template.interviewDescription || undefined,
        durationMinutes: template.durationMinutes,
        yearsOfExperience: experienceLevel,
        interviewBrief: focusAreas || undefined,
      });
      emailSent = true;
    } catch (emailErr) {
      console.error("Failed to send candidate interview invitation email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? `Interview created and invitation email sent to ${candidateEmail}`
        : `Interview created for ${candidateEmail} (email delivery pending)`,
      emailSent,
      interviewLink: interviewPreference === "AI" ? interviewLink : bookingLink,
      purchaseId: purchase.id,
      applicationId: application.id,
    });
  } catch (error: any) {
    console.error("Error creating candidate interview:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create candidate interview" },
      { status: 500 }
    );
  }
}
