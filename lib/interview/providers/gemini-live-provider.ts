import WebSocket from "ws";
import type {
  RealtimeInterviewCallbacks,
  RealtimeInterviewProvider,
  RealtimeInterviewSetup,
} from "../provider";
import type { InterviewFinalReport, InterviewTranscriptEntry } from "../types";
import { mergeTranscriptChunk } from "../utils";

const DEFAULT_MODEL_CANDIDATES = [
  "gemini-3.1-flash-live-preview",
  "gemini-live-2.5-flash-native-audio",
  "gemini-1.5-flash-002",
];

function getModelCandidates(modelOverride?: string): string[] {
  const preferred = (modelOverride || "").trim();
  const all = preferred
    ? [preferred, ...DEFAULT_MODEL_CANDIDATES]
    : DEFAULT_MODEL_CANDIDATES;

  return [...new Set(all)];
}

function safeParseMessage(raw: WebSocket.RawData): Record<string, any> | null {
  try {
    return JSON.parse(raw.toString()) as Record<string, any>;
  } catch {
    return null;
  }
}

function parseFunctionArgs(rawArgs: unknown): Record<string, unknown> {
  if (!rawArgs) {
    return {};
  }

  if (typeof rawArgs === "string") {
    try {
      return JSON.parse(rawArgs) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  if (typeof rawArgs === "object") {
    return rawArgs as Record<string, unknown>;
  }

  return {};
}

export class GeminiLiveInterviewProvider implements RealtimeInterviewProvider {
  readonly providerName = "gemini-live";
  selectedModel: string | null = null;
  readonly audioInputRate = 16000;

  private readonly apiKey: string;
  private readonly callbacks: RealtimeInterviewCallbacks;
  private readonly modelCandidates: string[];

  private setup: RealtimeInterviewSetup | null = null;
  private ws: WebSocket | null = null;
  private modelIndex = 0;
  private setupComplete = false;
  private explicitApiErrorSeen = false;
  private pendingInterviewerTranscript = "";
  private sawOutputTranscriptionThisTurn = false;
  private completed = false;
  private manuallyClosed = false;

  constructor(callbacks: RealtimeInterviewCallbacks, modelOverride?: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    this.apiKey = apiKey;
    this.callbacks = callbacks;
    this.modelCandidates = getModelCandidates(
      modelOverride || process.env.GEMINI_LIVE_MODEL,
    );
  }

  async connect(setup: RealtimeInterviewSetup): Promise<void> {
    this.setup = setup;
    await this.connectWithRetry();
  }

  sendAudioChunk(data: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.setupComplete) {
      return;
    }

    this.sendJson({
      realtimeInput: {
        audio: {
          data,
          mimeType: "audio/pcm;rate=16000",
        },
      },
    });
  }

  endAudio(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.sendJson({ realtimeInput: { audioStreamEnd: true } });
  }

  endInterview(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.sendJson({
      realtimeInput: {
        text: "Interview is over. Please call finalize_interview_report now.",
      },
    });

    setTimeout(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
    }, 8000);
  }

  close(): void {
    this.manuallyClosed = true;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }

  private async connectWithRetry(): Promise<void> {
    while (this.modelIndex < this.modelCandidates.length) {
      const modelName = this.modelCandidates[this.modelIndex];
      this.selectedModel = modelName;

      try {
        await this.connectOnce(modelName);
        return;
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        console.error(`[Gemini] Model "${modelName}" failed: ${reason}`);
        this.modelIndex += 1;
        if (this.modelIndex < this.modelCandidates.length) {
          this.callbacks.onStatus("Retrying with another Live model...");
        }
      }
    }

    throw new Error(
      "Unable to initialize Gemini Live session. Check GEMINI_API_KEY, GEMINI_LIVE_MODEL, and API access.",
    );
  }

  private connectOnce(modelName: string): Promise<void> {
    if (!this.setup) {
      return Promise.reject(new Error("Provider setup was not initialized."));
    }

    return new Promise((resolve, reject) => {
      let settled = false;
      const wsUrl =
        "wss://generativelanguage.googleapis.com/ws/" +
        "google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent" +
        `?key=${encodeURIComponent(this.apiKey)}`;

      this.setupComplete = false;
      this.explicitApiErrorSeen = false;
      this.pendingInterviewerTranscript = "";
      this.sawOutputTranscriptionThisTurn = false;

      this.callbacks.onStatus(`Trying model: ${modelName}`);
      this.ws = new WebSocket(wsUrl);

      const failSetup = (message: string) => {
        if (settled) {
          return;
        }

        settled = true;
        this.callbacks.onError(message);
        reject(new Error(message));
      };

      this.ws.on("open", () => {
        this.sendJson(this.buildSetupMessage(modelName, this.setup!));
        this.callbacks.onStatus("Gemini socket connected.");
      });

      this.ws.on("unexpected-response", (_request, response) => {
        let body = "";
        response.on("data", (chunk) => {
          body += chunk.toString();
        });
        response.on("end", () => {
          failSetup(
            `Gemini HTTP ${response.statusCode || "unknown"}: ${body || "No response body"}`,
          );
        });
      });

      this.ws.on("message", (data) => {
        const message = safeParseMessage(data);
        if (!message) {
          return;
        }

        if (message.setupComplete && !this.setupComplete) {
          this.setupComplete = true;
          this.callbacks.onStatus("Interview started.");
          this.callbacks.onReady();
          this.sendJson({
            realtimeInput: {
              text: this.setup!.openingPrompt,
            },
          });
          if (!settled) {
            settled = true;
            resolve();
          }
        }

        if (message.error) {
          this.explicitApiErrorSeen = true;
          const errorMessage =
            message.error.message ||
            message.error.status ||
            JSON.stringify(message.error);
          this.callbacks.onError(`Gemini API error: ${errorMessage}`);
        }

        if (message.serverContent) {
          this.handleServerContent(message.serverContent);
        }

        if (message.toolCall) {
          this.handleToolCall(message.toolCall);
        }

        if (message.goAway) {
          this.callbacks.onStatus("Gemini requested reconnect soon.");
        }
      });

      this.ws.on("error", (error) => {
        const errorMessage = `Gemini websocket error: ${error.message}`;
        this.callbacks.onError(errorMessage);
        if (!this.setupComplete) {
          failSetup(errorMessage);
        }
      });

      this.ws.on("close", (code, reasonBuffer) => {
        const reason = reasonBuffer ? reasonBuffer.toString() : "";
        this.flushPendingInterviewerTranscript();

        if (this.setupComplete) {
          this.callbacks.onStatus(
            `Gemini session closed (code ${code}${reason ? `, reason: ${reason}` : ""}).`,
          );
          if (!this.completed) {
            this.completed = true;
            this.callbacks.onComplete();
          }
          return;
        }

        if (this.manuallyClosed) {
          failSetup("Interview session was closed before setup completed.");
          return;
        }

        if (!this.explicitApiErrorSeen) {
          const closeInfo = `code=${code}${reason ? `, reason=${reason}` : ""}`;
          console.error(`[Gemini] WS closed before setup: ${closeInfo}`);
          failSetup(
            `Session closed before setup completed (${closeInfo}). Check GEMINI_API_KEY and Gemini Live model access.`,
          );
        }
      });
    });
  }

  private buildSetupMessage(modelName: string, setup: RealtimeInterviewSetup) {
    return {
      setup: {
        model: `models/${modelName}`,
        generationConfig: {
          responseModalities: ["AUDIO"],
          temperature: 0.4,
        },
        realtimeInputConfig: {
          automaticActivityDetection: {
            startOfSpeechSensitivity: "START_SENSITIVITY_LOW",
            endOfSpeechSensitivity: "END_SENSITIVITY_LOW",
            silenceDurationMs: 2000,
            prefixPaddingMs: 300,
          },
        },
        systemInstruction: {
          parts: [{ text: setup.systemInstructions }],
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        tools: [
          {
            functionDeclarations: [
              {
                name: "save_interview_event",
                description:
                  "Store per-question interview result for backend persistence.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    question: { type: "STRING" },
                    answerSummary: { type: "STRING" },
                    score: { type: "NUMBER" },
                    feedback: { type: "STRING" },
                  },
                  required: ["question", "answerSummary", "score", "feedback"],
                },
              },
              {
                name: "finalize_interview_report",
                description:
                  "Store final interview report and mark interview as completed.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    summary: { type: "STRING" },
                    strengths: {
                      type: "ARRAY",
                      items: { type: "STRING" },
                    },
                    improvements: {
                      type: "ARRAY",
                      items: { type: "STRING" },
                    },
                    finalScore: { type: "NUMBER" },
                  },
                  required: [
                    "summary",
                    "strengths",
                    "improvements",
                    "finalScore",
                  ],
                },
              },
            ],
          },
        ],
      },
    };
  }

  private handleServerContent(serverContent: Record<string, any>) {
    if (serverContent.inputTranscription?.text) {
      const entry: InterviewTranscriptEntry = {
        role: "candidate",
        text: String(serverContent.inputTranscription.text),
      };
      this.callbacks.onTranscript(entry);
    }

    if (serverContent.outputTranscription?.text) {
      this.sawOutputTranscriptionThisTurn = true;
      this.pendingInterviewerTranscript = mergeTranscriptChunk(
        this.pendingInterviewerTranscript,
        String(serverContent.outputTranscription.text),
      );
    }

    if (serverContent.modelTurn?.parts?.length) {
      const textParts: string[] = [];
      for (const part of serverContent.modelTurn.parts) {
        if (
          part.inlineData?.data &&
          part.inlineData?.mimeType?.startsWith("audio/")
        ) {
          this.callbacks.onAudioChunk(part.inlineData.data, part.inlineData.mimeType);
        }
        if (part.text) {
          textParts.push(part.text);
        }
      }

      const text = textParts.join("\n");
      if (text && !this.sawOutputTranscriptionThisTurn) {
        this.pendingInterviewerTranscript = mergeTranscriptChunk(
          this.pendingInterviewerTranscript,
          text,
        );
      }
    }

    if (
      (serverContent.turnComplete || serverContent.generationComplete) &&
      this.pendingInterviewerTranscript
    ) {
      this.flushPendingInterviewerTranscript();
    }
  }

  private flushPendingInterviewerTranscript() {
    if (!this.pendingInterviewerTranscript) {
      return;
    }

    this.callbacks.onTranscript({
      role: "interviewer",
      text: this.pendingInterviewerTranscript,
    });
    this.pendingInterviewerTranscript = "";
    this.sawOutputTranscriptionThisTurn = false;
  }

  private handleToolCall(toolCallMessage: Record<string, any>) {
    const functionResponses: Array<Record<string, any>> = [];

    for (const functionCall of toolCallMessage.functionCalls || []) {
      const args = parseFunctionArgs(functionCall.args);
      let result: Record<string, unknown>;

      if (functionCall.name === "save_interview_event") {
        const event = {
          at: new Date().toISOString(),
          question: String(args.question || ""),
          answerSummary: String(args.answerSummary || ""),
          score: Number(args.score || 0),
          feedback: String(args.feedback || ""),
        };
        this.callbacks.onEvaluationEvent(event);
        result = { ok: true, stored: event };
      } else if (functionCall.name === "finalize_interview_report") {
        const report: InterviewFinalReport = {
          summary: String(args.summary || ""),
          strengths: Array.isArray(args.strengths)
            ? args.strengths.map((item) => String(item))
            : [],
          improvements: Array.isArray(args.improvements)
            ? args.improvements.map((item) => String(item))
            : [],
          finalScore: Number(args.finalScore || 0),
        };
        this.callbacks.onFinalReport(report);
        if (!this.completed) {
          this.completed = true;
          this.callbacks.onComplete();
        }
        result = { ok: true, reportStored: true };
      } else {
        result = { ok: false, error: `Unknown tool: ${String(functionCall.name)}` };
      }

      functionResponses.push({
        name: functionCall.name,
        id: functionCall.id,
        response: { result },
      });
    }

    this.sendJson({
      toolResponse: {
        functionResponses,
      },
    });
  }

  private sendJson(payload: Record<string, unknown>) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    this.ws.send(JSON.stringify(payload));
  }
}
