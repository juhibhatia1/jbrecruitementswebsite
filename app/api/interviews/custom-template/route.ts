import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { getClientIp, isRateLimited } from "@/lib/rate-limiter";

const TEMPLATE_MODEL = process.env.OPENAI_TEMPLATE_MODEL || "gpt-4o";

interface RequestBody {
  jobRole: string;
  experienceLevel: string;
  difficultyLevel: string;
  durationMinutes?: number;
  jobDescription: string;
  resumeText?: string;
  interviewPrepPurchaseId?: string;
}

function buildCustomJdPrompt(params: RequestBody, duration: number, prepText?: string | null): string {
  const introMins = Math.max(2, Math.round(duration * 0.12));
  const outroMins = Math.max(1, Math.round(duration * 0.05));
  const coreMins = duration - introMins - outroMins;
  const isShort = duration <= 10;

  return `You are a senior technical recruiter. Your task is to design an interview structure and complete system instructions prompt for a custom mock interview based on the candidate's target Job Role and Job Description (JD) below.

JOB ROLE: ${params.jobRole}
EXPERIENCE LEVEL: ${params.experienceLevel}
DIFFICULTY: ${params.difficultyLevel}
DURATION: ${duration} minutes

JOB DESCRIPTION (JD):
${params.jobDescription}

CANDIDATE RESUME:
${params.resumeText?.trim() || "Not provided"}

${prepText ? `INTERVIEW PREP CONTEXT (PRIORITY FOCUS):
${prepText.trim()}
` : ""}
INSTRUCTIONS:
1. Design 3-4 interview sections tailored specifically to test the core skills, tech stack, and responsibilities outlined in the Job Description, incorporating the Interview Prep Context heavily if provided.
2. Extract the key technologies/tools (up to 6) as "techStack".
3. Extract the key required skills (up to 6) as "requiredSkills".
4. Generate a warm, professional, candidate-facing description (2-3 sentences) summarizing the interview focus.
5. Create a complete, detailed set of system instructions for an AI voice interviewer that will conduct this interview.
6. The experience level and difficulty level are mandatory inputs and must directly shape the question depth, section pacing, and follow-up intensity.
7. Make the interview purely personalized using the JD, the resume, the selected experience level, the selected difficulty level, and the Interview Prep Context (if provided). Do not generate a generic interview.

The systemInstructions value must contain ALL of these sections in order:

IDENTITY:
You are a professional AI mock interviewer for JB Recruitment Solutions conducting a ${duration}-minute mock interview for ${params.jobRole} (${params.experienceLevel} level).

OPENING:
1. Greet the candidate warmly, introduce yourself as the AI interviewer, state the role name and total duration.
2. Immediately call show_reference_card with title="Interview Structure" and content = a markdown table with two columns (Section | What it covers), listing each of your designed sections with a one-line description. After the call say: "I've shared today's interview structure on your screen — take a moment to look it over."
3. Ask: "Whenever you're ready, just say 'ready' or 'let's begin' and we'll kick things off." Wait for the candidate's explicit confirmation before doing anything else.
4. Once the candidate confirms they're ready: ask them to introduce themselves — name, current or most recent role, years of relevant experience, and a brief background summary. Wait for their full response before moving to Section 1.

SECTION PLAN:
Format each designed section as:
SECTION [N] — [Name]
Topics: [list the specific topics and sub-topics]
Depth: [foundational / intermediate / advanced per topic as appropriate]
If code snapshot fits: "Code snapshot: MANDATORY — call show_reference_card with a realistic [language] code snippet BEFORE asking the question. Use language-idiomatic patterns: common pitfalls, standard library misuse, subtle bugs, or output prediction scenarios relevant to the tech stack. Ask 1-2 code snapshot questions in this section."
If no snapshot: omit the code snapshot line entirely.
Announce each section: "Let's move on to Section [N] — [name]."

TIME MANAGEMENT:
Total: ${duration} min. Core Q&A must fill all ${coreMins} min.${isShort
    ? ` This is a short interview. Move to the next topic after each satisfactory answer. Follow-up probes are OPTIONAL — use only if the answer was clearly incomplete, vague, or contradictory.`
    : ` Follow-up probes are not mandatory — use them when answer depth, remaining time, and section scope call for it. If all topics are covered and time remains, go deeper on earlier answers: "You mentioned [X] — walk me through a scenario where you had to [related challenge]."`
  } Never close the interview before ${duration - outroMins} minutes have elapsed. If all planned topics are exhausted before time is up, NEVER end early — instead probe deeper. Treat ${duration} minutes as target duration, not a hard cut-off.
  Keep each section active for its allocated time budget. Do not leave a section too early just because a few questions were answered quickly.
  Maintain strong question density for the full duration (for a 30-minute interview, aim roughly 14-18 substantive questions across all sections, adapting to answer depth).
  After reaching ${duration} minutes, enter graceful completion mode:
• If candidate is speaking, never interrupt; wait for the answer to complete.
• If current section is nearly complete or mandatory objectives remain, finish them before closing.
• Maximum grace extension is 5 minutes beyond ${duration}.
When you receive timing signals, follow them strictly:
• TIME_SIGNAL:30_SECONDS_REMAINING → tighten pacing and prepare wrap-up naturally.
• TIME_SIGNAL:DURATION_COMPLETE → scheduled duration is complete; do not end abruptly, finish naturally.
• TIME_SIGNAL:HARD_STOP_REACHED → close professionally after essential final point.
If section questions are exhausted before TIME_SIGNAL:DURATION_COMPLETE, generate new high-signal questions dynamically and continue.
You may provide short teaching feedback after acknowledgment when answers are weak, but keep it brief and continue questioning.

PERSONALIZATION:
During the candidate's introduction, note their specific technologies, companies, projects, and experience level. Reference these explicitly when introducing topics: "You mentioned working with [tech] at [company] — with that in mind, how would you approach [topic]?"
Use the candidate's resume content and the JD to calibrate difficulty, probing depth, and examples.

ENGAGEMENT RULES:
• Strong, detailed answer: acknowledge the specific point — "Solid approach, especially the part about [X]."
• Incomplete or vague answer: probe immediately — "Can you expand on that? Specifically the [unclear part]."
• Interesting detail: follow up — "You mentioned [X] — tell me more about how that worked in practice."
• Standard correct answer: vary your acknowledgment — rotate "Got it" / "Makes sense" / "Good point" / "Interesting" — never repeat the same phrase twice in a row.
• Wrong or confused answer: rephrase rather than correct — "Let me reframe that — [different angle of the same question]."
• One topic per turn — NEVER ask multiple unrelated questions in the same response. One question at a time.

TOOL RULES:
Available tools: show_reference_card, finalize_interview_report, generate_section_questions.
show_reference_card — use whenever structured visual content genuinely helps the candidate.
finalize_interview_report — call ONCE, only at the very end after the verbal closing. Never call it mid-interview.
generate_section_questions — call when planned questions are exhausted before TIME_SIGNAL:DURATION_COMPLETE. Request mixed formats (NORMAL, MCQ, CODE_SNIPPET, GRAPHICAL) and use returned questions.
ABSOLUTE RULE: Never narrate or acknowledge tool calls to the candidate. Tool calls are completely invisible — continue speaking naturally as if the call never happened.

CLOSING SEQUENCE:
After all sections are complete AND at least ${duration - outroMins} minutes have elapsed (whichever is later): thank the candidate sincerely, give a 2-3 sentence verbal summary of the topics covered, wish them well. Then — and only then — call finalize_interview_report. Never call it early.

You MUST return your output as a single, valid JSON object with the following keys. Do NOT wrap in markdown or code fences:
{
  "interviewDescription": "<2-3 sentence description summarizing focus of this custom JD mock interview.>",
  "techStack": ["<extracted tech 1>", "<extracted tech 2>", ...],
  "requiredSkills": ["<extracted skill 1>", "<extracted skill 2>", ...],
  "systemInstructions": "<COMPLETE system instructions prompt compiled exactly as specified above.>"
}
`;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  // Rate limit: max 5 custom templates generated per hour per IP
  if (isRateLimited(ip, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in an hour." },
      { status: 429 }
    );
  }

  try {
    const body = (await request.json()) as RequestBody;
    const { jobRole, experienceLevel, difficultyLevel, jobDescription, resumeText } = body;

    if (!jobRole || !experienceLevel || !difficultyLevel || !jobDescription || !resumeText) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: jobRole, experienceLevel, difficultyLevel, jobDescription, resumeText",
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI integration is not configured on the server." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });
    const durationMinutes = body.durationMinutes && body.durationMinutes >= 10 && body.durationMinutes <= 120 ? body.durationMinutes : 30;

    let prepText: string | null = null;
    if (body.interviewPrepPurchaseId) {
      const purchase = await prisma.purchase.findFirst({
        where: {
          OR: [
            { id: body.interviewPrepPurchaseId },
            { stripePaymentIntentId: body.interviewPrepPurchaseId }
          ]
        },
        select: { interviewPrepText: true }
      });
      if (purchase?.interviewPrepText) {
        prepText = purchase.interviewPrepText;
      }
    }

    const prompt = buildCustomJdPrompt(body, durationMinutes, prepText);

    console.log(`[CustomJD] Querying OpenAI (${TEMPLATE_MODEL}) to parse JD for role: ${jobRole}`);
    const response = await openai.responses.create({
      model: TEMPLATE_MODEL,
      instructions:
        "You are a senior technical recruiter. Extract the tech stack, skills, description, and write a complete Gemini Live prompt for the custom JD. Output only valid JSON — no markdown, no code fences.",
      input: prompt,
    });

    const rawText = response.output_text ?? "";
    let parsed: {
      interviewDescription: string;
      techStack: string[];
      requiredSkills: string[];
      systemInstructions: string;
    };

    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in OpenAI response");
      // Model sometimes emits literal control chars (e.g. newline) inside JSON string values.
      // Walk char-by-char and escape them only when inside a string.
      let jsonStr = jsonMatch[0];
      let inStr = false, esc = false, sanitized = "";
      for (const ch of jsonStr) {
        if (esc) { esc = false; sanitized += ch; continue; }
        if (ch === "\\" && inStr) { esc = true; sanitized += ch; continue; }
        if (ch === '"') { inStr = !inStr; sanitized += ch; continue; }
        if (inStr && ch.charCodeAt(0) < 0x20) {
          const map: Record<string, string> = { "\n": "\\n", "\r": "\\r", "\t": "\\t", "\b": "\\b", "\f": "\\f" };
          sanitized += map[ch] ?? `\\u${ch.charCodeAt(0).toString(16).padStart(4, "0")}`;
        } else {
          sanitized += ch;
        }
      }
      parsed = JSON.parse(sanitized) as typeof parsed;
    } catch (parseError) {
      console.error("[CustomJD] OpenAI parsing failed for raw output:", rawText, parseError);
      return NextResponse.json(
        { error: "AI returned an unexpected response format. Please try again." },
        { status: 502 }
      );
    }

    if (
      !parsed.interviewDescription ||
      !parsed.systemInstructions ||
      !Array.isArray(parsed.techStack) ||
      !Array.isArray(parsed.requiredSkills)
    ) {
      return NextResponse.json(
        { error: "AI response was incomplete. Please try again." },
        { status: 502 }
      );
    }

    // Save custom template to Prisma DB
    console.log(`[CustomJD] Creating InterviewTemplate in database for custom role: ${jobRole}`);
    const template = await prisma.interviewTemplate.create({
      data: {
        ownerRole: "ADMIN",
        jobRole: jobRole.trim(),
        experienceLevel: experienceLevel.trim(),
        techStack: parsed.techStack.map(t => t.trim()),
        requiredSkills: parsed.requiredSkills.map(s => s.trim()),
        durationMinutes,
        difficultyLevel: difficultyLevel.trim(),
        interviewDescription: parsed.interviewDescription.trim(),
        systemInstructions: parsed.systemInstructions.trim(),
        isActive: true,
        advancedConfig: {
          isCustomJd: true,
          jobDescription: jobDescription.trim(),
          resumeText: resumeText.trim(),
          experienceLevel: experienceLevel.trim(),
          difficultyLevel: difficultyLevel.trim(),
        },
      },
    });

    return NextResponse.json({ templateId: template.id });
  } catch (error: unknown) {
    console.error("[CustomJD] Error generating custom template:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate custom interview template." },
      { status: 500 }
    );
  }
}

