"use client";

import type {
  InterviewEvaluationEvent,
  InterviewFinalReport,
  InterviewReferenceCard,
  InterviewTranscriptEntry,
} from "./types";

type WebRtcCallbacks = {
  onReady: () => void;
  onStatus: (message: string) => void;
  onError: (message: string) => void;
  onTranscript: (entry: InterviewTranscriptEntry) => void;
  onEvaluationEvent: (event: InterviewEvaluationEvent) => void;
  onFinalReport: (report: InterviewFinalReport) => void;
  onReferenceCard: (card: InterviewReferenceCard) => void;
  onInterrupted: () => void;
  onComplete: () => void;
  onAssistantSpeakingChange?: (speaking: boolean) => void;
  onRemoteStream?: (stream: MediaStream) => void;
};

type ConnectPayload = {
  token: string;
  sessionId: string;
  clientSecret: string;
  systemInstructions: string;
  openingPrompt: string;
  sessionBlueprint?: {
    questionTarget: number;
    sections: Array<{ name: string; minutes: number; objective: string; questionBankTarget: number }>;
  } | null;
  voice: string;
  durationMinutes: number;
  sessionStartedAt: string;
  playbackAudioContext?: AudioContext;
};

type OpenAIEventRecord = Record<string, unknown> & {
  type?: string;
  error?: { message?: string };
  transcript?: unknown;
  text?: unknown;
  arguments?: unknown;
  name?: unknown;
  call_id?: unknown;
};

function safeParseMessage(raw: string): OpenAIEventRecord | null {
  try {
    return JSON.parse(raw) as OpenAIEventRecord;
  } catch {
    return null;
  }
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function computeMinimumQuestionTarget(durationMinutes: number): number {
  if (durationMinutes >= 30) return 14;
  if (durationMinutes >= 20) return 10;
  if (durationMinutes >= 15) return 8;
  if (durationMinutes >= 10) return 6;
  return 4;
}

const FINAL_CLOSING_WINDOW_MS = 60_000;

function isSectionTransitionCue(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("let's move on to section") ||
    t.includes("lets move on to section") ||
    /section\s+\d+/.test(t)
  );
}

function isClosingCue(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("do you have any questions for me") ||
    t.includes("do you have any questions about the company") ||
    t.includes("before we wrap up") ||
    t.includes("thanks for the conversation") ||
    t.includes("thank you for your time") ||
    t.includes("good luck with your interview prep") ||
    t.includes("we covered")
  );
}

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function pcmBytesToAudioBuffer(
  ctx: AudioContext,
  bytes: Uint8Array,
  sampleRate: number,
): AudioBuffer {
  const samples = bytes.length / 2;
  const buffer = ctx.createBuffer(1, samples, sampleRate);
  const channelData = buffer.getChannelData(0);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  for (let i = 0; i < samples; i++) {
    const int16 = view.getInt16(i * 2, true);
    channelData[i] = int16 / (int16 < 0 ? 0x8000 : 0x7fff);
  }

  return buffer;
}

export class OpenAIWebRtcInterviewTransport {
  private readonly callbacks: WebRtcCallbacks;
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private completed = false;
  private openingPromptSent = false;
  private sessionUpdateSent = false;
  private manuallyClosed = false;
  private assistantSpeaking = false;
  private voice = "marin";
  private token = "";
  private sessionId = "";
  private durationMs = 15 * 60 * 1000;
  private sessionStartedAtMs = Date.now();
  private durationCompleteSignaled = false;
  private hardStopSignaled = false;
  private questionsAsked = 0;
  private minimumQuestionTarget = 8;
  private sectionPlan: Array<{ name: string; minutes: number; objective: string; questionBankTarget: number }> = [];
  private sectionAccumulatedMs = new Map<string, number>();
  private sectionLastEnteredAtMs = new Map<string, number>();
  private currentSectionName: string | null = null;
  private lastGuardInterventionAtMs = 0;
  private playbackCtx: AudioContext | null = null;
  private playbackCtxOwned = false;
  private playbackCursor = 0;
  private scheduledSources: AudioBufferSourceNode[] = [];

