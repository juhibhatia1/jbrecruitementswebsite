import "./load-env";
import { createServer } from "node:http";
import next from "next";
import WebSocket, { WebSocketServer } from "ws";
import OpenAI from "openai";
import { prisma } from "./lib/prisma";
import { hashInterviewAccessToken } from "./lib/interview/access-token";
import { buildFallbackReport } from "./lib/interview/utils";
import {
  type InterviewEvaluationEvent,
  type InterviewFinalReport,
  type InterviewReferenceCard,
  type InterviewSessionAccumulator,
  type InterviewTranscriptEntry,
} from "./lib/interview/types";
import { OpenAiRealtimeProvider } from "./lib/interview/providers/openai-realtime-provider";
import { getMailerTransporter } from "./lib/mailer";
import { buildAppUrl } from "./lib/app-url";
import { escapeHtml } from "./lib/security";
import { sendInterviewResultsToCandidate } from "./lib/emailService";
import { isFuzzyDuplicate, isNoiseOrHallucination, stripStageDirections } from "./lib/interview/web-rtc-transport";

type ClientMessage =
  | { type: "auth"; token?: string; accessToken?: string }
  | { type: "authenticate"; token?: string; accessToken?: string }
  | { type: "audio_chunk"; data?: string }
  | { type: "end_audio" }
  | { type: "end_interview" };

const AUTH_TIMEOUT_MS = 10000;
const PORT = Number(process.env.PORT || 3000);
const HOSTNAME = process.env.HOST || "localhost";
const dev = process.argv.includes("--dev");

// Turbopack uses \\?\ extended-length paths internally; 8.3 short names (JAKKAA~1)
// are not resolved under \\?\ on Windows, causing "Failed to benchmark file I/O".
// Set TEMP/TMP to the full long-name path before the native addon loads.
if (process.platform === "win32" && process.env.USERPROFILE) {
  const longTemp = `${process.env.USERPROFILE}\\AppData\\Local\\Temp`;
  process.env.TEMP = longTemp;
  process.env.TMP = longTemp;
}

function sendJson(ws: WebSocket, payload: Record<string, unknown>) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function parseClientMessage(raw: WebSocket.RawData): ClientMessage | null {
  try {
    return JSON.parse(raw.toString()) as ClientMessage;
  } catch {
    return null;
  }
}

