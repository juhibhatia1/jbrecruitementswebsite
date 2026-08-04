import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { hashInterviewAccessToken } from "./access-token";
import { buildFallbackReport } from "./utils";
import type {
  InterviewEvaluationEvent,
  InterviewFinalReport,
  InterviewReferenceCard,
  InterviewTranscriptEntry,
} from "./types";
import { getMailerTransporter } from "@/lib/mailer";
import { escapeHtml } from "@/lib/security";
import { sendInterviewResultsToCandidate } from "@/lib/emailService";
import { buildAppUrl } from "@/lib/app-url";

type JsonValue = string | number | boolean | JsonObject | JsonArray;
type JsonArray = JsonValue[];
type JsonObject = { [key: string]: JsonValue };

function toJsonValue(value: unknown): JsonValue {
  return value as unknown as JsonValue;
}

const OPENAI_REALTIME_MODEL = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2";
const OPENAI_BLUEPRINT_MODEL =
  process.env.OPENAI_INTERVIEW_BLUEPRINT_MODEL ||
  process.env.OPENAI_TEMPLATE_MODEL ||
  "gpt-4o-mini";
const DEFAULT_VOICE = process.env.OPENAI_REALTIME_VOICE || "marin";

type InterviewBlueprintSection = {
  name: string;
  minutes: number;
  objective: string;
  questionBankTarget: number;
};

type InterviewBlueprintQuestion = {
  section: string;
  type: "NORMAL" | "MCQ" | "CODE_SNIPPET" | "GRAPHICAL";
  question: string;
  referenceCardTitle?: string;
  referenceCardContent?: string;
};

export type InterviewSessionBlueprint = {
  questionTarget: number;
  sections: InterviewBlueprintSection[];
  starterQuestions: InterviewBlueprintQuestion[];
};

const OPENAI_REALTIME_VOICES = [
  "alloy",
  "ash",
  "ballad",
  "cedar",
  "coral",
  "echo",
  "marin",
  "sage",
  "shimmer",
  "verse",
] as const;

export type OpenAIRealtimeVoice = (typeof OPENAI_REALTIME_VOICES)[number];

export function resolveRealtimeVoice(rawVoice?: string | null): OpenAIRealtimeVoice {
  const voice = String(rawVoice || DEFAULT_VOICE).trim();
  return OPENAI_REALTIME_VOICES.includes(voice as OpenAIRealtimeVoice)
    ? (voice as OpenAIRealtimeVoice)
    : "marin";
}

export function buildWebRtcSystemInstructions(payload: {
  role: string;
  experienceLevel: string;
  difficultyLevel?: string;
  techStack: string[];
  durationMinutes: number;
  baseInstructions: string;
  sessionBlueprint?: InterviewSessionBlueprint | null;
  transcript?: InterviewTranscriptEntry[];
  referenceCards?: InterviewReferenceCard[];
  isResuming?: boolean;
  resumeText?: string;
  jobDescription?: string;
  careerGoal?: string;
  focusAreas?: string;
  selfIntroNotes?: string;
}): string {
  const {
    role,
    experienceLevel,
    techStack,
    durationMinutes,
    baseInstructions,
    sessionBlueprint,
    transcript,
    referenceCards,
    isResuming,
    resumeText,
    difficultyLevel,
    jobDescription,
    careerGoal,
    focusAreas,
    selfIntroNotes,
  } = payload;
  const transcriptText = transcript && transcript.length > 0
    ? transcript
        .map((entry) => `${entry.role === "interviewer" ? "Interviewer" : "Candidate"}: ${entry.text}`)
        .join("\n")
    : "";
  const referenceCardsText = referenceCards && referenceCards.length > 0
    ? `

<previous_reference_cards>
${referenceCards
  .map((card) => {
    const optionsText = card.options && card.options.length > 0
      ? `\nOptions: ${card.options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`).join(" | ")}`
      : "";
    const questionText = card.question ? `\nQuestion: ${card.question}` : "";
    return `[${card.title}]${questionText}${optionsText}\n${card.content}`;
  })
  .join("\n\n")}
