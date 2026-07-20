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
  private transcriptItemCount = 0;
  private lastGuardInterventionAtMs = 0;
  private playbackCtx: AudioContext | null = null;
  private playbackCtxOwned = false;
  private playbackCursor = 0;
  private scheduledSources: AudioBufferSourceNode[] = [];

  // Bug 3 fix: response-in-flight tracking to prevent concurrent response.create
  private responseInFlight = false;
  private pendingResponseCreate = false;

  // Interruption debounce: brief noise filter — AEC handles echo so this can be small
  private assistantSpeakingStartedAtMs = 0;
  private static readonly MIN_SPEAKING_BEFORE_INTERRUPT_MS = 500;

  // Stall watchdog - detects truly stuck AI (not candidate thinking pauses)
  private lastEventAtMs = 0;
  private stallWatchdogTimer: ReturnType<typeof setInterval> | null = null;
  private stallRecoveryAttempts = 0;
  private static readonly STALL_THRESHOLD_MS = 45_000; // 45s — candidates can think for 30+ seconds
  private static readonly MAX_STALL_RECOVERIES = 3;

  // Bug 4 fix: absolute kill timer after hard stop
  private killTimer: ReturnType<typeof setTimeout> | null = null;
  private static readonly KILL_AFTER_HARD_STOP_MS = 90_000; // 90 seconds after hard stop

  constructor(callbacks: WebRtcCallbacks) {
    this.callbacks = callbacks;
  }

  isReady(): boolean {
    return this.dc !== null && this.dc.readyState === "open" && this.openingPromptSent;
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
    this.transcriptItemCount = 0;
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
      this.startStallWatchdog();
      this.callbacks.onReady();
    };

    this.dc.onclose = () => {
      if (!this.manuallyClosed && !this.completed) {
        console.warn("[WebRTC] Data channel closed unexpectedly");
        this.callbacks.onError("Connection to AI interviewer lost. The session will be finalized.");
        this.forceComplete();
      }
    };

    this.dc.onerror = (event) => {
      console.error("[WebRTC] Data channel error:", event);
      if (!this.manuallyClosed && !this.completed) {
        this.callbacks.onError("Connection error with AI interviewer.");
      }
    };

    this.dc.onmessage = (event) => {
      const message = safeParseMessage(String(event.data));
      if (!message) return;

      // Bug 3 fix: track last event time for stall detection
      this.lastEventAtMs = Date.now();
      this.stallRecoveryAttempts = 0;

      if (message.type === "session.created" || message.type === "session.updated") {
        this.callbacks.onStatus("OpenAI Realtime session ready.");
      }

      if (message.type === "error" || message.error) {
        const errMsg =
          readString(message.error?.message) ||
          readString(message.message) ||
          JSON.stringify(message);
        // Don't treat "Cancellation failed" as fatal — it just means no active response
        if (!errMsg.toLowerCase().includes("cancellation")) {
          this.callbacks.onError(errMsg);
        } else {
          console.info("[WebRTC] Non-fatal cancellation error:", errMsg);
        }
      }

      if (message.type === "response.output_audio_transcript.done" && message.transcript) {
        const interviewerText = String(message.transcript).trim();
        this.transcriptItemCount += 1;
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
          this.transcriptItemCount += 1;
          this.callbacks.onTranscript({ role: "candidate", text });
          // NOTE: Do NOT send response.create here. With server_vad, OpenAI automatically
          // generates a response after detecting end of speech. Sending a manual response.create
          // causes duplicate responses (AI repeats questions, says "let me think", etc.)
        }
      }

      if (message.type === "response.function_call_arguments.done") {
        void this.handleFunctionCall(message);
      }

      if (message.type === "input_audio_buffer.speech_started") {
        if (this.assistantSpeaking) {
          const speakingDuration = Date.now() - this.assistantSpeakingStartedAtMs;
          if (speakingDuration >= OpenAIWebRtcInterviewTransport.MIN_SPEAKING_BEFORE_INTERRUPT_MS) {
            // AI has been speaking long enough that this is a genuine interruption
            this.cancelResponse();
          }
          // else: within debounce window — brief noise, ignore
        }
        this.callbacks.onInterrupted();
      }

      if (message.type === "response.created") {
        this.responseInFlight = true;
        this.assistantSpeaking = true;
        this.assistantSpeakingStartedAtMs = Date.now();
        this.callbacks.onAssistantSpeakingChange?.(true);
      }

      if (message.type === "response.output_audio.delta" && message.delta) {
        this.playAudioDelta(readString(message.delta));
        this.assistantSpeaking = true;
        this.callbacks.onAssistantSpeakingChange?.(true);
      }

      if (message.type === "response.done") {
        this.responseInFlight = false;
        // Only mark not-speaking if all audio buffers have also finished.
        // response.done fires when generation ends, but audio is still playing.
        // Premature assistantSpeaking=false → debounce doesn't protect tail audio
        // → mic picks up AI voice echo → VAD triggers → "I noticed a brief pause" loop.
        if (this.scheduledSources.length === 0) {
          this.assistantSpeaking = false;
          this.callbacks.onAssistantSpeakingChange?.(false);
        }
        // else: source.onended will clear assistantSpeaking when last buffer finishes
        if (this.pendingResponseCreate) {
          this.pendingResponseCreate = false;
          this.safeResponseCreate();
        }
      }

      // Handle response.cancelled (response was interrupted)
      if (message.type === "response.cancelled") {
        this.responseInFlight = false;
        this.assistantSpeaking = false;
        // Clear stale pending request: a pacing guard may have set this while a response
        // was in flight; after cancellation response.done never fires, so without this
        // clear the pending request would leak into the next response's done handler
        // and fire a spurious extra AI turn.
        this.pendingResponseCreate = false;
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

    // Immediately bypass all finalization blockers — candidate wants to end
    this.hardStopSignaled = true;
    this.durationCompleteSignaled = true;

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
    this.safeResponseCreate();

    setTimeout(() => {
      this.forceComplete();
    }, 12000);
  }

  sendOrchestrationMessage(text: string): void {
    if (!text.trim() || !this.dc || this.dc.readyState !== "open" || this.completed) return;
    if (text.includes("TIME_SIGNAL:DURATION_COMPLETE")) {
      this.durationCompleteSignaled = true;
    }
    if (text.includes("TIME_SIGNAL:HARD_STOP_REACHED")) {
      this.hardStopSignaled = true;
      // Bug 4 fix: arm absolute kill timer after hard stop
      this.armKillTimer();
    }

    this.sendJson({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }],
      },
    });
    this.safeResponseCreate();
  }

  cancelResponse(): void {
    if (!this.dc || this.dc.readyState !== "open") return;
    this.sendJson({ type: "response.cancel" });
    // Mark response as no longer in flight — the model may send response.cancelled or response.done
    this.responseInFlight = false;
    this.assistantSpeaking = false;
    this.stopPlayback();
  }

  close(): void {
    this.manuallyClosed = true;
    this.completed = true;
    this.stopStallWatchdog();
    this.clearKillTimer();
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

  // Injects a context message silently — no response.create triggered.
  // Used by pacing guards so the model sees guidance on next natural turn
  // without generating a spurious extra AI response.
  private sendSilentContextMessage(text: string): void {
    if (!text.trim() || !this.dc || this.dc.readyState !== "open" || this.completed) return;
    this.sendJson({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }],
      },
    });
  }

  // Bug 3 fix: safe response.create that respects in-flight status
  private safeResponseCreate(): void {
    if (this.completed || !this.dc || this.dc.readyState !== "open") return;
    if (this.responseInFlight) {
      // Queue the request — it will be sent when current response completes
      this.pendingResponseCreate = true;
      return;
    }
    this.sendJson({ type: "response.create" });
  }

  // Bug 3 fix: stall watchdog — detects when AI stops responding
  private startStallWatchdog(): void {
    this.lastEventAtMs = Date.now();
    this.stallRecoveryAttempts = 0;
    this.stallWatchdogTimer = setInterval(() => {
      if (this.completed || this.manuallyClosed) {
        this.stopStallWatchdog();
        return;
      }
      const silenceMs = Date.now() - this.lastEventAtMs;
      if (silenceMs >= OpenAIWebRtcInterviewTransport.STALL_THRESHOLD_MS) {
        this.handleStallDetected();
      }
    }, 5_000); // check every 5 seconds
  }

  private stopStallWatchdog(): void {
    if (this.stallWatchdogTimer) {
      clearInterval(this.stallWatchdogTimer);
      this.stallWatchdogTimer = null;
    }
  }

  private handleStallDetected(): void {
    if (this.completed || this.manuallyClosed) return;

    this.stallRecoveryAttempts += 1;
    console.warn(`[WebRTC] Stall detected (attempt ${this.stallRecoveryAttempts}/${OpenAIWebRtcInterviewTransport.MAX_STALL_RECOVERIES})`);

    if (this.stallRecoveryAttempts > OpenAIWebRtcInterviewTransport.MAX_STALL_RECOVERIES) {
      // Exceeded max recovery attempts — force complete
      console.error("[WebRTC] Max stall recoveries exceeded, force-completing session");
      this.callbacks.onError("AI interviewer became unresponsive. Ending session.");
      this.forceComplete();
      return;
    }

    // Recovery: reset response tracking and send a nudge
    this.responseInFlight = false;
    this.pendingResponseCreate = false;
    this.assistantSpeaking = false;
    this.callbacks.onAssistantSpeakingChange?.(false);

    if (this.dc && this.dc.readyState === "open") {
      // Send a recovery prompt to the model
      this.sendJson({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{
            type: "input_text",
            text: "SYSTEM_RECOVERY: The connection experienced a brief interruption. Please continue the interview from where you left off. If you were in the middle of asking a question, repeat it. If waiting for a response, acknowledge the pause and move on to the next question.",
          }],
        },
      });
      this.sendJson({ type: "response.create" });
      // Reset the timer so we don't immediately re-trigger
      this.lastEventAtMs = Date.now();
    } else {
      // Data channel is not open — force complete
      this.callbacks.onError("Connection to AI interviewer lost.");
      this.forceComplete();
    }
  }

  // Bug 4 fix: arm absolute kill timer that force-completes after hard stop
  private armKillTimer(): void {
    if (this.killTimer) return; // already armed
    this.killTimer = setTimeout(() => {
      if (!this.completed && !this.manuallyClosed) {
        console.warn("[WebRTC] Kill timer fired — force-completing session after hard stop");
        this.forceComplete();
      }
    }, OpenAIWebRtcInterviewTransport.KILL_AFTER_HARD_STOP_MS);
  }

  private clearKillTimer(): void {
    if (this.killTimer) {
      clearTimeout(this.killTimer);
      this.killTimer = null;
    }
  }

  // Force complete the interview — used by kill timer and stall recovery
  private forceComplete(): void {
    if (this.completed) return;
    this.completed = true;
    this.stopStallWatchdog();
    this.clearKillTimer();
    this.stopPlayback();
    this.callbacks.onComplete();
    try {
      this.dc?.close();
    } catch {}
    try {
      if (this.pc && this.pc.connectionState !== "closed") {
        this.pc.close();
      }
    } catch {}
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
    // DO NOT connect to ctx.destination — audio comes from the WebRTC remote audio track.
    // Connecting here causes double audio, which phases out AEC and lets mic pick up AI voice,
    // causing VAD false triggers ("I noticed a brief pause" loop).
    // We schedule the source purely to fire source.onended for assistantSpeaking tracking.
    this.scheduledSources.push(source);
    source.onended = () => {
      this.scheduledSources = this.scheduledSources.filter((item) => item !== source);
      // Last buffer finished AND no response generating → AI is truly done speaking
      if (this.scheduledSources.length === 0 && !this.responseInFlight) {
        this.assistantSpeaking = false;
        this.callbacks.onAssistantSpeakingChange?.(false);
      }
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

    // Prepend hard behavioral rules that job-specific instructions don't cover.
    // These run at the START so the model sees them before the role-specific prompt.
    const SESSION_BEHAVIORAL_RULES = `=== MANDATORY SESSION RULES (highest priority — override everything below) ===

RULE 1 — TURN-COMPLETION PHRASES ARE NOT COMMANDS:
Phrases like "I'm done", "done", "finished", "that's all", "next question", "continue", "move on", "I'm finished" are ONLY signals that the candidate finished speaking their answer. When you hear them:
- DO NOT acknowledge them verbally ("Got it, you're done" etc.)
- DO NOT pause or wait
- DO NOT treat them as requests to end the interview
- Just continue DIRECTLY to your next interview question

RULE 2 — EXIT REQUESTS → REDIRECT TO BUTTON:
If the candidate says "I want to stop", "end the interview", "I want to quit", "stop the interview", "exit" — respond with exactly this: "If you'd like to end the session early, please click the 'End Interview' button shown on your screen. Otherwise, let's continue." Then continue with the next question.

RULE 3 — NO "LET ME THINK" FILLER:
After a candidate answers, do NOT say phrases like "let me think about how to build on that", "let me formulate my next question", "give me a moment". Acknowledge the answer in one sentence and ask the next question in the SAME breath. No dead air.

RULE 4 — IGNORE META-COMMENTARY:
If the candidate says "why are you pausing", "reply please", "are you stuck", "give me a response" — say "Apologies, let's continue." and immediately ask the next question.

RULE 5 — SHORT UTTERANCES ARE NOISE:
"bye", "thank you", "ok", "yes", "hello", "hey" appearing between full answers = noise. Do not evaluate or score them. Continue to the next question.

RULE 6 — NEVER ANNOUNCE PAUSES:
Never say "I'll pause here", "let's pause", "we'll pick up later", "since you're done we'll pause". The interview runs continuously until finalize_interview_report is called.

=== END MANDATORY RULES ===

${systemInstructions}`;

    this.sendJson({
      type: "session.update",
      session: {
        type: "realtime",
        instructions: SESSION_BEHAVIORAL_RULES,
        audio: {
          input: {
            format: { type: "audio/pcm", rate: 24000 },
            turn_detection: {
              type: "server_vad",
              // threshold 0.7: API default (0.5) captured too much ambient noise
              // as speech ("And you might be like, oh yeah" artifacts). 0.7 filters
              // casual background sound while still catching clear speech.
              threshold: 0.7,
              // 700ms silence: API default (500ms) fragmented natural speaking pauses
              // into multiple commits → AI jumped in mid-answer.
              silence_duration_ms: 700,
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
            description: "Store per-question interview result for backend persistence. IMPORTANT: Always ask your NEXT question to the candidate BEFORE calling this function. Call this function AFTER you have already verbally asked the follow-up question, not before. This keeps the conversation flowing without an audible pause.",
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
            description: "MUST USE for every MCQ, code snippet, or visual question. Display structured content on the candidate's screen. REQUIRED SEQUENCE: (1) Call this tool to show the content. (2) IMMEDIATELY after, verbally tell the candidate what to do — e.g. 'Take a look at the code snippet on your screen. What will this program print, and why?' or 'Review the options on screen and pick the correct one.' (3) Then WAIT for the candidate to answer — do NOT answer the question yourself. Never call this tool and stay silent.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Card title (e.g., 'MCQ: Java Collections', 'Code Snippet: Debugging')" },
                question: { type: "string", description: "The exact question text to display. REQUIRED for MCQ and code snippet cards." },
                options: {
                  type: "array",
                  items: { type: "string" },
                  description: "Answer options for MCQ-style cards. Each item is one option (e.g., 'ArrayList is synchronized').",
                },
                content: { type: "string", description: "Markdown content: code blocks, tables, or formatted text. Use ```java for code snippets." },
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
    this.safeResponseCreate();
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
      const durationDone = this.durationCompleteSignaled || this.hardStopSignaled || elapsedMs >= this.durationMs;

      // After duration is complete, instruct the AI to wrap up
      let instruction: string;
      if (durationDone) {
        instruction = "DURATION IS COMPLETE. Ask at most 1-2 more questions, then ask the candidate if they have any questions about the role/company, and call finalize_interview_report. Do NOT continue with new topics.";
      } else if (behindPace) {
        instruction = `You are behind question pace. Keep acknowledgment concise, ask the next high-signal question now. IMPORTANT: For at least every 3rd question, use show_reference_card to display a code snippet, MCQ, or visual prompt on the candidate's screen before asking.${sectionGuidance?.instruction ? ` ${sectionGuidance.instruction}` : ""}`;
      } else {
        instruction = `Pacing is acceptable. Continue with section objectives. REMINDER: Use show_reference_card for code snippets, MCQs, and visual questions — aim for at least 1 reference card per section.${sectionGuidance?.instruction ? ` ${sectionGuidance.instruction}` : ""}`;
      }

      result = {
        ok: true,
        stored: event,
        pacing: {
          questionsAsked: this.questionsAsked,
          minimumQuestionTarget: this.minimumQuestionTarget,
          expectedByNow,
          behindPace,
          durationComplete: durationDone,
        },
        section: sectionName || this.currentSectionName,
        sectionPacing: sectionGuidance,
        instruction,
      };
      // Do NOT trigger a new response after save_interview_event.
      // The model already verbally asked the next question before calling this function
      // (per tool description instruction). safeResponseCreate would force a new AI turn
      // before the candidate answers, causing the AI to answer its own question.
      // server_vad auto-triggers the next response when the candidate speaks.
      needsContinuation = false;
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
        // Once duration is reached, ALWAYS allow finalization.
        // Question targets and section times are soft guidance, not hard blockers after duration.
        console.info("[InterviewTiming] finalize allowed (duration reached)", {
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
    } else if (readString(message.name) === "show_reference_card") {
      const question = readString(args.question).trim();
      const options = Array.isArray(args.options)
        ? args.options.map((item) => String(item).trim()).filter((item) => item.length > 0)
        : [];
      const content = readString(args.content).trim();
      const card: InterviewReferenceCard = {
        id: `card-${Date.now()}`,
        title: readString(args.title),
        question: question || undefined,
        options: options.length > 0 ? options : undefined,
        content: content || this.buildReferenceCardContent(question, options, content),
        afterTranscriptIndex: this.transcriptItemCount,
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
      this.safeResponseCreate();
    }
  }

  private async generateFollowupQuestions(args: Record<string, unknown>) {
    // Bug 3 fix: add timeout to prevent indefinite hang
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000); // 10 second timeout

    try {
      const response = await fetch("/api/interviews/webrtc/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
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
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return { questions: [], error: "Question generation timed out. Continue with your own questions." };
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private buildReferenceCardContent(question: string, options: string[], content: string) {
    if (content) {
      return content;
    }

    const lines: string[] = [];
    if (question) {
      lines.push(`**Question:** ${question}`);
    }
    if (options.length > 0) {
      lines.push("", "**Options:**", ...options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`));
    }
    return lines.join("\n");
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

    // NOTE: Section transition guard removed.
    // The save_interview_event return value already carries sectionPacing.instruction
    // which tells the model to stay in the current section. Having a SECOND guard that
    // fires AFTER the AI has already verbally said "Let's move to Section 2" caused
    // jarring mid-interview reverts — the AI would go back and re-ask Section 1 questions
    // after the candidate had already answered a Section 2 question.

    if (isClosingCue(interviewerText)) {
      const elapsedMs = Date.now() - this.sessionStartedAtMs;
      const remainingMs = Math.max(0, this.durationMs - elapsedMs);
      const closingWindowReached =
        remainingMs <= FINAL_CLOSING_WINDOW_MS ||
        this.durationCompleteSignaled ||
        this.hardStopSignaled;
      if (!closingWindowReached) {
        this.lastGuardInterventionAtMs = now;
        // Silent injection — same reason as above.
        this.sendSilentContextMessage(
          "CLOSING_WINDOW_GUARD: You asked the final candidate-question prompt too early. Do NOT ask 'Do you have any questions for me/about role/company' until TIME_SIGNAL:DURATION_COMPLETE. Continue with the next technical question. Do not repeat the closing question.",
        );
        return;
      }
      // If closing window IS reached, do NOT block — let the AI proceed to finalize
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
