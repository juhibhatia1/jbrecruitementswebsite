import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin-auth";

type RouteContext = { params: Promise<{ id: string }> };

function buildGenerationPrompt(template: {
  jobRole: string;
  experienceLevel: string;
  techStack: string[];
  requiredSkills: string[];
  durationMinutes: number;
  difficultyLevel: string;
  advancedConfig: unknown;
}): string {
  const advanced = template.advancedConfig as Record<string, unknown> | null;

  return `You are a senior technical recruiter designing an AI voice interview.

Generate two outputs for the following role configuration:

ROLE: ${template.jobRole}
EXPERIENCE LEVEL: ${template.experienceLevel}
TECH STACK: ${template.techStack.join(", ") || "General"}
REQUIRED SKILLS: ${template.requiredSkills.join(", ") || "General"}
DURATION: ${template.durationMinutes} minutes
DIFFICULTY: ${template.difficultyLevel}
${advanced?.technicalCompetencies ? `TECHNICAL COMPETENCIES: ${advanced.technicalCompetencies}` : ""}
${advanced?.behaviouralCompetencies ? `BEHAVIOURAL COMPETENCIES: ${advanced.behaviouralCompetencies}` : ""}
${advanced?.specificQuestions ? `SPECIFIC QUESTIONS TO INCLUDE: ${advanced.specificQuestions}` : ""}
${advanced?.evaluationCriteria ? `EVALUATION CRITERIA: ${advanced.evaluationCriteria}` : ""}
${advanced?.passingThreshold ? `PASSING THRESHOLD: ${advanced.passingThreshold}` : ""}
${advanced?.languagePreference ? `LANGUAGE: ${advanced.languagePreference}` : ""}
${advanced?.areasToEmphasize ? `AREAS TO EMPHASIZE: ${advanced.areasToEmphasize}` : ""}
${advanced?.areasToAvoid ? `AREAS TO AVOID: ${advanced.areasToAvoid}` : ""}

OUTPUT FORMAT (respond with valid JSON only, no markdown):
{
  "interviewDescription": "<2-3 sentence candidate-facing description of what to expect. Warm, professional tone. Mention duration and key focus areas. Do not mention scoring.>",
  "systemInstructions": "<Detailed system prompt for the AI voice interviewer. Include: role as professional interviewer, specific topics to cover, question count (4-6 questions), progression from easier to harder, how to evaluate each answer, how to use the save_interview_event tool after each Q&A, how to use finalize_interview_report when done. Be precise and directive.>"
}`;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const template = await prisma.interviewTemplate.findUnique({
      where: { id, ownerRole: "ADMIN" },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured." }, { status: 500 });
    }

    const genai = new GoogleGenAI({ apiKey });
    const prompt = buildGenerationPrompt(template);

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.4 },
    });

    const rawText = response.text ?? "";

    let parsed: { interviewDescription: string; systemInstructions: string };
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      parsed = JSON.parse(jsonMatch[0]) as typeof parsed;
    } catch {
      return NextResponse.json(
        { error: "AI returned an unexpected response format. Please try again." },
        { status: 502 },
      );
    }

    if (!parsed.interviewDescription || !parsed.systemInstructions) {
      return NextResponse.json(
        { error: "AI response was incomplete. Please try again." },
        { status: 502 },
      );
    }

    const updated = await prisma.interviewTemplate.update({
      where: { id },
      data: {
        interviewDescription: parsed.interviewDescription,
        systemInstructions: parsed.systemInstructions,
        isActive: true,
      },
    });

    return NextResponse.json({ template: updated });
  } catch (error) {
    console.error("Template generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate interview instructions." },
      { status: 500 },
    );
  }
}
