import WebSocket from "ws";
import type {
  RealtimeInterviewCallbacks,
  RealtimeInterviewProvider,
  RealtimeInterviewSetup,
} from "../provider";
import type { InterviewFinalReport } from "../types";

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

  private readonly apiKey: string;
  private readonly callbacks: RealtimeInterviewCallbacks;
  private readonly modelName: string;

  private setup: RealtimeInterviewSetup | null = null;
  private ws: WebSocket | null = null;
  private completed = false;
  private manuallyClosed = false;
  private sessionInitialized = false;

  constructor(callbacks: RealtimeInterviewCallbacks, modelOverride?: string) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY in environment variables.");
    }

    this.apiKey = apiKey;
    this.callbacks = callbacks;
    this.modelName =
      (modelOverride || process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2").trim();
    this.selectedModel = this.modelName;
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
        },
      });

      this.ws.on("open", () => {
        this.callbacks.onStatus("OpenAI WebSocket connected. Sending configuration...");
        this.sendSessionUpdate();
      });

      this.ws.on("message", (data) => {
        const message = safeParseMessage(data);
        if (!message) return;

        // Log every message from OpenAI for debugging schema issues
        console.log("[OpenAI Realtime MSG]:", JSON.stringify(message).slice(0, 300));

        // Handle initialization success
        if (message.type === "session.created" || message.type === "session.updated") {
          this.callbacks.onStatus("Interview started (OpenAI active).");
          this.callbacks.onReady();

          if (!this.sessionInitialized) {
            this.sessionInitialized = true;

            // Send opening prompt
            this.sendJson({
              type: "conversation.item.create",
              item: {
                type: "message",
                role: "user",
                content: [
                  {
                    type: "input_text",
                    text: this.setup!.openingPrompt,
                  },
                ],
              },
            });

            // Trigger response generation
            this.sendJson({
              type: "response.create",
            });
          }

          if (!settled) {
            settled = true;
            resolve();
          }
        }

        // Handle error responses
        if (message.type === "error" || message.error) {
          const errMsg = message.error?.message || message.message || JSON.stringify(message);
          console.error("[OpenAI Realtime Error]:", errMsg);

          // Provide a clearer message for common access issues
          let userFriendlyMsg = errMsg;
          if (errMsg.includes("does not exist") || errMsg.includes("do not have access")) {
            userFriendlyMsg = `OpenAI Realtime API access denied. The Realtime API requires a Tier 1+ paid OpenAI account. ` +
              `Please ensure your account has billing set up at platform.openai.com. (Model: ${this.modelName})`;
          }

          this.callbacks.onError(userFriendlyMsg);
          if (!settled) {
            settled = true;
            reject(new Error(userFriendlyMsg));
          }
        }

        // Forward audio output delta
        if (message.type === "response.output_audio.delta" && message.delta) {
          this.callbacks.onAudioChunk(message.delta, "audio/pcm;rate=24000");
        }

        // Interviewer speech transcript completed
        if (message.type === "response.output_audio_transcript.done" && message.transcript) {
          this.callbacks.onTranscript({
            role: "interviewer",
            text: String(message.transcript).trim(),
          });
        }

        // Candidate speech transcript completed (via server VAD + Whisper)
        if (message.type === "conversation.item.input_audio_transcription.completed" && message.transcript) {
          this.callbacks.onTranscript({
            role: "candidate",
            text: String(message.transcript).trim(),
          });
        }

        // Handle function calls
        if (message.type === "response.function_call_arguments.done") {
          this.handleFunctionCall(message);
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
        this.callbacks.onStatus(`OpenAI connection closed (code ${code}${reason ? `, reason: ${reason}` : ""}).`);

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
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.sendJson({
      type: "input_audio_buffer.append",
      audio: data,
    });
  }

  endAudio(): void {
    // OpenAI VAD automatically detects start/end of speech.
    // We send input_audio_buffer.commit just in case of VAD latency.
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    this.sendJson({
      type: "input_audio_buffer.commit",
    });
  }

  endInterview(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

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

    this.sendJson({
      type: "response.create",
    });
  }

  close(): void {
    this.manuallyClosed = true;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }

  private sendSessionUpdate() {
    if (!this.setup) return;

    this.sendJson({
      type: "session.update",
      session: {
        type: "realtime",
        model: this.modelName,
        instructions: this.setup.systemInstructions,
        output_modalities: ["audio", "text"],
        audio: {
          input: {
            format: "pcm16",
            turn_detection: {
              type: "server_vad",
              threshold: 0.8,
              prefix_padding_ms: 300,
              silence_duration_ms: 1500,
            },
            transcription: {
              model: "gpt-4o-transcribe",
            },
          },
          output: {
            format: "pcm16",
            voice: "alloy",
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
        ],
        tool_choice: "auto",
      },
    });
  }

  private handleFunctionCall(message: Record<string, any>) {
    let args: Record<string, any>;
    try {
      args = JSON.parse(message.arguments || "{}");
    } catch {
      args = {};
    }

    let result: Record<string, any>;

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
        improvements: Array.isArray(args.improvements) ? args.improvements.map(String) : [],
        finalScore: Number(args.finalScore || 0),
      };
      this.callbacks.onFinalReport(report);
      if (!this.completed) {
        this.completed = true;
        this.callbacks.onComplete();
      }
      result = { ok: true, reportStored: true };
    } else {
      result = { ok: false, error: `Unknown function: ${message.name}` };
    }

    // Submit tool response back to OpenAI Realtime session
    this.sendJson({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: message.call_id,
        output: JSON.stringify(result),
      },
    });

    // Request response so the model knows it is resolved
    this.sendJson({
      type: "response.create",
    });
  }

  private sendJson(payload: Record<string, unknown>) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    this.ws.send(JSON.stringify(payload));
  }
}
