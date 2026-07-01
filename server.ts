import { createServer } from "node:http";
import next from "next";
import WebSocket, { WebSocketServer } from "ws";
import { prisma } from "./lib/prisma";
import { hashInterviewAccessToken } from "./lib/interview/access-token";
import { buildFallbackReport } from "./lib/interview/utils";
import {
  type InterviewFinalReport,
  type InterviewSessionAccumulator,
  type InterviewTranscriptEntry,
} from "./lib/interview/types";
import { GeminiLiveInterviewProvider } from "./lib/interview/providers/gemini-live-provider";
import { getMailerTransporter } from "./lib/mailer";
import { escapeHtml } from "./lib/security";
import { sendInterviewResultsToCandidate } from "./lib/emailService";

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

const nextApp = next({ dev, hostname: HOSTNAME, port: PORT });
const nextHandler = nextApp.getRequestHandler();

nextApp
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
      void nextHandler(req, res);
    });

    const wss = new WebSocketServer({ noServer: true });

    wss.on("connection", (clientWs) => {
      let authenticated = false;
      let provider: GeminiLiveInterviewProvider | null = null;
      let interviewSessionId: string | null = null;
      let finalized = false;
      let candidateContext: {
        candidateName: string;
        candidateEmail: string;
        role: string;
        templateInstructions: string;
      } | null = null;

      const accumulator: InterviewSessionAccumulator = {
        transcript: [],
        events: [],
        finalReport: null,
      };

      const authTimeout = setTimeout(() => {
        sendJson(clientWs, { type: "error", message: "Authentication timed out." });
        clientWs.close(4401, "Authentication timeout");
      }, AUTH_TIMEOUT_MS);

      const finalizeSession = async (status: "COMPLETED" | "TERMINATED" | "FAILED") => {
        if (!interviewSessionId || finalized) {
          return;
        }
        finalized = true;

        const finalReport =
          accumulator.finalReport ||
          (candidateContext
            ? buildFallbackReport(accumulator.events, candidateContext.role)
            : null);

        const updated = await prisma.interviewSession.updateMany({
          where: { id: interviewSessionId },
          data: {
            status,
            transcript: accumulator.transcript,
            evaluationEvents: accumulator.events,
            finalReport,
            completedAt: new Date(),
          },
        });

        if (updated.count === 0) {
          return;
        }

        if (status === "COMPLETED") {
          await prisma.candidateApplication.update({
            where: { session: { id: interviewSessionId } },
            data: { status: "INTERVIEW_COMPLETED" },
          });
        }

        if (finalReport && candidateContext) {
          const events = accumulator.events as Array<{ question: string; answerSummary: string; score: number; feedback: string }>;
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
              improvements: finalReport.improvements,
              evaluationEvents: events,
            }),
          ]);

          sendJson(clientWs, { type: "final_report", data: finalReport });
          sendJson(clientWs, { type: "interview_complete" });
        }
      };

      clientWs.on("message", async (raw) => {
        const message = parseClientMessage(raw);
        if (!message) {
          sendJson(clientWs, { type: "error", message: "Invalid JSON message." });
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
              message: "Authenticate first by sending the interview access token.",
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
              sendJson(clientWs, { type: "error", message: "Invalid interview token." });
              clientWs.close(4403, "Invalid token");
              return;
            }

            if (application.interviewPreference !== "AI") {
              sendJson(clientWs, {
                type: "error",
                message: "This application is configured for a manual interview.",
              });
              clientWs.close(4403, "Manual interview");
              return;
            }

            if (application.accessTokenExpiresAt.getTime() < Date.now()) {
              await prisma.candidateApplication.update({
                where: { id: application.id },
                data: { status: "TOKEN_EXPIRED" },
              });
              sendJson(clientWs, { type: "error", message: "Interview link has expired." });
              clientWs.close(4403, "Token expired");
              return;
            }

            if (application.status === "INTERVIEW_COMPLETED") {
              sendJson(clientWs, { type: "error", message: "Interview already completed." });
              clientWs.close(4403, "Completed");
              return;
            }

            if (!application.template.systemInstructions) {
              sendJson(clientWs, {
                type: "error",
                message: "Interview template is not active yet. Contact support.",
              });
              clientWs.close(4403, "Template not generated");
              return;
            }

            if (application.session) {
              if (application.session.status === "COMPLETED") {
                sendJson(clientWs, { type: "error", message: "Interview already completed." });
                clientWs.close(4409, "Already completed");
                return;
              }
              if (application.session.status === "ACTIVE") {
                sendJson(clientWs, { type: "error", message: "Interview session already in progress." });
                clientWs.close(4409, "Session in progress");
                return;
              }
              // TERMINATED / FAILED / CONNECTING — stale, delete and allow retry
              await prisma.interviewSession.delete({ where: { id: application.session.id } });
            }

            const session = await prisma.interviewSession.create({
              data: {
                applicationId: application.id,
                provider: "gemini-live",
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
            candidateContext = {
              candidateName: application.candidateName,
              candidateEmail: application.candidateEmail,
              role: application.template.jobRole,
              templateInstructions: application.template.systemInstructions,
            };

            provider = new GeminiLiveInterviewProvider({
              onReady: () => {
                sendJson(clientWs, { type: "ready" });
              },
              onStatus: (statusMessage) => {
                sendJson(clientWs, { type: "status", message: statusMessage });
              },
              onError: (errorMessage) => {
                sendJson(clientWs, { type: "error", message: errorMessage });
              },
              onTranscript: (entry: InterviewTranscriptEntry) => {
                accumulator.transcript.push(entry);
                sendJson(clientWs, { type: "transcript", data: entry });
              },
              onAudioChunk: (data, mimeType) => {
                sendJson(clientWs, { type: "ai_audio_chunk", data, mimeType });
              },
              onEvaluationEvent: (event) => {
                accumulator.events.push(event);
                sendJson(clientWs, { type: "backend_event", data: event });
              },
              onFinalReport: (report) => {
                accumulator.finalReport = report;
                sendJson(clientWs, { type: "final_report", data: report });
              },
              onComplete: () => {
                sendJson(clientWs, { type: "interview_complete" });
                void finalizeSession("COMPLETED").catch((error) => {
                  console.error("Failed to finalize interview session:", error);
                });
              },
            });

            clearTimeout(authTimeout);
            authenticated = true;

            await provider.connect({
              systemInstructions: candidateContext.templateInstructions,
              openingPrompt: `Start the interview now by asking your first question for the ${candidateContext.role} role.`,
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
          } catch (error) {
            console.error("Interview auth/setup failed:", error);
            sendJson(clientWs, { type: "error", message: "Failed to start interview." });
            if (interviewSessionId) {
              await finalizeSession("FAILED");
            }
            clientWs.close(1011, "Setup failed");
          }

          return;
        }

        if (!provider) {
          sendJson(clientWs, { type: "error", message: "Interview provider unavailable." });
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
          provider.endInterview();
          return;
        }
      });

      clientWs.on("close", () => {
        clearTimeout(authTimeout);
        provider?.close();
        if (authenticated) {
          void finalizeSession("TERMINATED").catch((error) => {
            console.error("Failed to finalize disconnected session:", error);
          });
        }
      });
    });

    server.on("upgrade", (request, socket, head) => {
      const requestUrl = new URL(request.url || "/", `http://${request.headers.host}`);
      if (requestUrl.pathname === "/ws/interview") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
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