</previous_reference_cards>
Do NOT lose track of any question or options that were shown visually. When you refer back to a reference card, reuse its exact question text and options if present.
`
    : "";

  const resumeBlock = isResuming && transcriptText
    ? `

IMPORTANT — INTERVIEW RESUMPTION CONTEXT:
This interview session was interrupted and is now continuing. The following conversation has already taken place:

<previous_transcript>
${transcriptText}
</previous_transcript>

Do NOT repeat any questions or topics already covered. Do NOT re-introduce yourself or restart the interview. Continue naturally from where the conversation left off.

${referenceCardsText}
`
    : "";

  const resumeSection = resumeText?.trim()
    ? `
CANDIDATE RESUME PROFILE (IMPORTANT):
The candidate has provided their resume. Review this resume content and use it to ask personalized questions. Seamlessly connect the template questions and skills with the candidate's actual projects, job titles, and experiences listed in their resume:

<candidate_resume>
${resumeText.trim()}
</candidate_resume>
`
    : "";

  const blueprintBlock = sessionBlueprint
    ? `
INTERVIEW SESSION BLUEPRINT (PRECOMPUTED OUTSIDE REALTIME MODEL):
- Question target for this session: ${sessionBlueprint.questionTarget}
- Section plan:
${sessionBlueprint.sections.map((section, index) => `  ${index + 1}. ${section.name} (${section.minutes} min, question bank ${section.questionBankTarget}) — ${section.objective}`).join("\n")}
- Starter question bank:
${sessionBlueprint.starterQuestions.map((q, index) => `  ${index + 1}. [${q.section}] [${q.type}] ${q.question}`).join("\n")}

