import { prisma } from "@/lib/prisma";
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

type JsonValue = string | number | boolean | JsonObject | JsonArray;
type JsonArray = JsonValue[];
type JsonObject = { [key: string]: JsonValue };

function toJsonValue(value: unknown): JsonValue {
  return value as unknown as JsonValue;
}

const OPENAI_REALTIME_MODEL = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2";
const DEFAULT_VOICE = process.env.OPENAI_REALTIME_VOICE || "marin";

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
  techStack: string[];
  durationMinutes: number;
  baseInstructions: string;
  transcript?: InterviewTranscriptEntry[];
  isResuming?: boolean;
  resumeText?: string;
}): string {
  const { role, experienceLevel, techStack, durationMinutes, baseInstructions, transcript, isResuming, resumeText } = payload;
  const transcriptText = transcript && transcript.length > 0
    ? transcript
        .map((entry) => `${entry.role === "interviewer" ? "Interviewer" : "Candidate"}: ${entry.text}`)
        .join("\n")
    : "";

  const resumeBlock = isResuming && transcriptText
    ? `

IMPORTANT — INTERVIEW RESUMPTION CONTEXT:
This interview session was interrupted and is now continuing. The following conversation has already taken place:

<previous_transcript>
${transcriptText}
</previous_transcript>

Do NOT repeat any questions or topics already covered. Do NOT re-introduce yourself or restart the interview. Continue naturally from where the conversation left off.
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

  const dynamicGuidelines = `

ADDITIONAL OPERATIONAL BEHAVIORAL INSTRUCTIONS:
- You are a highly professional, rigorous, and intelligent technical interviewer.
- Do NOT be overly generous. If the candidate answers poorly, gives a flat out incorrect explanation, or is too vague, do not ignore it. Politely and positively correct them, or guide them with constructive hints to help them perform better and learn.
- Listen carefully to the candidate's answers. Respond with intelligence, depth, and clarity, directly addressing what the candidate actually said rather than blindly moving to the next scripted question.
- Do not let the candidate get away with basic surface-level definitions; dig deeper if necessary.
- Maintain a warm, encouraging, but rigorous and professional tone.
- When the candidate gives their introduction/self-introduction, always respond with a brief, genuine compliment or acknowledgment before asking your first technical question.
- If the candidate interrupts you mid-answer with a short phrase like "sorry", "wait", "hold on", "continue", "never mind", "go ahead", or any other non-substantive utterance that is clearly not an answer to the current question — do NOT treat it as an answer. Simply re-ask the same question you were on.
- Noise/unclear-audio & Language constraints: only conduct this interview in English. If a transcript looks like background noise, random words, non-English words, foreign language, or unclear speech, do NOT treat it as a valid answer. Ask for clarification once in English (e.g., "I may have caught background noise — could you please repeat that in English?") and continue only after a coherent response.
- MANDATORY OPENING SEQUENCE: When the interview starts, you MUST: (1) greet the candidate warmly by name, (2) immediately call show_reference_card with title="Interview Structure" and a markdown table listing your planned sections, (3) say "I've shared today's interview structure on your screen — take a moment to look it over. Whenever you're ready, please introduce yourself.", (4) wait for the candidate to introduce themselves before asking any technical questions.
- show_reference_card tool: Use it whenever structured visual content helps — interview structure at opening (MANDATORY), coding problems (show before asking), comparison tables, cheat sheets. Call it silently without narrating the call.
- TIME VOLUNTARY MANAGEMENT (preserve every existing interview rule, section rule, and coding-question minimum): Treat ${durationMinutes} minutes as the target interview duration, not a hard cut-off. Pace dynamically using answer depth and remaining mandatory coverage. Never end early just because your initial section plan finished; if time remains, continue with contextual follow-ups from the candidate's projects, technologies, and earlier answers.
- Keep mandatory constraints intact: if coding/code-snippet minimums, required sections, or recruiter-configured must-cover topics are still pending, prioritize and complete them before closing.
- At or after target time: do NOT interrupt the candidate mid-answer. Let them finish naturally, then close gracefully if objectives are complete.
- Grace window: You may extend up to 4 additional minutes only to finish an in-progress answer, complete the active section, or cover remaining mandatory objectives. Do not open brand-new broad sections during grace.
- You may receive orchestration notes such as TIME_SIGNAL:30_SECONDS_REMAINING, TIME_SIGNAL:TARGET_REACHED, and TIME_SIGNAL:HARD_STOP_REACHED. Follow them strictly: acknowledge briefly when appropriate, tighten pacing, and conclude professionally once the current answer/essential final point is complete.
`;

  return `${baseInstructions}

IDENTITY
You are a professional AI mock interviewer for JB Recruitment Solutions conducting a live ${durationMinutes}-minute mock interview for ${role} (${experienceLevel} level).

OPENING — follow this exact sequence, no steps skipped:
1. Greet the candidate warmly, introduce yourself as the AI interviewer, state the role name and total duration.
2. Immediately call show_reference_card with title="Interview Structure" and content = a markdown table with two columns (Section | What it covers), listing each of your designed sections with a one-line description. After the call say: "I've shared today's interview structure on your screen — take a moment to look it over."
3. Ask: "Whenever you're ready, just say 'ready' or 'let's begin' and we'll kick things off." Wait for the candidate's explicit confirmation before doing anything else.
4. Once the candidate confirms they're ready: ask them to introduce themselves — name, current or most recent role, years of relevant experience, and a brief background summary. Wait for their full response before moving to Section 1.

PERSONALIZATION:
During the candidate's introduction, note their specific technologies, companies, and projects. Reference these explicitly when introducing topics.
Core tech stack to keep in mind: ${techStack.join(", ") || "General"}.
${resumeSection}

ENGAGEMENT RULES — react like a skilled human interviewer:
• Strong, detailed answer: acknowledge the specific point.
• Incomplete or vague answer: probe immediately.
• Interesting detail: follow up.
• Standard correct answer: vary your acknowledgment.
• Wrong or confused answer: rephrase rather than correct.
• One topic per turn — NEVER ask multiple unrelated questions in the same response.

TOOL RULES — absolute, no exceptions:
Available tools: show_reference_card, finalize_interview_report, save_interview_event.
show_reference_card — use whenever structured visual content genuinely helps the candidate.
finalize_interview_report — call ONCE, only at the very end after the verbal closing. Never call it mid-interview.
save_interview_event — call after each substantive question if you want to persist the candidate's response.
ABSOLUTE RULE: Never narrate or acknowledge tool calls to the candidate.

CLOSING SEQUENCE:
After all sections are complete and the interview is ready to end: thank the candidate sincerely, give a brief verbal summary of the topics covered, wish them well. Then — and only then — call finalize_interview_report.
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
        resultsPageUrl: (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL)
          ? `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL}/interview/results/${payload.sessionId}`
          : undefined,
      }),
    ]);
  }

  return finalReport;
}

export function hashInterviewToken(token: string): string {
  return hashInterviewAccessToken(token);
}
