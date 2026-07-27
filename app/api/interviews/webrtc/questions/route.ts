import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { hashInterviewToken } from "@/lib/interview/webrtc-session";

type QuestionType = "NORMAL" | "MCQ" | "CODE_SNIPPET" | "GRAPHICAL";

type QuestionRequest = {
  token?: string;
  sessionId?: string;
  sectionName?: string;
  topic?: string;
  difficulty?: string;
  count?: number;
  alreadyAskedQuestions?: string[];
  questionTypes?: string[];
  candidateContext?: string;
  elapsedMinutes?: number;
  remainingMinutes?: number;
};

type GeneratedQuestion = {
  type: QuestionType;
  question: string;
  options?: string[];
  referenceCardTitle?: string;
  referenceCardContent?: string;
};

function normalizeQuestionTypes(input?: string[]): QuestionType[] {
  if (!Array.isArray(input) || input.length === 0) {
    return ["NORMAL"];
  }
  const allowed: QuestionType[] = ["NORMAL", "MCQ", "CODE_SNIPPET", "GRAPHICAL"];
  const normalized = input
    .map((item) => String(item || "").trim().toUpperCase())
    .filter((item): item is QuestionType => allowed.includes(item as QuestionType));
  return normalized.length > 0 ? normalized : ["NORMAL"];
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as QuestionRequest;
    const token = body.token?.trim();
    const sessionId = body.sessionId?.trim();
    if (!token || !sessionId) {
      return NextResponse.json({ error: "Missing token or sessionId." }, { status: 400 });
    }

    const tokenHash = hashInterviewToken(token);
    const application = await prisma.candidateApplication.findUnique({
      where: { accessTokenHash: tokenHash },
      include: {
        template: true,
        session: true,
      },
    });

    if (!application || !application.session || application.session.id !== sessionId) {
      return NextResponse.json({ error: "Invalid interview session context." }, { status: 403 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured." }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });
    // Use a fast model for real-time question generation — gpt-4o-mini is sufficient
    // for generating interview questions mid-session and significantly faster than gpt-4o.
    const model = process.env.OPENAI_QUESTIONS_MODEL || process.env.OPENAI_TEMPLATE_MODEL || "gpt-4o-mini";
    const requestedTypes = normalizeQuestionTypes(body.questionTypes);
    const count = Math.min(4, Math.max(1, Math.floor(Number(body.count ?? 3))));
    const techStack = application.template.techStack?.join(", ") || "General";
    const requiredSkills = application.template.requiredSkills?.join(", ") || "General";

    const prompt = `Generate interview follow-up questions for a live technical interview.

Role: ${application.template.jobRole}
Experience Level: ${application.template.experienceLevel}
Difficulty: ${body.difficulty || application.template.difficultyLevel}
Section: ${body.sectionName || "Current section"}
Topic focus: ${body.topic || "Follow-up on covered concepts"}
Tech stack: ${techStack}
Required skills: ${requiredSkills}
Elapsed minutes: ${Number(body.elapsedMinutes ?? 0)}
Remaining minutes: ${Number(body.remainingMinutes ?? 0)}
Candidate context: ${body.candidateContext || "Use earlier answers and intro details"}
Candidate resume: ${application.resumeText?.trim() || "Not provided"}
Candidate career goal: ${application.careerGoal?.trim() || "Not specified"}
Already asked questions (DO NOT repeat or rephrase any of these): ${Array.isArray(body.alreadyAskedQuestions) && body.alreadyAskedQuestions.length > 0 ? body.alreadyAskedQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n") : "None"}
Requested question count: ${count}
Requested question types: ${requestedTypes.join(", ")}

Return JSON only:
{
  "questions": [
    {
      "type": "NORMAL|MCQ|CODE_SNIPPET|GRAPHICAL",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "referenceCardTitle": "Title for on-screen card when needed",
      "referenceCardContent": "Markdown card content for MCQ/CODE_SNIPPET/GRAPHICAL"
    }
  ]
}

Rules:
- Return exactly ${count} questions.
- PERSONALIZATION: If candidate resume is provided, at least half the questions should be anchored to specific details from that resume (actual projects, companies, technologies, job titles). Generic textbook questions are not acceptable when resume context is available.
- If a career goal is specified, at least one question should probe readiness or skills relevant to that goal.
- Keep questions high-signal and interview-grade.
- For MCQ questions, make referenceCardContent a well-structured markdown card that includes the exact question text and each option on its own line or in a markdown table. Do not compress options into a single sentence.
- For CODE_SNIPPET and GRAPHICAL questions, include referenceCardTitle and referenceCardContent with a clear title, the prompt, and any code/diagram content formatted as markdown.
- When a question has answer options, keep the exact question text in both the question field and the reference card content so the interviewer can refer back to it.
- For NORMAL questions, do not include options unless it is naturally MCQ.
- Keep code snippets realistic and concise; use markdown code fences in referenceCardContent.
- NEVER generate a question that is the same as, or a rephrasing of, any question in the "Already asked questions" list above.`;

    const response = await openai.responses.create({
      model,
      instructions:
        "You generate runtime interview follow-up questions. Respond with valid JSON only, no markdown fences.",
      input: prompt,
      temperature: 0.6,
    });

    const rawText = response.output_text ?? "";
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ questions: [] });
    }

    const parsed = JSON.parse(jsonMatch[0]) as { questions?: Array<Record<string, unknown>> };
    const questions: GeneratedQuestion[] = (parsed.questions || []).slice(0, count).map((item) => {
      const typeRaw = String(item.type || "NORMAL").toUpperCase();
      const type: QuestionType = normalizeQuestionTypes([typeRaw])[0];
      const options = Array.isArray(item.options) ? item.options.map((opt) => String(opt)) : undefined;
      return {
        type,
        question: String(item.question || "").trim(),
        options,
        referenceCardTitle: item.referenceCardTitle ? String(item.referenceCardTitle) : undefined,
        referenceCardContent: item.referenceCardContent ? String(item.referenceCardContent) : undefined,
      };
    }).filter((q) => q.question.length > 0);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Generate follow-up questions error:", error);
    return NextResponse.json({ error: "Failed to generate follow-up questions." }, { status: 500 });
  }
}