Use this blueprint as your primary starting plan. Adapt naturally to candidate responses, but preserve section coverage and pacing. If starter questions exhaust before duration-complete, call generate_section_questions.
`
    : "";

  const candidateContextBlock = [
    careerGoal?.trim()
      ? `CAREER GOAL: "${careerGoal.trim()}". Frame at least 1-2 questions around readiness for this specific goal. Acknowledge this context naturally during the interview (e.g. "Given that you're aiming to ${careerGoal.trim().toLowerCase()}, let me ask...").`
      : "",
    focusAreas?.trim()
      ? `REQUESTED FOCUS AREAS: ${focusAreas.trim()}. Prioritise questions in these areas when they fit naturally within section pacing.`
      : "",
    selfIntroNotes?.trim()
      ? `CANDIDATE'S PERSONAL CONTEXT: ${selfIntroNotes.trim()}. Be sensitive and supportive — acknowledge career gaps, transitions, or personal circumstances positively. Never make the candidate feel judged for these.`
      : "",
  ].filter(Boolean).join("\n\n");

  const dynamicGuidelines = `

ADDITIONAL OPERATIONAL BEHAVIORAL INSTRUCTIONS:
- You are a highly professional, rigorous, and intelligent technical interviewer.
- Do NOT be overly generous. If the candidate answers poorly, gives a flat out incorrect explanation, or is too vague, do not ignore it. Politely and positively correct them, or guide them with constructive hints to help them perform better and learn.
- Listen carefully to the candidate's answers. Respond with intelligence, depth, and clarity, directly addressing what the candidate actually said rather than blindly moving to the next scripted question.
- Do not let the candidate get away with basic surface-level definitions; dig deeper if necessary.
- Maintain a warm, encouraging, but rigorous and professional tone.
- When the candidate gives their introduction/self-introduction, ONLY respond with a brief acknowledgment after they have spoken a substantive response that includes their name AND their role. The acknowledgment must reference something specific they actually said (a project, their company, a technology, years of experience). Never say "Nice background" or "Great background" as a generic opener — make it specific to what they told you. If their response was vague or incomplete, ask a targeted follow-up before moving to Section 1.
- If the candidate interrupts you mid-answer with a short phrase like "sorry", "wait", "hold on", "continue", "never mind", "go ahead", or any other non-substantive utterance that is clearly not an answer to the current question — do NOT treat it as an answer. Simply re-ask the same question you were on.
- Noise/unclear-audio & Language constraints: only conduct this interview in English. If a transcript looks like background noise, random words, non-English words, foreign language, or unclear speech, do NOT treat it as a valid answer. Ask for clarification once in English (e.g., "I may have caught background noise — could you please repeat that in English?") and continue only after a coherent response.
- MANDATORY OPENING SEQUENCE: When the interview starts, you MUST: (1) greet the candidate warmly by name, (2) immediately call show_reference_card with title="Interview Structure" and a markdown table listing your planned sections, (3) say "I've shared today's interview structure on your screen — take a moment to look it over. Whenever you're ready, please introduce yourself with your name, your current or most recent role, years of relevant experience, and a brief background summary.", (4) WAIT — do not say anything else, do not ask a technical question, do not acknowledge "background" — until the candidate has spoken a real introduction containing their name and role. If the first response you receive is a short noise phrase, a single word, or clearly not an introduction, re-ask the introduction prompt once and wait again.
- show_reference_card tool: Use it whenever structured visual content helps — interview structure at opening (MANDATORY), coding problems (show before asking), comparison tables, cheat sheets. Call it silently without narrating the call.
- TIME VOLUNTARY MANAGEMENT (preserve every existing interview rule, section rule, and coding-question minimum): Treat ${durationMinutes} minutes as the target interview duration and continue interviewing until you receive the explicit duration-complete timing signal. Never end early just because your initial section plan finished; if time remains, continue with contextual follow-ups from the candidate's projects, technologies, and earlier answers.
- For each section, keep the section active for its planned time budget. Do not move to the next section too early just because one or two questions were answered quickly.
- Maintain adequate question density for the full interview duration. If pace drops or question count is too low, ask the next high-signal question promptly.
- SECTION EXECUTION PROTOCOL: treat each section's minute allocation as mandatory pacing guidance. Before moving to next section, ensure the active section consumed its intended time window. If section objectives are exhausted early, call generate_section_questions for that same section and continue until section time target is met.
- TRANSITION GATE: before announcing a section transition or any wrap-up language, verify all active section pacing constraints are satisfied. Never say closing phrases early and then continue interviewing afterward.
- Keep mandatory constraints intact: if coding/code-snippet minimums, required sections, or recruiter-configured must-cover topics are still pending, prioritize and complete them before closing.
- At or after target time: do NOT interrupt the candidate mid-answer. Let them finish naturally, then close gracefully if objectives are complete.
- Grace window: You may extend up to 5 additional minutes only to finish an in-progress answer, complete the active section, or cover remaining mandatory objectives. Do not open brand-new broad sections during grace.
- You may receive orchestration notes such as TIME_SIGNAL:30_SECONDS_REMAINING, TIME_SIGNAL:DURATION_COMPLETE, and TIME_SIGNAL:HARD_STOP_REACHED. Follow them strictly: acknowledge briefly when appropriate, tighten pacing, and conclude professionally once the current answer/essential final point is complete.
- If a section runs out of useful questions before duration-complete, call generate_section_questions to get new runtime questions. Ask a balanced mix of NORMAL, MCQ, CODE_SNIPPET, and GRAPHICAL questions as appropriate for the role and section.
- For MCQ, CODE_SNIPPET, and GRAPHICAL questions, use show_reference_card to present the prompt/options/snippet on screen before asking.
- When showing an MCQ, include the exact question text in both the verbal question and the show_reference_card payload, and pass the answer choices in the tool call's options field so the card renders in a structured way.
- You may give short teaching feedback after acknowledging answers, but keep it concise and return quickly to the next question so pacing stays on target.
- Never ask "Do you have any questions for me?" until duration-complete is reached and mandatory section/time/question objectives are satisfied (unless hard-stop mode is active). CRITICAL: Once you ask this closing question and the candidate responds, you MUST call finalize_interview_report immediately. Do NOT go back to asking technical questions after asking the closing question.
- FINAL CLOSING WINDOW RULE: Ask "Do you have any questions for me/about the role/company?" ONLY ONCE, and only in the final minute of the scheduled duration or after TIME_SIGNAL:DURATION_COMPLETE. Asking it earlier is strictly forbidden. After the candidate answers this question, finalize immediately.
- REFERENCE CARD MANDATORY USAGE: You MUST call show_reference_card for at least 2-3 questions during the interview. Use it for: (a) Any MCQ question — show options on screen, (b) Any code snippet question — show the code block, (c) Any comparison or table question. Call show_reference_card BEFORE verbally asking the question so the candidate can read it.
- On every save_interview_event call, include the active section name in sectionName so runtime pacing can be tracked correctly.

SCORING CALIBRATION (critical — you must follow this):
- A correct answer with solid understanding = 7–9. Do NOT score it 5–6.
- Reserve scores below 5 strictly for wrong answers or deeply confused responses.
- When in doubt between two score bands, round UP — this is a mock interview to help the candidate improve, not a gatekeeping exam.
- Score what the candidate actually demonstrated, not what a perfect textbook answer would look like.
- Score guide: 9–10 = correct, well-articulated, real-world depth; 7–8 = correct with solid understanding, minor gaps fine; 5–6 = partial understanding, notable gaps; 3–4 = mostly wrong or very vague; 1–2 = no meaningful attempt.

REPORT GENERATION (when calling finalize_interview_report):
- summary: Write in a supportive, constructive tone. Acknowledge what the candidate did well first, then frame gaps as growth opportunities. The candidate should feel motivated to improve, not discouraged.
- sectionScores: Include one entry per section from the interview blueprint. Score each section 1–5 (1=poor, 2=below average, 3=average, 4=good, 5=excellent) based on the candidate's overall performance in that section.
- encouragementLine: Write one specific, genuine positive sentence about this candidate. Reference something real from the interview — a strong answer, clear communication, good project knowledge, or enthusiasm. Never write generic filler like "You did a great job!" — make it specific to what this candidate actually demonstrated. Even a below-average candidate has shown something worth genuinely acknowledging.
`;

  return `${baseInstructions}

IDENTITY
You are a professional AI mock interviewer for JB Recruitment Solutions conducting a live ${durationMinutes}-minute mock interview for ${role} (${experienceLevel} level).
Difficulty level: ${difficultyLevel || "standard"}.
Job description context: ${jobDescription?.trim() || "Not provided"}.

OPENING — follow this exact sequence, no steps skipped:
1. Greet the candidate warmly, introduce yourself as the AI interviewer, state the role name and total duration.
2. Immediately call show_reference_card with title="Interview Structure" and content = a markdown table with two columns (Section | What it covers), listing each of your designed sections with a one-line description. After the call say: "I've shared today's interview structure on your screen — take a moment to look it over."
3. Ask: "Whenever you're ready, please introduce yourself — your name, your current or most recent role, years of relevant experience, and a brief background summary." Then stop and wait silently.
4. HARD GATE — do NOT proceed past this point until the candidate has spoken a real introduction that includes their name and role. If their response is only a noise phrase, a single word, or is missing their name/role, re-ask the introduction once: "Could you go ahead and introduce yourself — your name, role, and a bit of background?" Wait again. Only when you have received a substantive spoken introduction (name + role + some context) do you acknowledge it and move to Section 1.
5. Once a real introduction is received: respond with a brief genuine acknowledgment (1–2 sentences referencing something specific they said — a project, their role, or a technology they mentioned). Then immediately ask the first question of Section 1.

CRITICAL: Steps 1–4 are setup. The candidate's verbal introduction is step 5 input. Never conflate the two. The reference card display and your greeting are NOT the candidate's introduction.

PERSONALIZATION (CRITICAL — determines whether questions feel tailored or generic):
During the candidate's introduction and throughout the interview, actively reference their SPECIFIC technologies, project names, company names, job titles, and experiences. Never ask a generic textbook question when a personalised version anchored to their actual background is possible.
Core tech stack to keep in mind: ${techStack.join(", ") || "General"}.
${candidateContextBlock ? `\n${candidateContextBlock}\n` : ""}${resumeSection}
${blueprintBlock}

ENGAGEMENT RULES — react like a skilled human interviewer:
• Strong, detailed answer: acknowledge the specific point, add one useful depth note if it fits naturally.
• Incomplete or vague answer: probe immediately — ask for the one thing that's missing.
• Interesting detail: follow up with one question. It is fine to spend an extra turn here.
• Standard correct answer: vary your acknowledgment; keep it brief but genuine.
• Wrong or confused answer: rephrase rather than correct; give them a chance to self-correct first.
• One topic per turn — NEVER ask multiple unrelated questions in the same response.
• It is perfectly fine to not cover every planned question if the conversation goes deep on something valuable. The goal is a real interview feel, not a checklist.

TOOL RULES — absolute, no exceptions:
Available tools: show_reference_card, finalize_interview_report, save_interview_event, generate_section_questions.
show_reference_card — use whenever structured visual content genuinely helps the candidate.
finalize_interview_report — call ONCE, only at the very end after the verbal closing. Never call it mid-interview.
save_interview_event — call after each substantive question if you want to persist the candidate's response.
generate_section_questions — call when planned questions are exhausted before duration-complete. Request mixed question types and use the returned questions.
ABSOLUTE RULE: Never narrate or acknowledge tool calls to the candidate.

CLOSING SEQUENCE:
After all technical and behavioral sections are complete and before you end the interview: you MUST ask the candidate, "Do you have any questions for me?" or "Do you have any questions about the company or the role?".

Wait for their response. Then handle it as follows:

IF the candidate asks a genuine question (about the role, the company, the process, career growth, what the team looks like, etc.):
- Give a thoughtful, relevant answer. Treat it like a real interviewer would — engage with the question, give a concrete and helpful response. Do NOT rush past it with a one-liner just to get to finalize_interview_report.
- If they ask a follow-up question, answer that too before wrapping up.
- Only after their questions are genuinely answered do you move to closing remarks.

IF the candidate says they have no questions, or gives a short close like "no, I'm good" or "that's all":
- Acknowledge it warmly and move directly to closing remarks.

CLOSING REMARKS (after questions are handled):
Thank them sincerely. Give a brief verbal summary of the topics you covered. Wish them well. Then — and only then — call finalize_interview_report.

CRITICAL RULE: Once you ask "Do you have any questions?" and receive a response, you MUST NOT ask any more technical questions. This is a ONE-WAY gate. Going back to technical questions after this point is strictly forbidden.
${resumeBlock}
${dynamicGuidelines}`;
}