  constructor(callbacks: WebRtcCallbacks) {
    this.callbacks = callbacks;
  }

  async connect(payload: ConnectPayload, localStream: MediaStream): Promise<void> {
    this.voice = payload.voice;
    this.token = payload.token;
    this.sessionId = payload.sessionId;
    this.durationMs = Math.max(60_000, Math.floor(payload.durationMinutes * 60_000));
    this.minimumQuestionTarget =
      Number(payload.sessionBlueprint?.questionTarget) > 0
        ? Math.floor(Number(payload.sessionBlueprint?.questionTarget))
        : computeMinimumQuestionTarget(payload.durationMinutes);
    this.questionsAsked = 0;
    this.sectionPlan = Array.isArray(payload.sessionBlueprint?.sections)
      ? payload.sessionBlueprint!.sections
      : [];
    this.sectionAccumulatedMs = new Map();
    this.sectionLastEnteredAtMs = new Map();
    this.currentSectionName = null;
    const parsedStart = Date.parse(payload.sessionStartedAt);
    this.sessionStartedAtMs = Number.isFinite(parsedStart) ? parsedStart : Date.now();
    this.playbackCtx = payload.playbackAudioContext ?? null;
    this.playbackCtxOwned = !payload.playbackAudioContext;
    this.pc = new RTCPeerConnection();
    this.pc.onconnectionstatechange = () => {
      if (!this.pc) return;
      this.callbacks.onStatus(`WebRTC connection state: ${this.pc.connectionState}`);
      if (this.pc.connectionState === "failed") {
        this.callbacks.onError("WebRTC connection failed.");
      }
    };

    this.pc.ontrack = (event) => {
      const stream = event.streams[0] ?? new MediaStream([event.track]);
      this.callbacks.onRemoteStream?.(stream);
    };

    for (const track of localStream.getTracks()) {
      this.pc.addTrack(track, localStream);
    }

    this.dc = this.pc.createDataChannel("oai-events");
    this.dc.onopen = () => {
      this.callbacks.onStatus("OpenAI WebRTC data channel opened.");
      this.sendSessionUpdate(payload.systemInstructions);
      this.sendOpeningPrompt(payload.openingPrompt);
      this.callbacks.onReady();
    };

    this.dc.onmessage = (event) => {
      const message = safeParseMessage(String(event.data));
      if (!message) return;

      if (message.type === "session.created" || message.type === "session.updated") {
        this.callbacks.onStatus("OpenAI Realtime session ready.");
      }

      if (message.type === "error" || message.error) {
        const errMsg =
          readString(message.error?.message) ||
          readString(message.message) ||
          JSON.stringify(message);
        this.callbacks.onError(errMsg);
      }

      if (message.type === "response.output_audio_transcript.done" && message.transcript) {
        const interviewerText = String(message.transcript).trim();
        this.callbacks.onTranscript({
          role: "interviewer",
          text: interviewerText,
        });
        this.enforceRealtimePacingGuards(interviewerText);
      }

      if (
        (message.type === "conversation.item.input_audio_transcription.completed" ||
          message.type === "conversation.item.audio_transcription.completed") &&
        (message.transcript || message.text)
      ) {
        const text = String(message.transcript || message.text || "").trim();
        if (text) {
          this.callbacks.onTranscript({ role: "candidate", text });
          if (!this.completed) {
            this.sendJson({ type: "response.create" });
          }
        }
      }

      if (message.type === "response.function_call_arguments.done") {
        void this.handleFunctionCall(message);
      }

      if (message.type === "input_audio_buffer.speech_started") {
        if (this.assistantSpeaking) {
          this.cancelResponse();
        }
        this.callbacks.onInterrupted();
      }

      if (message.type === "response.created") {
        this.assistantSpeaking = true;
        this.callbacks.onAssistantSpeakingChange?.(true);
      }

      if (message.type === "response.output_audio.delta" && message.delta) {
        this.playAudioDelta(readString(message.delta));
        this.assistantSpeaking = true;
        this.callbacks.onAssistantSpeakingChange?.(true);
      }

      if (message.type === "response.done") {
        this.assistantSpeaking = false;
        this.callbacks.onAssistantSpeakingChange?.(false);
      }
    };

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    const answerResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${payload.clientSecret}`,
        "Content-Type": "application/sdp",
      },
      body: offer.sdp || "",
    });

    if (!answerResponse.ok) {
      const body = await answerResponse.text();
      throw new Error(`OpenAI Realtime call failed (${answerResponse.status}): ${body}`);
    }

    const answerSdp = await answerResponse.text();
    await this.pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
    this.callbacks.onStatus("OpenAI WebRTC session established.");
  }

  endAudio(): void {
    if (!this.dc || this.dc.readyState !== "open") {
      return;
    }

    this.sendJson({ type: "input_audio_buffer.commit" });
  }

  endInterview(): void {
    if (!this.dc || this.dc.readyState !== "open") return;

    this.sendJson({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: "The candidate has chosen to end the interview. Say exactly: 'Since you've decided to end the interview, I'll close the session now. Thank you for your time — your performance report will be generated shortly.' Then immediately call finalize_interview_report with the evaluation.",
          },
        ],
      },
    });
    this.sendJson({ type: "response.create" });

    setTimeout(() => {
      if (this.pc && this.pc.connectionState !== "closed") {
        this.pc.close();
      }
    }, 12000);
  }

  sendOrchestrationMessage(text: string): void {
    if (!text.trim() || !this.dc || this.dc.readyState !== "open" || this.completed) return;
    if (text.includes("TIME_SIGNAL:DURATION_COMPLETE")) {
      this.durationCompleteSignaled = true;
    }
    if (text.includes("TIME_SIGNAL:HARD_STOP_REACHED")) {
      this.hardStopSignaled = true;
    }

    this.sendJson({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }],
      },
    });
    this.sendJson({ type: "response.create" });
  }

  cancelResponse(): void {
    if (!this.dc || this.dc.readyState !== "open") return;
    this.sendJson({ type: "response.cancel" });
  }

  close(): void {
    this.manuallyClosed = true;
    this.completed = true;
    this.stopPlayback();
    try {
      this.dc?.close();
    } catch {}
    try {
      this.pc?.close();
    } catch {}
    this.dc = null;
    this.pc = null;
  }

  private playAudioDelta(b64: string): void {
    if (!b64) return;
    if (!this.playbackCtx) {
      this.playbackCtx = new AudioContext();
      this.playbackCtxOwned = true;
    }

    const ctx = this.playbackCtx;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const bytes = base64ToUint8Array(b64);
    const buffer = pcmBytesToAudioBuffer(ctx, bytes, 24000);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    this.scheduledSources.push(source);
    source.onended = () => {
      this.scheduledSources = this.scheduledSources.filter((item) => item !== source);
    };

    const startAt = Math.max(ctx.currentTime, this.playbackCursor);
    source.start(startAt);
    this.playbackCursor = startAt + buffer.duration;
  }

  private stopPlayback(): void {
    for (const source of this.scheduledSources) {
      try {
        source.stop();
      } catch {}
    }
    this.scheduledSources = [];
    this.playbackCursor = 0;
    if (this.playbackCtx && this.playbackCtxOwned) {
      void this.playbackCtx.close();
    }
    this.playbackCtx = null;
    this.playbackCtxOwned = false;
  }

  private sendSessionUpdate(systemInstructions: string): void {
    if (this.sessionUpdateSent || !this.dc || this.dc.readyState !== "open") return;
    this.sessionUpdateSent = true;

    this.sendJson({
      type: "session.update",
      session: {
        type: "realtime",
        instructions: systemInstructions,
        audio: {
          input: {
            format: { type: "audio/pcm", rate: 24000 },
            turn_detection: {
              type: "server_vad",
              threshold: 0.94,
              prefix_padding_ms: 120,
              silence_duration_ms: 820,
            },
            transcription: { model: "whisper-1" },
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
                sectionName: { type: "string" },
                answerSummary: { type: "string" },
                score: { type: "number" },
                feedback: { type: "string" },
              },
              required: ["question", "sectionName", "answerSummary", "score", "feedback"],
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
                weaknesses: { type: "array", items: { type: "string" } },
                improvements: { type: "array", items: { type: "string" } },
                finalScore: { type: "number" },
              },
              required: ["summary", "strengths", "weaknesses", "improvements", "finalScore"],
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
          {
            type: "function",
            name: "generate_section_questions",
            description:
              "Generate dynamic section questions when the current section runs out of planned questions before duration-complete.",
            parameters: {
              type: "object",
              properties: {
                sectionName: { type: "string" },
                topic: { type: "string" },
                difficulty: { type: "string" },
                count: { type: "number" },
                questionTypes: {
                  type: "array",
                  items: { type: "string" },
                  description: "Allowed values: NORMAL, MCQ, CODE_SNIPPET, GRAPHICAL",
                },
                candidateContext: { type: "string" },
                elapsedMinutes: { type: "number" },
                remainingMinutes: { type: "number" },
              },
              required: ["sectionName", "count", "questionTypes"],
            },
          },
          {
            type: "function",
            name: "generate_followup_questions",
            description:
              "Backward-compatible alias for generate_section_questions.",
            parameters: {
              type: "object",
              properties: {
                sectionName: { type: "string" },
                topic: { type: "string" },
                difficulty: { type: "string" },
                count: { type: "number" },
                questionTypes: {
                  type: "array",
                  items: { type: "string" },
                  description: "Allowed values: NORMAL, MCQ, CODE_SNIPPET, GRAPHICAL",
                },
                candidateContext: { type: "string" },
                elapsedMinutes: { type: "number" },
                remainingMinutes: { type: "number" },
              },
              required: ["sectionName", "count", "questionTypes"],
            },
          },
        ],
        tool_choice: "auto",
      },
    });
  }

  private sendOpeningPrompt(openingPrompt: string): void {
    if (this.openingPromptSent || !this.dc || this.dc.readyState !== "open") return;
    this.openingPromptSent = true;
    this.sendJson({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: openingPrompt }],
      },
    });
    this.sendJson({ type: "response.create" });
  }

  private async handleFunctionCall(message: OpenAIEventRecord): Promise<void> {
    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(readString(message.arguments) || "{}") as Record<string, unknown>;
    } catch {}

    let result: Record<string, unknown>;
    let needsContinuation = true;

    if (readString(message.name) === "save_interview_event") {
      const sectionName = readString(args.sectionName).trim();
      this.trackSectionProgress(sectionName);
      const event: InterviewEvaluationEvent = {
        at: new Date().toISOString(),
        question: readString(args.question),
        answerSummary: readString(args.answerSummary),
        score: Number(args.score ?? 0),
        feedback: readString(args.feedback),
      };
      this.callbacks.onEvaluationEvent(event);
      this.questionsAsked += 1;
      const elapsedMs = Math.max(0, Date.now() - this.sessionStartedAtMs);
      const progressRatio = Math.min(1, elapsedMs / this.durationMs);
      const expectedByNow = Math.max(
        1,
        Math.floor(this.minimumQuestionTarget * progressRatio),
      );
      const behindPace = this.questionsAsked < expectedByNow;
      const sectionGuidance = this.getSectionPacingGuidance(sectionName);
      result = {
        ok: true,
        stored: event,
        pacing: {
          questionsAsked: this.questionsAsked,
          minimumQuestionTarget: this.minimumQuestionTarget,
          expectedByNow,
          behindPace,
        },
        section: sectionName || this.currentSectionName,
        sectionPacing: sectionGuidance,
        instruction: behindPace
          ? `You are behind question pace. Keep acknowledgment concise, ask the next high-signal question now, and use generate_section_questions if needed.${sectionGuidance?.instruction ? ` ${sectionGuidance.instruction}` : ""}`
          : `Pacing is acceptable. Continue with section objectives and maintain interview flow.${sectionGuidance?.instruction ? ` ${sectionGuidance.instruction}` : ""}`,
      };
    } else if (readString(message.name) === "finalize_interview_report") {
      const elapsedMs = Date.now() - this.sessionStartedAtMs;
      const durationReached =
        this.durationCompleteSignaled || this.hardStopSignaled || elapsedMs >= this.durationMs;
      if (!durationReached) {
        const remainingSeconds = Math.max(1, Math.ceil((this.durationMs - elapsedMs) / 1000));
        console.info("[InterviewTiming] finalize blocked before duration-complete", {
          sessionId: this.sessionId,
          elapsedSeconds: Math.floor(elapsedMs / 1000),
          remainingSeconds,
          durationCompleteSignaled: this.durationCompleteSignaled,
          hardStopSignaled: this.hardStopSignaled,
        });
        result = {
          ok: false,
          blocked: true,
          reason: "DURATION_NOT_REACHED",
          remainingSeconds,
          instruction:
            "Do not finalize yet. Continue interviewing with deeper or generated follow-up questions until duration-complete is reached.",
        };
      } else {
        const questionTargetReached =
          this.questionsAsked >= this.minimumQuestionTarget || this.hardStopSignaled;
        const sectionTimeStatus = this.getSectionTimingStatus();
        if (!questionTargetReached) {
          const questionsRemaining = this.minimumQuestionTarget - this.questionsAsked;
          console.info("[InterviewTiming] finalize blocked: question target not met", {
            sessionId: this.sessionId,
            elapsedSeconds: Math.floor(elapsedMs / 1000),
            questionsAsked: this.questionsAsked,
            minimumQuestionTarget: this.minimumQuestionTarget,
            questionsRemaining,
            hardStopSignaled: this.hardStopSignaled,
          });
          result = {
            ok: false,
            blocked: true,
            reason: "QUESTION_TARGET_NOT_REACHED",
            questionsAsked: this.questionsAsked,
            minimumQuestionTarget: this.minimumQuestionTarget,
            questionsRemaining,
            instruction:
            "Do not finalize yet. Ask additional high-signal questions now. Use generate_section_questions with mixed formats (NORMAL, MCQ, CODE_SNIPPET, GRAPHICAL) and continue until question target is met.",
          };
        } else if (!this.hardStopSignaled && sectionTimeStatus.pendingSections.length > 0) {
          const pending = sectionTimeStatus.pendingSections[0];
          result = {
            ok: false,
            blocked: true,
            reason: "SECTION_TIME_NOT_MET",
            pendingSections: sectionTimeStatus.pendingSections,
            instruction:
            `Do not finalize yet. Continue section "${pending.name}" until its allotted time is covered. Use generate_section_questions for this section if planned questions are exhausted.`,
          };
        } else {
        console.info("[InterviewTiming] finalize allowed", {
          sessionId: this.sessionId,
          elapsedSeconds: Math.floor(elapsedMs / 1000),
          durationCompleteSignaled: this.durationCompleteSignaled,
          hardStopSignaled: this.hardStopSignaled,
          questionsAsked: this.questionsAsked,
          minimumQuestionTarget: this.minimumQuestionTarget,
        });
        const report: InterviewFinalReport = {
          summary: readString(args.summary),
          strengths: Array.isArray(args.strengths) ? args.strengths.map((item) => String(item)) : [],
          weaknesses: Array.isArray(args.weaknesses) ? args.weaknesses.map((item) => String(item)) : [],
          improvements: Array.isArray(args.improvements) ? args.improvements.map((item) => String(item)) : [],
          finalScore: Number(args.finalScore ?? 0),
        };
        this.callbacks.onFinalReport(report);
        if (!this.completed) {
          this.completed = true;
          this.callbacks.onComplete();
        }
        result = { ok: true, reportStored: true };
        needsContinuation = false;
        }
      }
    } else if (readString(message.name) === "show_reference_card") {
      const card: InterviewReferenceCard = {
        id: `card-${Date.now()}`,
        title: readString(args.title),
        content: readString(args.content),
      };
      this.callbacks.onReferenceCard(card);
      result = { ok: true };
    } else if (
      readString(message.name) === "generate_section_questions" ||
      readString(message.name) === "generate_followup_questions"
    ) {
      try {
        const generated = await this.generateFollowupQuestions(args);
        result = { ok: true, generatedQuestions: generated };
      } catch (error) {
        result = {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to generate follow-up questions.",
        };
      }
    } else {
      result = { ok: false, error: `Unknown function: ${readString(message.name)}` };
    }

    this.sendJson({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: readString(message.call_id),
        output: JSON.stringify(result),
      },
    });

    if (needsContinuation) {
      this.sendJson({ type: "response.create" });
    }
  }

  private async generateFollowupQuestions(args: Record<string, unknown>) {
    const response = await fetch("/api/interviews/webrtc/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: this.token,
        sessionId: this.sessionId,
        sectionName: readString(args.sectionName),
        topic: readString(args.topic),
        difficulty: readString(args.difficulty),
        count: Number(args.count ?? 3),
        questionTypes: Array.isArray(args.questionTypes)
          ? args.questionTypes.map((item) => String(item))
          : ["NORMAL"],
        candidateContext: readString(args.candidateContext),
        elapsedMinutes: Number(args.elapsedMinutes ?? 0),
        remainingMinutes: Number(args.remainingMinutes ?? 0),
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return {
        questions: [],
        error: `Failed to generate follow-up questions (${response.status})${body ? `: ${body}` : ""}`,
      };
    }

    const data = (await response.json()) as {
      questions?: Array<Record<string, unknown>>;
    };
    return {
      questions: Array.isArray(data.questions) ? data.questions : [],
    };
  }

  private trackSectionProgress(sectionName: string) {
    const now = Date.now();
    if (!sectionName) {
      return;
    }
    if (this.currentSectionName && this.currentSectionName !== sectionName) {
      const enteredAt = this.sectionLastEnteredAtMs.get(this.currentSectionName);
      if (enteredAt) {
        const prevElapsed = this.sectionAccumulatedMs.get(this.currentSectionName) || 0;
        this.sectionAccumulatedMs.set(
          this.currentSectionName,
          prevElapsed + Math.max(0, now - enteredAt),
        );
      }
    }
    if (this.currentSectionName !== sectionName) {
      this.currentSectionName = sectionName;
      this.sectionLastEnteredAtMs.set(sectionName, now);
    }
  }

  private getSectionTimingStatus() {
    const now = Date.now();
    const pendingSections: Array<{ name: string; targetMinutes: number; elapsedMinutes: number }> = [];
    for (const section of this.sectionPlan) {
      const accumulatedMs = this.sectionAccumulatedMs.get(section.name) || 0;
      const currentRunningMs =
        this.currentSectionName === section.name
          ? Math.max(0, now - (this.sectionLastEnteredAtMs.get(section.name) || now))
          : 0;
      const elapsedMinutes = (accumulatedMs + currentRunningMs) / 60000;
      const targetMinutes = section.minutes;
      if (elapsedMinutes + 0.2 < targetMinutes) {
        pendingSections.push({
          name: section.name,
          targetMinutes,
          elapsedMinutes: Number(elapsedMinutes.toFixed(2)),
        });
      }
    }
    return { pendingSections };
  }

  private getSectionPacingGuidance(sectionName: string) {
    if (!sectionName) {
      return null;
    }
    const section = this.sectionPlan.find((item) => item.name === sectionName);
    if (!section) {
      return null;
    }
    const now = Date.now();
    const accumulatedMs = this.sectionAccumulatedMs.get(sectionName) || 0;
    const currentRunningMs =
      this.currentSectionName === sectionName
        ? Math.max(0, now - (this.sectionLastEnteredAtMs.get(sectionName) || now))
        : 0;
    const elapsedMinutes = (accumulatedMs + currentRunningMs) / 60000;
    const remainingMinutes = Math.max(0, section.minutes - elapsedMinutes);
    return {
      sectionName,
      elapsedMinutes: Number(elapsedMinutes.toFixed(2)),
      remainingMinutes: Number(remainingMinutes.toFixed(2)),
      instruction:
        remainingMinutes > 0.4
          ? `Stay in section "${sectionName}" until roughly ${section.minutes} minutes are covered.`
          : `Section "${sectionName}" time target is nearly met. You may transition when objective is complete.`,
    };
  }

  private enforceRealtimePacingGuards(interviewerText: string) {
    if (!interviewerText || this.completed) {
      return;
    }
    const now = Date.now();
    if (now - this.lastGuardInterventionAtMs < 3000) {
      return;
    }

    if (isSectionTransitionCue(interviewerText) && this.currentSectionName) {
      const guidance = this.getSectionPacingGuidance(this.currentSectionName);
      if (guidance && guidance.remainingMinutes > 0.4 && !this.hardStopSignaled) {
        this.lastGuardInterventionAtMs = now;
        this.sendOrchestrationMessage(
          `PACING_GUARD: Do not transition sections yet. Stay in section "${this.currentSectionName}" and continue asking high-signal questions until its allotted time is met. Use generate_section_questions for this section if needed.`,
        );
        return;
      }
    }

    if (isClosingCue(interviewerText)) {
      const elapsedMs = Date.now() - this.sessionStartedAtMs;
      const remainingMs = Math.max(0, this.durationMs - elapsedMs);
      const closingWindowReached =
        remainingMs <= FINAL_CLOSING_WINDOW_MS ||
        this.durationCompleteSignaled ||
        this.hardStopSignaled;
      if (!closingWindowReached) {
        this.lastGuardInterventionAtMs = now;
        this.sendOrchestrationMessage(
          "CLOSING_WINDOW_GUARD: You asked the final candidate-question prompt too early. Do not ask 'Do you have any questions for me/about role/company' until the final 60 seconds or after TIME_SIGNAL:DURATION_COMPLETE. Continue technical questioning now.",
        );
        return;
      }
      const blockers = this.getCompletionBlockers();
      if (blockers.length > 0 && !this.hardStopSignaled) {
        this.lastGuardInterventionAtMs = now;
        this.sendOrchestrationMessage(
          `CLOSING_GUARD: Do not start closing sequence yet. ${blockers.join(" ")} Continue technical questioning and only close after blockers are cleared.`,
        );
      }
    }
  }

  private getCompletionBlockers(): string[] {
    const blockers: string[] = [];
    const elapsedMs = Date.now() - this.sessionStartedAtMs;
    const durationReached =
      this.durationCompleteSignaled || this.hardStopSignaled || elapsedMs >= this.durationMs;
    if (!durationReached) {
      blockers.push("Scheduled duration is not complete.");
    }
    if (this.questionsAsked < this.minimumQuestionTarget && !this.hardStopSignaled) {
      blockers.push(
        `Question target not met (${this.questionsAsked}/${this.minimumQuestionTarget}).`,
      );
    }
    const pending = this.getSectionTimingStatus().pendingSections;
    if (pending.length > 0 && !this.hardStopSignaled) {
      blockers.push(
        `Section time still pending for ${pending.map((s) => s.name).join(", ")}.`,
      );
    }
    const remainingMs = Math.max(0, this.durationMs - elapsedMs);
    const closingWindowReached =
      remainingMs <= FINAL_CLOSING_WINDOW_MS ||
      this.durationCompleteSignaled ||
      this.hardStopSignaled;
    if (!closingWindowReached) {
      blockers.push("Final candidate-question prompt window not reached yet.");
    }
    return blockers;
  }

  private sendJson(payload: Record<string, unknown>): void {
    if (!this.dc || this.dc.readyState !== "open") return;
    this.dc.send(JSON.stringify(payload));
  }
}
