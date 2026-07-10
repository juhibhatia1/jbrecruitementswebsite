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
  voice: string;
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
  private playbackCtx: AudioContext | null = null;
  private playbackCtxOwned = false;
  private playbackCursor = 0;
  private scheduledSources: AudioBufferSourceNode[] = [];

  constructor(callbacks: WebRtcCallbacks) {
    this.callbacks = callbacks;
  }

  async connect(payload: ConnectPayload, localStream: MediaStream): Promise<void> {
    this.voice = payload.voice;
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
        this.callbacks.onTranscript({
          role: "interviewer",
          text: String(message.transcript).trim(),
        });
      }

      if (
        (message.type === "conversation.item.input_audio_transcription.completed" ||
          message.type === "conversation.item.audio_transcription.completed") &&
        (message.transcript || message.text)
      ) {
        const text = String(message.transcript || message.text || "").trim();
        if (text) {
          this.callbacks.onTranscript({ role: "candidate", text });
        }
      }

      if (message.type === "response.function_call_arguments.done") {
        this.handleFunctionCall(message);
      }

      if (message.type === "input_audio_buffer.speech_started") {
        this.cancelResponse();
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
              threshold: 0.9,
              prefix_padding_ms: 120,
              silence_duration_ms: 950,
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

  private handleFunctionCall(message: OpenAIEventRecord): void {
    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(readString(message.arguments) || "{}") as Record<string, unknown>;
    } catch {}

    let result: Record<string, unknown>;
    let needsContinuation = true;

    if (readString(message.name) === "save_interview_event") {
      const event: InterviewEvaluationEvent = {
        at: new Date().toISOString(),
        question: readString(args.question),
        answerSummary: readString(args.answerSummary),
        score: Number(args.score ?? 0),
        feedback: readString(args.feedback),
      };
      this.callbacks.onEvaluationEvent(event);
      result = { ok: true, stored: event };
    } else if (readString(message.name) === "finalize_interview_report") {
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
    } else if (readString(message.name) === "show_reference_card") {
      const card: InterviewReferenceCard = {
        id: `card-${Date.now()}`,
        title: readString(args.title),
        content: readString(args.content),
      };
      this.callbacks.onReferenceCard(card);
      result = { ok: true };
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

  private sendJson(payload: Record<string, unknown>): void {
    if (!this.dc || this.dc.readyState !== "open") return;
    this.dc.send(JSON.stringify(payload));
  }
}
