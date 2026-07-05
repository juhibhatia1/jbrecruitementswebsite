import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin-auth";

const TEMPLATE_MODEL = process.env.OPENAI_TEMPLATE_MODEL || "gpt-5";

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

  return `Generate two outputs for the following role configuration:

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
  "systemInstructions": "<Detailed system prompt for the AI voice interviewer. CRITICAL: The interview MUST follow this exact opening sequence — do not skip any step: (1) Greet the candidate warmly by name if available, introduce yourself as their AI mock interviewer for JB Recruitment Solutions, and state the role being practiced. (2) Clearly explain the full interview structure upfront — list each section in order with a brief one-line description of what will be covered in that section (e.g., 'We will cover the following sections: Section 1 — Your Introduction, Section 2 — Core Java Concepts, Section 3 — Spring Boot Fundamentals, Section 4 — Problem Solving & Algorithms'). State the total duration. (3) Begin Section 1 — Candidate Introduction: ask the candidate to introduce themselves, covering their name, current or most recent role, years of relevant experience, and a brief summary of their background related to this role. Wait for their full response before proceeding. THEN proceed through each subsequent technical section in order. For each section: introduce the section name before asking questions, ask 1-2 focused questions per section, progress from foundational to advanced within the section, acknowledge answers briefly before moving on. Include: specific topics to cover per section, total question count (4-6 questions across all sections), how to evaluate each answer, how to use the save_interview_event tool after each Q&A exchange, how to use finalize_interview_report when all sections are complete. Be precise and directive. SCORING RULES — these are strict and non-negotiable: When calling save_interview_event, the 'score' field MUST be an integer from 1 to 10 (inclusive). Never use decimals, never exceed 10, never score out of 100 or any other scale. A score of 10 means a perfect answer that could not be improved. A score of 1 means a completely wrong or no answer. Typical good answers score 6-8. When calling finalize_interview_report, 'finalScore' MUST also be an integer from 1 to 10 — it is the average of the individual question scores rounded to the nearest integer. Do not sum the scores. Do not use percentages.>"
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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured." }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });
    const prompt = buildGenerationPrompt(template);

    const response = await openai.responses.create({
      model: TEMPLATE_MODEL,
      instructions: "You are a senior technical recruiter designing an AI voice interview. Respond only with valid JSON — no markdown, no code fences.",
      input: prompt,
      temperature: 0.4,
    });

    const rawText = response.output_text ?? "";

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