async function sendInterviewReportEmail(payload: {
  role: string;
  candidateName: string;
  candidateEmail: string;
  finalReport: InterviewFinalReport;
}) {
  const user = process.env.NEXT_NODEMAILER_USER;
  const receiver = process.env.INTERVIEW_REPORT_EMAIL || user;
  if (!user || !receiver) {
    return;
  }

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

function buildGenericDevInstructions(
  role: string,
  candidateName: string,
): string {
  return `You are an AI mock interviewer for JB Recruitment Solutions conducting a 10-minute mock interview for the role of ${role}. Address the candidate as ${candidateName}.

OPENING: Greet ${candidateName}, introduce yourself, state the role and duration. Call show_reference_card with title="Interview Structure" and a markdown table listing the 3 sections below. Say "I've shared the interview structure on your screen — take a moment to look it over." Then ask: "Whenever you're ready, just say 'ready' or 'let's begin' and we'll kick things off." Wait for their explicit confirmation before proceeding.

SECTIONS:
Section 1 — Introduction (2 min): Once candidate confirms ready, ask them to introduce themselves — name, current role, years of experience, brief background.
Section 2 — Technical Questions (6 min): Ask 2 technical questions relevant to ${role}, each with 2 follow-up probes.
Section 3 — Problem Solving (2 min): Ask one practical scenario question.

TIME MANAGEMENT: Never end early. If questions run out, probe earlier answers deeper. Fill all 10 minutes.

ENGAGEMENT: React specifically to each answer. Vary acknowledgments. Never say "let me note that" or narrate tool calls.

TOOL RULES: NEVER narrate or acknowledge tool calls verbally. Never say "I can't put something on screen". show_reference_card whenever structured visual content helps: (a) interview structure at opening; (b) any coding problem — show sample input/output BEFORE asking; (c) comparison tables or cheat sheets; (d) whenever candidate asks to see something on screen — always comply. No call limit. Call finalize_interview_report with done=true ONCE at the very end after verbal closing — never mid-interview.

CLOSING: After 9 minutes elapsed and all sections done: thank ${candidateName}, give 2-sentence summary, wish them well. Then call finalize_interview_report.`;
}

function buildDsaDevInstructions(candidateName: string): string {
  return `You are an AI mock interviewer for JB Recruitment Solutions conducting a 20-minute DSA & System Design mock interview. Address the candidate as ${candidateName}.

OPENING: Greet ${candidateName}, introduce yourself, state the role and total duration (20 minutes). Call show_reference_card with title="Interview Structure" and content as a markdown table with 4 rows: "Section | Topic | Duration", "1 | Warm-up DSA | 5 min", "2 | Main Coding Problem | 10 min", "3 | System Design | 5 min". Say "I've shared today's structure on your screen — take a moment to look it over." Then ask: "Whenever you're ready, just say 'ready' or 'let's begin' and we'll start." Wait for their explicit confirmation before proceeding.

SECTION 1 — Warm-up DSA (5 min):
Ask: "What is the time and space complexity of a binary search?" After the answer, call show_reference_card with title="Big-O Cheat Sheet" and a markdown table: "Operation | Array | Linked List | Hash Map | BST", with rows for Search, Insert, Delete filled with standard complexities.

SECTION 2 — Main Coding Problem (10 min):
Ask: "Given an array of integers, find two numbers that add up to a target sum. Return their indices."
Immediately call show_reference_card with title="Two Sum — Problem Statement" and content:
\`\`\`
Input:  nums = [2, 7, 11, 15], target = 9
Output: [0, 1]  # nums[0] + nums[1] = 9

Constraints:
- 2 <= nums.length <= 10^4
- Each input has exactly one solution
- Cannot use the same element twice
\`\`\`
After candidate responds with brute-force or partial: call show_reference_card with title="Two Sum — Approaches" and a markdown table comparing Brute Force O(n²) vs Hash Map O(n) with space and time complexity columns.
Ask 2 follow-ups: (1) "Can you optimize to O(n)?" (2) "What if the array were sorted — how would your approach change?"

SECTION 3 — System Design (5 min):
Ask: "Design a URL shortener like bit.ly — walk me through the high-level components."
Call show_reference_card with title="URL Shortener — Core Components" and markdown content listing: API Layer, Hash Function (MD5/Base62), Database (KV store), Cache (Redis), CDN.
Ask follow-up: "How would you handle 1 billion URLs and 10k read requests per second?"

TOOL RULES: NEVER narrate or acknowledge tool calls verbally. Never say "I can't put something on screen". show_reference_card whenever structured visual content helps: (a) interview structure at opening; (b) any coding or algorithm problem — show sample input/output card BEFORE asking; (c) comparison tables or cheat sheets; (d) whenever candidate asks to see something on screen — always comply immediately. No call limit. Call finalize_interview_report with done=true ONCE at the very end after verbal closing.

CLOSING: Thank ${candidateName}, give 2-sentence summary of performance. Then call finalize_interview_report.`;
}

async function generatePostInterviewEvaluation(
  transcript: InterviewTranscriptEntry[],
  context: { role: string; experienceLevel: string; techStack: string[] },
  referenceCards?: InterviewReferenceCard[],
): Promise<{
  events: InterviewEvaluationEvent[];
  finalReport: InterviewFinalReport;
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_TEMPLATE_MODEL || "gpt-4o";

  const transcriptText = transcript
    .map(
      (e) =>
        `${e.role === "interviewer" ? "INTERVIEWER" : "CANDIDATE"}: ${e.text}`,
    )
    .join("\n\n");

  const referenceCardsText =
    referenceCards && referenceCards.length > 0
      ? "\n\nREFERENCE CARDS shown to candidate during interview:\n" +
        referenceCards.map((c) => `[${c.title}]\n${c.content}`).join("\n\n")
      : "";

  const prompt = `You are evaluating an AI mock interview for: ${context.role} (${context.experienceLevel}).
Tech stack: ${context.techStack.join(", ") || "General"}.${referenceCardsText}

FULL TRANSCRIPT:
${transcriptText}

Identify every substantive question the interviewer asked and evaluate the candidate's response to each. Skip pleasantries and the self-introduction request (Section 1).

PRIMARY GOAL: Help the candidate improve. Your evaluation should be heavily weighted towards actionable improvement guidance. Be highly specific and thorough — name the exact concepts, architectural patterns, or technical skills they need to work on, and why.

Output valid JSON only, no markdown:
{
  "evaluationEvents": [
    {
      "question": "<exact question asked>",
      "answerSummary": "<1-2 sentence neutral summary of candidate's answer>",
      "score": <integer 1-10>,
      "feedback": "<A detailed, 3-4 sentence technical assessment of the answer quality. Detail what they got right, what core parts were omitted, and evaluate their depth on the technical concepts.>",
      "improvementTip": "<For scores 1-7 only: a detailed, 2-3 sentence tip describing how to resolve this specific conceptual gap, including recommended patterns, algorithms, or approaches. For scores 8-10: omit this field entirely.>"
    }
  ],
  "finalReport": {
    "summary": "<4-5 sentence professional performance narrative. Detail the areas of strong competence, significant blockers, and the overall growth path required to clear an interview at this level.>",
    "strengths": [
      "<A detailed, 2-3 sentence analysis of a core strength, detailing exactly how the candidate demonstrated it in their answers (referencing specific concepts or answers).>",
      "<Another detailed strength...>"
    ],
    "weaknesses": [
      "<A detailed, 2-3 sentence description of a specific conceptual or practical shortcoming, outlining exactly where they failed, what misconceptions they had, or what essential concepts were completely missed.>",
      "<Another detailed weakness...>"
    ],
    "improvements": [
      "<A comprehensive 3-4 sentence improvement item. Naming a specific topic/skill, explaining why this area needs work, and detailing a step-by-step roadmap, resources to study (e.g. documentation, books), or practical projects/code exercises to build for mastery.>",
      "<Another detailed improvement item...>"
    ],
    "finalScore": <integer 1-10>
  }
}

SCORING: score and finalScore must be integers 1-10 only. Never decimals. 10=perfect, 1=completely wrong. Typical good answers: 6-8. finalScore = average of all individual scores rounded to nearest integer.
WEIGHTS: improvements array MUST have 5-6 items. strengths MUST have 2-3 items. weaknesses MUST have 3-4 items. All fields must be descriptive and deep to offer premium, high-value feedback.`;

  const response = await openai.responses.create({
    model,
    instructions:
      "You are a senior technical recruiter evaluating a mock interview. Output only valid JSON — no markdown, no code fences.",
    input: prompt,
    temperature: 0.3,
  });

  const rawText = response.output_text ?? "";
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in evaluation response");

  const parsed = JSON.parse(jsonMatch[0]) as {
    evaluationEvents: Array<{
      question: string;
      answerSummary: string;
      score: number;
      feedback: string;
      improvementTip?: string;
    }>;
    finalReport: {
      summary: string;
      strengths: string[];
      weaknesses: string[];
      improvements: string[];
      finalScore: number;
    };
  };

  const now = new Date().toISOString();
  const events: InterviewEvaluationEvent[] = (
    parsed.evaluationEvents || []
  ).map((e) => {
    const score = Math.min(10, Math.max(1, Math.round(Number(e.score) || 5)));
    const event: InterviewEvaluationEvent = {
      at: now,
      question: String(e.question || ""),
      answerSummary: String(e.answerSummary || ""),
      score,
      feedback: String(e.feedback || ""),
    };
    if (score <= 7 && e.improvementTip) {
      event.improvementTip = String(e.improvementTip);
    }
    return event;
  });

  const fr = parsed.finalReport || ({} as typeof parsed.finalReport);
  const finalReport: InterviewFinalReport = {
    summary: String(fr.summary || ""),
    strengths: Array.isArray(fr.strengths) ? fr.strengths.map(String) : [],
    weaknesses: Array.isArray(fr.weaknesses) ? fr.weaknesses.map(String) : [],
    improvements: Array.isArray(fr.improvements)
      ? fr.improvements.map(String)
      : [],
    finalScore: Math.min(
      10,
      Math.max(1, Math.round(Number(fr.finalScore) || 5)),
    ),
  };

  return { events, finalReport };
}

const nextApp = next({ dev, hostname: HOSTNAME, port: PORT, webpack: dev });
const nextHandler = nextApp.getRequestHandler();

// ── Startup environment validation ───────────────────────────────────────────
// Fail loudly at boot rather than silently misbehaving under production load.
const REQUIRED_ENV_VARS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "DATABASE_URL",
  "OPENAI_API_KEY",
];
if (!dev) {
  const missing = REQUIRED_ENV_VARS.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(
      `FATAL: Missing required environment variable(s): ${missing.join(", ")}. Aborting startup.`,
    );
    process.exit(1);
  }
}