export function buildWebRtcOpeningPrompt(payload: {
  role: string;
  isResuming?: boolean;
}): string {
  if (payload.isResuming) {
    return `The candidate has reconnected after a brief interruption. Continue the ${payload.role} interview from where you left off — do not repeat questions already asked.`;
  }

  return `The candidate is ready. Please begin the interview for the ${payload.role} role, following your instructions — greet the candidate, introduce the interview structure, then proceed.`;
}

function computeQuestionTarget(durationMinutes: number): number {
  if (durationMinutes >= 30) return 15;
  if (durationMinutes >= 20) return 10;
  if (durationMinutes >= 15) return 8;
  if (durationMinutes >= 10) return 6;
  return 4;
}

function computePerSectionQuestionBankTarget(sectionCount: number): number {
  if (sectionCount <= 3) return 12;
  if (sectionCount === 4) return 9;
  return 7;
}

export async function createInterviewSessionBlueprint(payload: {
  apiKey: string;
  role: string;
  experienceLevel: string;
  techStack: string[];
  requiredSkills: string[];
  durationMinutes: number;
  difficultyLevel: string;
  baseInstructions: string;
  resumeText?: string;
  jobDescription?: string;
  careerGoal?: string;
  focusAreas?: string;
  selfIntroNotes?: string;
}): Promise<InterviewSessionBlueprint | null> {
  const openai = new OpenAI({ apiKey: payload.apiKey });
  const questionTarget = computeQuestionTarget(payload.durationMinutes);
  const prompt = `Create a runtime interview blueprint for a live technical interview.

Role: ${payload.role}
Experience level: ${payload.experienceLevel}
Difficulty: ${payload.difficultyLevel}
Duration: ${payload.durationMinutes} minutes
Tech stack: ${payload.techStack.join(", ") || "General"}
Required skills: ${payload.requiredSkills.join(", ") || "General"}
Target substantive question count: ${questionTarget}
Candidate resume: ${payload.resumeText?.trim() || "Not provided"}
Job description: ${payload.jobDescription?.trim() || "Not provided"}
Candidate career goal: ${payload.careerGoal?.trim() || "Not specified"}
Candidate requested focus areas: ${payload.focusAreas?.trim() || "None"}
Candidate personal context: ${payload.selfIntroNotes?.trim() || "None"}

Return valid JSON only:
{
  "questionTarget": ${questionTarget},
  "sections": [
    { "name": "Section name", "minutes": 8, "objective": "what this section should evaluate" }
  ],
  "starterQuestions": [
    {
      "section": "Section name",
      "type": "NORMAL|MCQ|CODE_SNIPPET|GRAPHICAL",
      "question": "question text",
      "referenceCardTitle": "optional title for structured questions",
      "referenceCardContent": "optional markdown content for MCQ/CODE_SNIPPET/GRAPHICAL"
    }
  ]
}

Rules:
- Create 3-4 sections with realistic minute splits summing approximately to ${payload.durationMinutes}.
- Create exactly ${questionTarget} starterQuestions distributed across sections.
- CRITICAL PERSONALIZATION: If a candidate resume is provided, at least 50% of starter questions MUST be directly anchored to specific details in that resume — reference actual project names, companies, job titles, technologies, or experiences the candidate mentions. Generic textbook questions are not acceptable when resume data is available.
- If a career goal is provided, include 1-2 questions specifically testing readiness for that goal (e.g. leadership/influence scenarios for "senior / leadership role", cross-domain knowledge for "Switch to this industry").
- If focus areas are requested by the candidate, include at least 1 question per focus area when it fits the role and section plan.
- Include a balanced type mix and at least one CODE_SNIPPET question if role/stack is coding-heavy.
- Keep questions concise and interview-grade.
- Align with this base instruction context:
<base_instructions>
${payload.baseInstructions}
</base_instructions>`;

  const response = await openai.responses.create({
    model: OPENAI_BLUEPRINT_MODEL,
    instructions:
      "You generate precomputed interview blueprints for runtime. Respond with valid JSON only.",
    input: prompt,
    temperature: 0.4,
  });

  const rawText = response.output_text ?? "";
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return null;
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    questionTarget?: number;
    sections?: Array<{ name?: string; minutes?: number; objective?: string }>;
    starterQuestions?: Array<{
      section?: string;
      type?: string;
      question?: string;
      referenceCardTitle?: string;
      referenceCardContent?: string;
    }>;
  };

  const sections: InterviewBlueprintSection[] = (parsed.sections || [])
    .map((section) => ({
      name: String(section.name || "").trim(),
      minutes: Math.max(1, Math.floor(Number(section.minutes || 0))),
      objective: String(section.objective || "").trim(),
      questionBankTarget: 0,
    }))
    .filter((section) => section.name && section.objective);

  const starterQuestions: InterviewBlueprintQuestion[] = (parsed.starterQuestions || [])
    .map((q) => {
      const rawType = String(q.type || "NORMAL").toUpperCase();
      const type: InterviewBlueprintQuestion["type"] =
        rawType === "MCQ" || rawType === "CODE_SNIPPET" || rawType === "GRAPHICAL"
          ? rawType
          : "NORMAL";
      return {
        section: String(q.section || "").trim(),
        type,
        question: String(q.question || "").trim(),
        referenceCardTitle: q.referenceCardTitle ? String(q.referenceCardTitle) : undefined,
        referenceCardContent: q.referenceCardContent ? String(q.referenceCardContent) : undefined,
      };
    })
    .filter((q) => q.section && q.question);

  if (sections.length === 0 || starterQuestions.length === 0) {
    return null;
  }

  const perSectionTarget = computePerSectionQuestionBankTarget(sections.length);
  for (const section of sections) {
    section.questionBankTarget = perSectionTarget;
  }

  return {
    questionTarget: Math.max(4, Math.floor(Number(parsed.questionTarget || questionTarget))),
    sections,
    starterQuestions,
  };
}

