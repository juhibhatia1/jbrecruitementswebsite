import WebSocket from "ws";
import type {
  RealtimeInterviewCallbacks,
  RealtimeInterviewProvider,
  RealtimeInterviewSetup,
} from "../provider";
import type { InterviewFinalReport, InterviewReferenceCard } from "../types";

// Supported GA voices for gpt-realtime-2
export const OPENAI_REALTIME_VOICES = [
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

function safeParseMessage(raw: WebSocket.RawData): Record<string, any> | null {
  try {
    return JSON.parse(raw.toString()) as Record<string, any>;
  } catch {
    return null;
  }
}

export class OpenAiRealtimeProvider implements RealtimeInterviewProvider {
  readonly providerName = "openai-realtime";
  readonly selectedModel: string | null;
  readonly audioInputRate = 24000;

  private readonly apiKey: string;
  private readonly callbacks: RealtimeInterviewCallbacks;
  private readonly modelName: string;
  private readonly voice: OpenAIRealtimeVoice;

  private setup: RealtimeInterviewSetup | null = null;
  private ws: WebSocket | null = null;
  private completed = false;
  private manuallyClosed = false;
  private sessionInitialized = false;

  constructor(
    callbacks: RealtimeInterviewCallbacks,
    modelOverride?: string,
    voiceOverride?: string,
  ) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY in environment variables.");
    }

    this.apiKey = apiKey;
    this.callbacks = callbacks;
    this.modelName = (
      modelOverride ||
      process.env.OPENAI_REALTIME_MODEL ||
      "gpt-realtime-2"
    ).trim();
    this.selectedModel = this.modelName;

    const rawVoice = (
      voiceOverride ||
      process.env.OPENAI_REALTIME_VOICE ||
      "alloy"
    ).trim();
    this.voice = (
      OPENAI_REALTIME_VOICES.includes(rawVoice as OpenAIRealtimeVoice)
        ? rawVoice
        : "alloy"
    ) as OpenAIRealtimeVoice;
  }

  async connect(setup: RealtimeInterviewSetup): Promise<void> {
    this.setup = setup;

    return new Promise((resolve, reject) => {
      let settled = false;
      const url = `wss://api.openai.com/v1/realtime?model=${this.modelName}`;

      this.callbacks.onStatus(`Connecting to OpenAI Realtime (${this.modelName})...`);

      this.ws = new WebSocket(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          // Stable privacy-preserving identifier for abuse monitoring
          "OpenAI-Safety-Identifier": "jb-recruitment-interview",
        },
      });

      this.ws.on("open", () => {
        this.callbacks.onStatus("OpenAI WebSocket connected. Sending configuration...");
        this.sendSessionUpdate();
      });

      this.ws.on("message", (data) => {
        const message = safeParseMessage(data);
        if (!message) return;

        if (message.type !== "response.function_call_arguments.delta" && message.type !== "response.audio_transcript.delta" && message.type !== "response.output_audio.delta") {
          console.log("[OpenAI Realtime MSG]:", JSON.stringify(message).slice(0, 300));
        }

        // Only fire onReady once when the session is first created
        if (message.type === "session.created") {
          this.callbacks.onStatus("Interview started (OpenAI active).");
          this.callbacks.onReady();

          if (!this.sessionInitialized) {
            this.sessionInitialized = true;
            this.sendOpeningPrompt();
          }

          if (!settled) {
            settled = true;
            resolve();
          }
        }

        // session.updated confirms our config was accepted — no extra onReady
        if (message.type === "session.updated") {
          this.callbacks.onStatus("Session configured.");
        }

        if (message.type === "error" || message.error) {
          const errMsg =
            message.error?.message || message.message || JSON.stringify(message);
          console.error("[OpenAI Realtime Error]:", errMsg);

          let userFriendlyMsg = errMsg;
          if (
            errMsg.includes("does not exist") ||
            errMsg.includes("do not have access")
          ) {
            userFriendlyMsg =
              `OpenAI Realtime API access denied. Requires Tier 1+ paid account with billing at platform.openai.com. ` +
              `(Model: ${this.modelName})`;
          }

          this.callbacks.onError(userFriendlyMsg);
          if (!settled) {
            settled = true;
            reject(new Error(userFriendlyMsg));
          }
        }

        // Audio output chunk (GA event name)
        if (message.type === "response.output_audio.delta" && message.delta) {
          this.callbacks.onAudioChunk(message.delta, "audio/pcm;rate=24000");
        }

        // Interviewer transcript complete (GA event name)
        if (
          message.type === "response.output_audio_transcript.done" &&
          message.transcript
        ) {
          this.callbacks.onTranscript({
            role: "interviewer",
            text: String(message.transcript).trim(),
          });
        }

        // Candidate transcript from server VAD + transcription
        if (
          message.type === "conversation.item.input_audio_transcription.completed" &&
          message.transcript
        ) {
          this.callbacks.onTranscript({
            role: "candidate",
            text: String(message.transcript).trim(),
          });
        }

        // Tool call arguments assembled
        if (message.type === "response.function_call_arguments.done") {
          this.handleFunctionCall(message);
        }

        // Response turn complete
        if (message.type === "response.done") {
          const response = message.response as Record<string, any> | undefined;
          if (response?.status === "failed") {
            const failReason = response?.status_details?.error?.message || "Unknown";
            console.error("[OpenAI Realtime] Response failed:", failReason);
            this.callbacks.onError(`AI response failed: ${failReason}`);
          }
        }
      });

      this.ws.on("error", (error) => {
        const errMsg = `OpenAI socket error: ${error.message}`;
        this.callbacks.onError(errMsg);
        if (!settled) {
          settled = true;
          reject(new Error(errMsg));
        }
      });

      this.ws.on("close", (code, reasonBuffer) => {
        const reason = reasonBuffer ? reasonBuffer.toString() : "";
        this.callbacks.onStatus(
          `OpenAI connection closed (code ${code}${reason ? `, reason: ${reason}` : ""}).`,
        );

        if (this.manuallyClosed) {
          if (!settled) {
            settled = true;
            reject(new Error("Interview session closed before setup."));
          }
          return;
        }

        if (!this.completed) {
          this.completed = true;
          this.callbacks.onComplete();
        }
      });
    });
  }

  sendAudioChunk(data: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.sendJson({ type: "input_audio_buffer.append", audio: data });
  }

  endAudio(): void {
    // With server VAD active the model detects silence automatically.
    // input_audio_buffer.commit is a no-op when VAD is enabled but harmless.
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.sendJson({ type: "input_audio_buffer.commit" });
  }

  endInterview(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.sendJson({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Interview is over. Please evaluate my performance and finalize the interview report now.",
          },
        ],
      },
    });

    this.sendJson({ type: "response.create" });
  }

  close(): void {
    this.manuallyClosed = true;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }

  private sendOpeningPrompt(): void {
    this.sendJson({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: this.setup!.openingPrompt }],
      },
    });
    this.sendJson({ type: "response.create" });
  }

  private sendSessionUpdate(): void {
    if (!this.setup) return;

    // GA schema: no modalities field, nested session.audio.input/output
    this.sendJson({
      type: "session.update",
      session: {
        type: "realtime",
        instructions: this.setup.systemInstructions,
        audio: {
          input: {
            format: { type: "audio/pcm", rate: 24000 },
            turn_detection: {
              type: "server_vad",
              threshold: 0.92,
              prefix_padding_ms: 400,
              silence_duration_ms: 1800,
            },
            transcription: {
              model: "whisper-1",
            },
          },
          output: {
            format: { type: "audio/pcm", rate: 24000 },
            voice: this.voice,
          },
        },
        tools: [
          {
            type: "function",
            name: "save_interview_event",
            description: "Store per-question interview result for backend persistence.",
            parameters: {
              type: "object",
              properties: {
                question: { type: "string" },
                answerSummary: { type: "string" },
                score: { type: "number" },
                feedback: { type: "string" },
              },
              required: ["question", "answerSummary", "score", "feedback"],
            },
          },
          {
            type: "function",
            name: "finalize_interview_report",
            description: "Store final interview report and mark interview as completed.",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string" },
                strengths: { type: "array", items: { type: "string" } },
                improvements: { type: "array", items: { type: "string" } },
                finalScore: { type: "number" },
              },
              required: ["summary", "strengths", "improvements", "finalScore"],
            },
          },
          {
            type: "function",
            name: "show_reference_card",
            description: "Display a reference card with structured information on the candidate's screen.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Card title" },
                content: { type: "string", description: "Markdown content to display" },
              },
              required: ["title", "content"],
            },
          },
        ],
        tool_choice: "auto",
      },
    });
  }

  private handleFunctionCall(message: Record<string, any>): void {
    console.log("[OpenAI] Function call received:", message.name, String(message.arguments || "").slice(0, 150));

    let args: Record<string, any>;
    try {
      args = JSON.parse(message.arguments || "{}");
    } catch {
      args = {};
    }

    let result: Record<string, any>;
    let needsContinuation = true;

    if (message.name === "save_interview_event") {
      const event = {
        at: new Date().toISOString(),
        question: String(args.question || ""),
        answerSummary: String(args.answerSummary || ""),
        score: Number(args.score || 0),
        feedback: String(args.feedback || ""),
      };
      this.callbacks.onEvaluationEvent(event);
      result = { ok: true, stored: event };
    } else if (message.name === "finalize_interview_report") {
      const report: InterviewFinalReport = {
        summary: String(args.summary || ""),
        strengths: Array.isArray(args.strengths) ? args.strengths.map(String) : [],
        improvements: Array.isArray(args.improvements)
          ? args.improvements.map(String)
          : [],
        finalScore: Number(args.finalScore || 0),
      };
      this.callbacks.onFinalReport(report);
      if (!this.completed) {
        this.completed = true;
        this.callbacks.onComplete();
      }
      result = { ok: true, reportStored: true };
    } else if (message.name === "show_reference_card") {
      console.log("[OpenAI] show_reference_card tool called, args:", JSON.stringify(args));
      const card: InterviewReferenceCard = {
        id: `card-${Date.now()}`,
        title: String(args.title || ""),
        content: String(args.content || ""),
      };
      this.callbacks.onReferenceCard(card);
      result = { ok: true };
      // needsContinuation stays true — AI must continue after card to say
      // "I've shared the structure on your screen. Whenever you're ready..."
    } else {
      result = { ok: false, error: `Unknown function: ${message.name}` };
    }

    this.sendJson({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: message.call_id,
        output: JSON.stringify(result),
      },
    });

    if (needsContinuation) {
      this.sendJson({ type: "response.create" });
    }
  }

  private sendJson(payload: Record<string, unknown>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(payload));
  }
}