nextApp
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
      void nextHandler(req, res);
    });

    const wss = new WebSocketServer({ noServer: true });
    const wssDev = dev ? new WebSocketServer({ noServer: true }) : null;

    // ── Per-IP WebSocket connection tracking ─────────────────────────────────
    // Prevents a single attacker from opening many concurrent AI interview
    // sessions and burning $100s/hr in OpenAI Realtime API costs.
    const connectionsByIp = new Map<string, number>();
    const MAX_WS_CONNECTIONS_PER_IP = 2;

    wss.on("connection", (clientWs, upgradeRequest) => {
      // Extract real IP (respects Cloudflare / reverse-proxy x-forwarded-for)
      const rawIp =
        upgradeRequest.headers["x-forwarded-for"] ??
        upgradeRequest.socket.remoteAddress ??
        "unknown";
      const clientIp = Array.isArray(rawIp)
        ? rawIp[0].trim()
        : String(rawIp).split(",")[0].trim();

      const currentCount = connectionsByIp.get(clientIp) ?? 0;
      if (currentCount >= MAX_WS_CONNECTIONS_PER_IP) {
        clientWs.close(1008, "Too many concurrent connections from your IP.");
        return;
      }
      connectionsByIp.set(clientIp, currentCount + 1);
      let authenticated = false;
      let provider: any = null;
      let interviewSessionId: string | null = null;
      let applicationId: string | null = null;
      let purchaseId: string | null = null;
      let finalized = false;
      let endInterviewRequested = false;
      let durationKillTimer: ReturnType<typeof setTimeout> | null = null;
      let candidateContext: {
        candidateName: string;
        candidateEmail: string;
        role: string;
        experienceLevel: string;
        techStack: string[];
        templateInstructions: string;
        durationMinutes: number;
      } | null = null;

      const accumulator: InterviewSessionAccumulator = {
        transcript: [],
        events: [],
        finalReport: null,
        referenceCards: [],
      };

      const authTimeout = setTimeout(() => {
        sendJson(clientWs, {
          type: "error",
          message: "Authentication timed out.",
        });
        clientWs.close(4401, "Authentication timeout");
      }, AUTH_TIMEOUT_MS);

      const finalizeSession = async (
        status: "COMPLETED" | "TERMINATED" | "FAILED",
      ) => {
        if (!interviewSessionId || finalized) {
          return;
        }
        finalized = true;

        if (
          status === "COMPLETED" &&
          candidateContext &&
          !accumulator.finalReport
        ) {
          try {
            const evalResult = await generatePostInterviewEvaluation(
              accumulator.transcript,
              {
                role: candidateContext.role,
                experienceLevel: candidateContext.experienceLevel,
                techStack: candidateContext.techStack,
              },
              accumulator.referenceCards,
            );
            accumulator.events = evalResult.events;
            accumulator.finalReport = evalResult.finalReport;
            sendJson(clientWs, {
              type: "final_report",
              data: evalResult.finalReport,
            });
          } catch (err) {
            console.error("Post-interview evaluation failed:", err);
            // Fall back to utility report so results page still populates
            accumulator.finalReport = buildFallbackReport(
              accumulator.events,
              candidateContext.role,
            );
            sendJson(clientWs, {
              type: "final_report",
              data: accumulator.finalReport,
            });
          }
        } else if (accumulator.finalReport) {
          sendJson(clientWs, {
            type: "final_report",
            data: accumulator.finalReport,
          });
        }

        const finalReport = accumulator.finalReport;

        const updated = await prisma.interviewSession.updateMany({
          where: { id: interviewSessionId },
          data: {
            status,
            transcript: accumulator.transcript as any,
            evaluationEvents: accumulator.events as any,
            finalReport: finalReport as any,
            referenceCards: accumulator.referenceCards as any,
            completedAt: new Date(),
          },
        });

        if (updated.count === 0) {
          return;
        }

        if (status === "COMPLETED" && applicationId) {
          await prisma.candidateApplication.update({
            where: { id: applicationId },
            data: { status: "INTERVIEW_COMPLETED" },
          });

          // Propagate completion onto the Purchase the admin/employee dashboard reads.
          // updateMany (not update) so a missing/unlinked purchase is a no-op, not a throw.
          if (purchaseId) {
            await prisma.purchase.updateMany({
              where: { id: purchaseId },
              data: {
                mockInterviewStatus: "COMPLETED",
                deliveryStatus: "COMPLETED",
              },
            });
          }
        }

        if (finalReport && candidateContext) {
          await Promise.allSettled([
            sendInterviewReportEmail({
              role: candidateContext.role,
              candidateName: candidateContext.candidateName,
              candidateEmail: candidateContext.candidateEmail,
              finalReport,
            }),
            sendInterviewResultsToCandidate({
              candidateName: candidateContext.candidateName,
              candidateEmail: candidateContext.candidateEmail,
              jobRole: candidateContext.role,
              completedAt: new Date(),
              finalScore: finalReport.finalScore,
              summary: finalReport.summary,
              strengths: finalReport.strengths,
              weaknesses: finalReport.weaknesses ?? [],
              improvements: finalReport.improvements,
              evaluationEvents: accumulator.events,
              resultsPageUrl: buildAppUrl(
                `/interview/results/${interviewSessionId}`,
              ),
            }),
          ]);
        }
      };

      clientWs.on("message", async (raw) => {
        const message = parseClientMessage(raw);
        if (!message) {
          sendJson(clientWs, {
            type: "error",
            message: "Invalid JSON message.",
          });
          return;
        }

        if (!authenticated) {
          const token = (message as any).token || (message as any).accessToken;
          if (
            message.type !== "auth" &&
            message.type !== "authenticate" &&
            !token
          ) {
            sendJson(clientWs, {
              type: "error",
              message:
                "Authenticate first by sending the interview access token.",
            });
            return;
          }

          try {
            const tokenHash = hashInterviewAccessToken(String(token || ""));
            const application = await prisma.candidateApplication.findUnique({
              where: { accessTokenHash: tokenHash },
              include: { template: true, session: true },
            });

            if (!application) {
              sendJson(clientWs, {
                type: "error",
                message: "Invalid interview token.",
              });
              clientWs.close(4403, "Invalid token");
              return;
            }

            if (application.interviewPreference !== "AI") {
              sendJson(clientWs, {
                type: "error",
                message:
                  "This application is configured for a manual interview.",
              });
              clientWs.close(4403, "Manual interview");
              return;
            }

            if (application.accessTokenExpiresAt.getTime() < Date.now()) {
              await prisma.candidateApplication.update({
                where: { id: application.id },
                data: { status: "TOKEN_EXPIRED" },
              });
              sendJson(clientWs, {
                type: "error",
                message: "Interview link has expired.",
              });
              clientWs.close(4403, "Token expired");
              return;
            }

            if (application.status === "INTERVIEW_COMPLETED") {
              sendJson(clientWs, {
                type: "error",
                message: "Interview already completed.",
              });
              clientWs.close(4403, "Completed");
              return;
            }

            if (!application.template.systemInstructions) {
              sendJson(clientWs, {
                type: "error",
                message:
                  "Interview template is not active yet. Contact support.",
              });
              clientWs.close(4403, "Template not generated");
              return;
            }

            const defaultProvider =
              process.env.INTERVIEW_PROVIDER || "openai-realtime";
            let isResuming = false;

            if (application.session) {
              if (application.session.status === "COMPLETED") {
                sendJson(clientWs, {
                  type: "error",
                  message: "Interview already completed.",
                });
                clientWs.close(4409, "Already completed");
                return;
              }
              if (application.session.status === "ACTIVE") {
                sendJson(clientWs, {
                  type: "error",
                  message: "Interview session already in progress.",
                });
                clientWs.close(4409, "Session in progress");
                return;
              }
              // TERMINATED / FAILED / CONNECTING
              const previousTranscript = Array.isArray(
                application.session.transcript,
              )
                ? (application.session
                    .transcript as unknown as InterviewTranscriptEntry[])
                : [];

              if (previousTranscript.length > 0) {
                // Resume: restore transcript from interrupted session
                await prisma.interviewSession.update({
                  where: { id: application.session.id },
                  data: { status: "CONNECTING" },
                });
                interviewSessionId = application.session.id;
                accumulator.transcript = previousTranscript;
                isResuming = true;
              } else {
                await prisma.interviewSession.delete({
                  where: { id: application.session.id },
                });
              }
            }

            if (!isResuming) {
              const session = await prisma.interviewSession.create({
                data: {
                  applicationId: application.id,
                  provider: defaultProvider,
                  status: "CONNECTING",
                  transcript: [],
                  evaluationEvents: [],
                },
              });

              await prisma.candidateApplication.update({
                where: { id: application.id },
                data: { status: "INTERVIEW_STARTED" },
              });

              interviewSessionId = session.id;
            }

            applicationId = application.id;
            purchaseId = application.purchaseId ?? null;
            candidateContext = {
              candidateName: application.candidateName,
              candidateEmail: application.candidateEmail,
              role: application.template.jobRole,
              experienceLevel: application.template.experienceLevel,
              techStack: (application.template.techStack as string[]) || [],
              templateInstructions: application.template.systemInstructions,
              durationMinutes: application.template.durationMinutes || 30,
            };

            const callbackHandlers = {
              onReady: () => {
                sendJson(clientWs, {
                  type: "ready",
                  audioInputRate: provider?.audioInputRate ?? 16000,
                  existingTranscript:
                    accumulator.transcript.length > 0
                      ? accumulator.transcript
                      : undefined,
                });
              },
              onStatus: (statusMessage: string) => {
                sendJson(clientWs, { type: "status", message: statusMessage });
              },
              onError: (errorMessage: string) => {
                sendJson(clientWs, { type: "error", message: errorMessage });
              },
              onTranscript: (entry: InterviewTranscriptEntry) => {
                const cleanText = stripStageDirections(entry.text);
                if (!cleanText || (entry.role === "candidate" && isNoiseOrHallucination(cleanText))) return;
                const cleanEntry = { ...entry, text: cleanText };
                if (cleanEntry.role === "interviewer") {
                  const isDuplicateInAcc = accumulator.transcript.slice(-10).some((item) => {
                    if (item.role !== "interviewer") return false;
                    return isFuzzyDuplicate(item.text, cleanEntry.text);
                  });
                  if (isDuplicateInAcc) {
                    console.warn("[Server] Dropped fuzzy duplicate AI transcript entry:", cleanEntry.text);
                    return;
                  }
                }
                accumulator.transcript.push(cleanEntry);
                sendJson(clientWs, { type: "transcript", data: cleanEntry });
                if (
                  accumulator.transcript.length % 5 === 0 &&
                  interviewSessionId
                ) {
                  prisma.interviewSession
                    .update({
                      where: { id: interviewSessionId },
                      data: { transcript: accumulator.transcript as any },
                    })
                    .catch((err) =>
                      console.error("Periodic transcript save failed:", err),
                    );
                }
              },
              onAudioChunk: (data: string, mimeType: string) => {
                sendJson(clientWs, { type: "ai_audio_chunk", data, mimeType });
              },
              onInterrupted: () => {
                sendJson(clientWs, { type: "ai_interrupted" });
              },
              onEvaluationEvent: (event: any) => {
                accumulator.events.push(event);
              },
              onFinalReport: (report: InterviewFinalReport) => {
                accumulator.finalReport = report;
              },
              onReferenceCard: (card: InterviewReferenceCard) => {
                const cardWithPosition: InterviewReferenceCard = {
                  ...card,
                  afterTranscriptIndex: accumulator.transcript.length,
                };
                console.log(
                  "[Server] Sending reference_card to client:",
                  card.title,
                );
                accumulator.referenceCards.push(cardWithPosition);
                sendJson(clientWs, {
                  type: "reference_card",
                  data: cardWithPosition,
                });
              },
              onComplete: () => {
                sendJson(clientWs, { type: "interview_complete" });
                void finalizeSession("COMPLETED").catch((error) => {
                  console.error("Failed to finalize interview session:", error);
                });
              },
            };

            {
              const advCfg = application.template.advancedConfig as Record<
                string,
                string
              > | null;
              provider = new OpenAiRealtimeProvider(
                callbackHandlers,
                undefined,
                advCfg?.voiceOption,
              );
            }

            clearTimeout(authTimeout);
            authenticated = true;

            const baseInstructions =
              candidateContext.templateInstructions || "";
            const dynamicGuidelines = `
ADDITIONAL OPERATIONAL BEHAVIORAL INSTRUCTIONS:
- You are a highly professional, rigorous, and intelligent technical interviewer.
- Do NOT be overly generous. If the candidate answers poorly, gives a flat out incorrect explanation, or is too vague, do not ignore it. Politely and positively correct them, or guide them with constructive hints to help them perform better and learn.
- Listen carefully to the candidate's answers. Respond with intelligence, depth, and clarity, directly addressing what the candidate actually said rather than blindly moving to the next scripted question.
- Do not let the candidate get away with basic surface-level definitions; dig deeper if necessary.
- Maintain a warm, encouraging, but rigorous and professional tone.
- When the candidate gives their introduction/self-introduction, always respond with a brief, genuine compliment or acknowledgment (e.g., "That's a great background!", "Impressive experience!", "Nice to meet you — that's a solid foundation!") before asking your first technical question.
- If the candidate interrupts you mid-answer with a short phrase like "sorry", "wait", "hold on", "continue", "never mind", "go ahead", or any other non-substantive utterance that is clearly not an answer to the current question — do NOT treat it as an answer. Simply re-ask the same question you were on.
- MANDATORY OPENING SEQUENCE: When the interview starts, you MUST: (1) greet the candidate warmly by name, (2) immediately call show_reference_card with title="Interview Structure" and a markdown table listing your planned sections, (3) say "I've shared today's interview structure on your screen — take a moment to look it over. Whenever you're ready, please introduce yourself.", (4) wait for the candidate to introduce themselves before asking any technical questions.
- MANDATORY CLOSING SEQUENCE: Before concluding the interview, you MUST ask the candidate, "Do you have any questions for me?" or "Do you have any questions about the company or the role?". Wait for their response and answer their questions before delivering your final brief verbal summary and calling finalize_interview_report.
- show_reference_card tool: Use it whenever structured visual content helps — interview structure at opening (MANDATORY), coding problems (show before asking), comparison tables, cheat sheets. Call it silently without narrating the call.
- TOOL CALL SILENCE: When calling any tool (save_interview_event, show_reference_card, finalize_interview_report), do NOT say anything out loud. Never say phrases like "I'll note that", "I'll generate a follow-up", "Let me get the next question", "I'll save that", "One moment", or any other verbal filler while invoking a tool. Call the tool silently and continue speaking naturally afterwards.

SCORING CALIBRATION (critical — you must follow this):
- A correct answer with solid understanding = 7–9. Do NOT score it 5–6.
- Reserve scores below 5 strictly for wrong answers or deeply confused responses.
- When in doubt between two score bands, round UP — this is a mock interview to help the candidate improve, not a gatekeeping exam.
- Score what the candidate actually demonstrated, not what a perfect textbook answer would look like.
- Score guide: 9–10 = correct, well-articulated, real-world depth; 7–8 = correct with solid understanding, minor gaps fine; 5–6 = partial understanding, notable gaps; 3–4 = mostly wrong or very vague; 1–2 = no meaningful attempt.

REPORT GENERATION (when calling finalize_interview_report):
- summary: Write in a supportive, constructive tone. Acknowledge what the candidate did well first, then frame gaps as growth opportunities. The candidate should feel motivated to improve, not discouraged.
- sectionScores: Include one entry per section from the interview. Score each section 1–5 (1=poor, 2=below average, 3=average, 4=good, 5=excellent) based on the candidate's overall performance in that section.
- encouragementLine: Write one specific, genuine positive sentence about this candidate. Reference something real from the interview — a strong answer, clear communication, good project knowledge, or enthusiasm. Never write generic filler like "You did a great job!" — make it specific to what this candidate actually demonstrated.
`;

            let systemInstructions = baseInstructions + dynamicGuidelines;
            let openingPrompt = `The candidate is ready. Please begin the interview for the ${candidateContext.role} role, following your instructions — greet the candidate, introduce the interview structure, then proceed.`;

            if (isResuming && accumulator.transcript.length > 0) {
              const transcriptText = accumulator.transcript
                .map(
                  (e) =>
                    `${e.role === "interviewer" ? "Interviewer" : "Candidate"}: ${e.text}`,
                )
                .join("\n");
              systemInstructions += `

IMPORTANT — INTERVIEW RESUMPTION CONTEXT:
This interview session was briefly interrupted (e.g., the candidate refreshed the page) and is now continuing. The following conversation has already taken place:

<previous_transcript>
${transcriptText}
</previous_transcript>

Do NOT repeat any questions or topics already covered. Do NOT re-introduce yourself or restart the interview. Continue naturally from where the conversation left off, proceeding to the next question or topic.
`;
              openingPrompt = `The candidate has reconnected after a brief interruption. Continue the ${candidateContext.role} interview from where you left off — do not repeat questions already asked.`;
            }

            await provider.connect({
              systemInstructions,
              openingPrompt,
              candidateName: candidateContext.candidateName,
            });

            if (interviewSessionId) {
              await prisma.interviewSession.update({
                where: { id: interviewSessionId },
                data: {
                  status: "ACTIVE",
                  modelUsed: provider.selectedModel || undefined,
                },
              });
            }

            // ── Session duration kill-timer ──────────────────────────────────
            // Force-disconnect if the interview exceeds its allotted time.
            // Prevents runaway OpenAI Realtime API costs.
            const durationMs =
              ((candidateContext?.durationMinutes ?? 30) + 2) * 60 * 1000; // +2 min grace
            durationKillTimer = setTimeout(() => {
              console.warn(
                `[WS] Session ${interviewSessionId} exceeded duration limit (${candidateContext?.durationMinutes}min). Closing.`,
              );
              sendJson(clientWs, {
                type: "interview_timeout",
                message:
                  "Your interview time has ended. Your session is being saved.",
              });
              endInterviewRequested = true;
              provider?.endInterview();
              setTimeout(() => {
                void finalizeSession("COMPLETED").catch((err) => {
                  console.error(
                    "Duration kill-timer finalization failed:",
                    err,
                  );
                });
              }, 10000);
            }, durationMs);
          } catch (error) {
            console.error("Interview auth/setup failed:", error);
            sendJson(clientWs, {
              type: "error",
              message: "Failed to start interview.",
            });
            if (interviewSessionId) {
              await finalizeSession("FAILED");
            }
            clientWs.close(1011, "Setup failed");
          }

          return;
        }

        if (!provider) {
          sendJson(clientWs, {
            type: "error",
            message: "Interview provider unavailable.",
          });
          return;
        }

        if (message.type === "audio_chunk") {
          if (message.data) {
            provider.sendAudioChunk(message.data);
          }
          return;
        }

        if (message.type === "end_audio") {
          provider.endAudio();
          return;
        }

        if (message.type === "end_interview") {
          endInterviewRequested = true;
          provider.endInterview();
          // Fallback: guarantee COMPLETED finalization if AI never calls finalize_interview_report
          setTimeout(() => {
            void finalizeSession("COMPLETED").catch((err) => {
              console.error("End-interview fallback finalization failed:", err);
            });
          }, 14000);
          return;
        }
      });

      clientWs.on("close", () => {
        clearTimeout(authTimeout);
        if (durationKillTimer) clearTimeout(durationKillTimer);
        provider?.close();
        // Release the per-IP connection slot
        const remaining = (connectionsByIp.get(clientIp) ?? 1) - 1;
        if (remaining <= 0) connectionsByIp.delete(clientIp);
        else connectionsByIp.set(clientIp, remaining);
        if (authenticated) {
          const closeStatus = endInterviewRequested
            ? "COMPLETED"
            : "TERMINATED";
          void finalizeSession(closeStatus).catch((error) => {
            console.error("Failed to finalize disconnected session:", error);
          });
        }
      });
    });

    // Dev-only: no token auth, no DB writes, provider/model/voice from URL params
    if (wssDev) {
      wssDev.on("connection", async (clientWs, request) => {
        const reqUrl = new URL(request.url || "/", `http://localhost:${PORT}`);
        const providerParam =
          reqUrl.searchParams.get("provider") || "openai-realtime";
        const modelParam = reqUrl.searchParams.get("model") || undefined;
        const voiceParam = reqUrl.searchParams.get("voice") || undefined;
        const role = reqUrl.searchParams.get("role") || "Software Engineer";
        const candidateName =
          reqUrl.searchParams.get("name") || "Test Candidate";
        const templateIdParam = reqUrl.searchParams.get("templateId") || null;

        const devAccumulator: InterviewSessionAccumulator = {
          transcript: [],
          events: [],
          finalReport: null,
          referenceCards: [],
        };

        let devProvider: any = null;

        const devCallbacks = {
          onReady: () =>
            sendJson(clientWs, {
              type: "ready",
              audioInputRate: devProvider?.audioInputRate ?? 16000,
            }),
          onStatus: (msg: string) =>
            sendJson(clientWs, { type: "status", message: msg }),
          onError: (msg: string) =>
            sendJson(clientWs, { type: "error", message: msg }),
          onTranscript: (entry: InterviewTranscriptEntry) => {
            const cleanText = stripStageDirections(entry.text);
            if (!cleanText || (entry.role === "candidate" && isNoiseOrHallucination(cleanText))) return;
            const cleanEntry = { ...entry, text: cleanText };
            if (cleanEntry.role === "interviewer") {
              const isDuplicateInAcc = devAccumulator.transcript.slice(-10).some((item) => {
                if (item.role !== "interviewer") return false;
                return isFuzzyDuplicate(item.text, cleanEntry.text);
              });
              if (isDuplicateInAcc) {
                console.warn("[Server Dev] Dropped fuzzy duplicate AI transcript entry:", cleanEntry.text);
                return;
              }
            }
            devAccumulator.transcript.push(cleanEntry);
            sendJson(clientWs, { type: "transcript", data: cleanEntry });
          },
          onAudioChunk: (data: string, mimeType: string) =>
            sendJson(clientWs, { type: "ai_audio_chunk", data, mimeType }),
          onInterrupted: () => {
            sendJson(clientWs, { type: "ai_interrupted" });
          },
          onEvaluationEvent: (event: any) => {
            devAccumulator.events.push(event);
          },
          onFinalReport: (report: InterviewFinalReport) => {
            devAccumulator.finalReport = report;
          },
          onReferenceCard: (card: InterviewReferenceCard) => {
            devAccumulator.referenceCards.push(card);
            sendJson(clientWs, { type: "reference_card", data: card });
          },
          onComplete: () => {
            sendJson(clientWs, { type: "interview_complete" });
            void (async () => {
              try {
                const evalResult = await generatePostInterviewEvaluation(
                  devAccumulator.transcript,
                  {
                    role: resolvedRole,
                    experienceLevel: "mid-level",
                    techStack: [],
                  },
                  devAccumulator.referenceCards,
                );
                sendJson(clientWs, {
                  type: "evaluation_events",
                  data: evalResult.events,
                });
                sendJson(clientWs, {
                  type: "final_report",
                  data: evalResult.finalReport,
                });
              } catch (err) {
                console.error("[dev] Post-interview evaluation failed:", err);
                if (devAccumulator.finalReport) {
                  sendJson(clientWs, {
                    type: "final_report",
                    data: devAccumulator.finalReport,
                  });
                }
              }
            })();
          },
        };

        let devInstructions: string;
        let resolvedRole = role;

        if (templateIdParam === "__dev_dsa__") {
          devInstructions = buildDsaDevInstructions(candidateName);
          resolvedRole = "DSA & System Design";
        } else if (templateIdParam) {
          try {
            const template = await prisma.interviewTemplate.findUnique({
              where: { id: templateIdParam },
              select: { systemInstructions: true, jobRole: true },
            });
            if (template?.systemInstructions) {
              devInstructions = template.systemInstructions;
              resolvedRole = template.jobRole;
            } else {
              devInstructions = buildGenericDevInstructions(
                role,
                candidateName,
              );
            }
          } catch {
            devInstructions = buildGenericDevInstructions(role, candidateName);
          }
        } else {
          devInstructions = buildGenericDevInstructions(role, candidateName);
        }

        try {
          devProvider = new OpenAiRealtimeProvider(
            devCallbacks,
            modelParam,
            voiceParam,
          );

          const previewInstructions =
            devInstructions +
            `
ADDITIONAL OPERATIONAL BEHAVIORAL INSTRUCTIONS:
- You are a highly professional, rigorous, and intelligent technical interviewer.
- Do NOT be overly generous. If the candidate answers poorly, gives a flat out incorrect explanation, or is too vague, do not ignore it. Politely and positively correct them, or guide them with constructive hints to help them perform better and learn.
- Listen carefully to the candidate's answers. Respond with intelligence, depth, and clarity, directly addressing what the candidate actually said rather than blindly moving to the next scripted question.
- Do not let the candidate get away with basic surface-level definitions; dig deeper if necessary.
- Maintain a warm, encouraging, but rigorous and professional tone.
- When the candidate gives their introduction/self-introduction, always respond with a brief, genuine compliment or acknowledgment (e.g., "That's a great background!", "Impressive experience!", "Nice to meet you — that's a solid foundation!") before asking your first technical question.
- If the candidate interrupts you mid-answer with a short phrase like "sorry", "wait", "hold on", "continue", "never mind", "go ahead", or any other non-substantive utterance that is clearly not an answer to the current question — do NOT treat it as an answer. Simply re-ask the same question you were on.
- MANDATORY OPENING SEQUENCE: When the interview starts, you MUST: (1) greet the candidate warmly by name, (2) immediately call show_reference_card with title="Interview Structure" and a markdown table listing your planned sections, (3) say "I've shared today's interview structure on your screen — take a moment to look it over. Whenever you're ready, please introduce yourself.", (4) wait for the candidate to introduce themselves before asking any technical questions.
- MANDATORY CLOSING SEQUENCE: Before concluding the interview, you MUST ask the candidate, "Do you have any questions for me?" or "Do you have any questions about the company or the role?". Wait for their response and answer their questions before delivering your final brief verbal summary and calling finalize_interview_report.
- show_reference_card tool: Use it whenever structured visual content helps — interview structure at opening (MANDATORY), coding problems (show before asking), comparison tables, cheat sheets. Call it silently without narrating the call.
- TOOL CALL SILENCE: When calling any tool (save_interview_event, show_reference_card, finalize_interview_report), do NOT say anything out loud. Never say phrases like "I'll note that", "I'll generate a follow-up", "Let me get the next question", "I'll save that", "One moment", or any other verbal filler while invoking a tool. Call the tool silently and continue speaking naturally afterwards.

SCORING CALIBRATION (critical — you must follow this):
- A correct answer with solid understanding = 7–9. Do NOT score it 5–6.
- Reserve scores below 5 strictly for wrong answers or deeply confused responses.
- When in doubt between two score bands, round UP — this is a mock interview to help the candidate improve, not a gatekeeping exam.
- Score what the candidate actually demonstrated, not what a perfect textbook answer would look like.
- Score guide: 9–10 = correct, well-articulated, real-world depth; 7–8 = correct with solid understanding, minor gaps fine; 5–6 = partial understanding, notable gaps; 3–4 = mostly wrong or very vague; 1–2 = no meaningful attempt.

REPORT GENERATION (when calling finalize_interview_report):
- summary: Write in a supportive, constructive tone. Acknowledge what the candidate did well first, then frame gaps as growth opportunities. The candidate should feel motivated to improve, not discouraged.
- sectionScores: Include one entry per section from the interview. Score each section 1–5 (1=poor, 2=below average, 3=average, 4=good, 5=excellent) based on the candidate's overall performance in that section.
- encouragementLine: Write one specific, genuine positive sentence about this candidate. Reference something real from the interview — a strong answer, clear communication, good project knowledge, or enthusiasm. Never write generic filler like "You did a great job!" — make it specific to what this candidate actually demonstrated.
`;

          void devProvider
            .connect({
              systemInstructions: previewInstructions,
              openingPrompt: "Start the interview now.",
              candidateName,
            })
            .catch((err: Error) => {
              sendJson(clientWs, { type: "error", message: err.message });
            });
        } catch (err: any) {
          sendJson(clientWs, { type: "error", message: err.message });
        }

        clientWs.on("message", (raw) => {
          if (!devProvider) return;
          const msg = parseClientMessage(raw);
          if (!msg) return;
          if (msg.type === "audio_chunk" && msg.data)
            devProvider.sendAudioChunk(msg.data);
          if (msg.type === "end_audio") devProvider.endAudio();
          if (msg.type === "end_interview") devProvider.endInterview();
        });

        clientWs.on("close", () => {
          devProvider?.close();
        });
      });
    }

    server.on("upgrade", (request, socket, head) => {
      const requestUrl = new URL(
        request.url || "/",
        `http://${request.headers.host}`,
      );
      if (requestUrl.pathname === "/ws/interview") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      } else if (requestUrl.pathname === "/ws/interview-dev" && wssDev) {
        wssDev.handleUpgrade(request, socket, head, (ws) => {
          wssDev.emit("connection", ws, request);
        });
      }
      // All other upgrade requests (e.g. Next.js HMR /_next/webpack-hmr) are
      // left alone so Next.js can handle them — destroying them kills HMR in dev.
    });

    server.listen(PORT, HOSTNAME, () => {
      console.log(
        `> Server ready on http://${HOSTNAME}:${PORT} (${dev ? "development" : "production"})`,
      );
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