export async function createOpenAIRealtimeClientSecret(payload: {
  apiKey: string;
  safetyIdentifier: string;
  voice: OpenAIRealtimeVoice;
}): Promise<{ value: string; expiresAt?: number | null }> {
  const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${payload.apiKey}`,
      "Content-Type": "application/json",
      "OpenAI-Safety-Identifier": payload.safetyIdentifier,
    },
    body: JSON.stringify({
      session: {
        type: "realtime",
        model: OPENAI_REALTIME_MODEL,
        audio: {
          output: {
            voice: payload.voice,
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI client secret request failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { value?: string; client_secret?: { value?: string; expires_at?: number }; expires_at?: number };
  const value = data.value || data.client_secret?.value;
  if (!value) {
    throw new Error("OpenAI client secret response did not include a secret value.");
  }

  return { value, expiresAt: data.expires_at ?? data.client_secret?.expires_at ?? null };
}

export async function persistWebRtcInterviewSnapshot(payload: {
  sessionId: string;
  transcript: InterviewTranscriptEntry[];
  events: InterviewEvaluationEvent[];
  referenceCards: InterviewReferenceCard[];
  finalReport: InterviewFinalReport | null;
}) {
  const transcript = toJsonValue(payload.transcript);
  const events = toJsonValue(payload.events);
  const referenceCards = toJsonValue(payload.referenceCards);
  const finalReport = payload.finalReport ? toJsonValue(payload.finalReport) : undefined;

  return prisma.interviewSession.updateMany({
    where: { id: payload.sessionId },
    data: {
      transcript,
      evaluationEvents: events,
      referenceCards,
      ...(finalReport ? { finalReport } : {}),
      updatedAt: new Date(),
    },
  });
}

async function sendInterviewReportEmail(payload: {
  role: string;
  candidateName: string;
  candidateEmail: string;
  finalReport: InterviewFinalReport;
}) {
  const user = process.env.NEXT_NODEMAILER_USER;
  const receiver = process.env.INTERVIEW_REPORT_EMAIL || user;
  if (!user || !receiver) return;

  const transporter = getMailerTransporter();
  await transporter.sendMail({
    from: `"JB Recruitment Solutions" <${user}>`,
    to: receiver,
    subject: `AI Interview Report - ${payload.candidateName} (${payload.role})`,
    text: `Candidate: ${payload.candidateName}
Email: ${payload.candidateEmail}
Role: ${payload.role}
Final Score: ${payload.finalReport.finalScore}

Summary:
${payload.finalReport.summary}

Strengths:
${payload.finalReport.strengths.join("\n") || "N/A"}

Improvements:
${payload.finalReport.improvements.join("\n") || "N/A"}
`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; color: #1f2937;">
        <h2 style="margin: 0 0 12px; color: #374151;">AI Interview Report</h2>
        <p style="margin: 0 0 12px;"><strong>Candidate:</strong> ${escapeHtml(payload.candidateName)}</p>
        <p style="margin: 0 0 12px;"><strong>Email:</strong> ${escapeHtml(payload.candidateEmail)}</p>
        <p style="margin: 0 0 12px;"><strong>Role:</strong> ${escapeHtml(payload.role)}</p>
        <p style="margin: 0 0 20px;"><strong>Final Score:</strong> ${payload.finalReport.finalScore}</p>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:12px;">
          <p style="margin:0 0 6px; font-weight:700;">Summary</p>
          <p style="margin:0;">${escapeHtml(payload.finalReport.summary)}</p>
        </div>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:12px;">
          <p style="margin:0 0 6px; font-weight:700;">Strengths</p>
          <ul style="margin:0; padding-left:18px;">
            ${payload.finalReport.strengths.map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>N/A</li>"}
          </ul>
        </div>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">
          <p style="margin:0 0 6px; font-weight:700;">Improvements</p>
          <ul style="margin:0; padding-left:18px;">
            ${payload.finalReport.improvements.map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>N/A</li>"}
          </ul>
        </div>
      </div>
    `,
  });
}

export async function finalizeWebRtcInterviewSession(payload: {
  sessionId: string;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  transcript: InterviewTranscriptEntry[];
  events: InterviewEvaluationEvent[];
  referenceCards: InterviewReferenceCard[];
  finalReport: InterviewFinalReport | null;
  status: "COMPLETED" | "TERMINATED" | "FAILED";
}) {
  const finalReport = payload.status === "COMPLETED" && !payload.finalReport
    ? buildFallbackReport(payload.events, payload.role)
    : payload.finalReport;

  const transcript = toJsonValue(payload.transcript);
  const events = toJsonValue(payload.events);
  const referenceCards = toJsonValue(payload.referenceCards);
  const finalReportJson = finalReport ? toJsonValue(finalReport) : undefined;

  await prisma.interviewSession.updateMany({
    where: { id: payload.sessionId },
    data: {
      status: payload.status,
      transcript,
      evaluationEvents: events,
      ...(finalReportJson ? { finalReport: finalReportJson } : {}),
      referenceCards,
      completedAt: payload.status === "COMPLETED" ? new Date() : undefined,
    },
  });

  if (payload.status === "COMPLETED") {
    await prisma.candidateApplication.update({
      where: { id: payload.applicationId },
      data: { status: "INTERVIEW_COMPLETED" },
    });
  }

  if (finalReport) {
    await Promise.allSettled([
      sendInterviewReportEmail({
        role: payload.role,
        candidateName: payload.candidateName,
        candidateEmail: payload.candidateEmail,
        finalReport,
      }),
      sendInterviewResultsToCandidate({
        candidateName: payload.candidateName,
        candidateEmail: payload.candidateEmail,
        jobRole: payload.role,
        completedAt: payload.status === "COMPLETED" ? new Date() : null,
        finalScore: finalReport.finalScore,
        summary: finalReport.summary,
        strengths: finalReport.strengths,
        weaknesses: finalReport.weaknesses ?? [],
        improvements: finalReport.improvements,
        evaluationEvents: payload.events,
        resultsPageUrl: buildAppUrl(`/interview/results/${payload.sessionId}`),
      }),
    ]);
  }

  return finalReport;
}

export function hashInterviewToken(token: string): string {
  return hashInterviewAccessToken(token);
}
