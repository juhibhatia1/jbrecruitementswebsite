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
  onThinkingChange?: (thinking: boolean) => void;
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
  if (durationMinutes >= 30) return 20;
  if (durationMinutes >= 20) return 15;
  if (durationMinutes >= 15) return 12;
  if (durationMinutes >= 10) return 8;
  return 5;
}

// Closing question is ONLY allowed after an explicit TIME_SIGNAL:DURATION_COMPLETE
// or TIME_SIGNAL:HARD_STOP_REACHED. No time-window fallback — hard gate only.
const FINAL_CLOSING_WINDOW_MS = 0;

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

  // Audio tail protection: WebRTC audio keeps playing after response.done fires.
  // During this window, VAD speech_started events are echo — clear the buffer.
  private audioTailProtectionUntilMs = 0;
  private static readonly AUDIO_TAIL_FALLBACK_MS = 3000;

  // Stall watchdog - detects truly stuck AI (not candidate thinking pauses)
  private lastEventAtMs = 0;
  private stallWatchdogTimer: ReturnType<typeof setInterval> | null = null;
  private stallRecoveryAttempts = 0;
  private static readonly STALL_THRESHOLD_MS = 45_000; // 45s — candidates can think for 30+ seconds
  private static readonly MAX_STALL_RECOVERIES = 3;

  // Section boundary timers — fire TIME_SIGNAL:SECTION_COMPLETE at each planned boundary
  private sectionTransitionTimers: ReturnType<typeof setTimeout>[] = [];

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
      this.scheduleSectionTransitions();
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
        // Estimate how long the audio will keep playing: ~12 chars/sec speaking rate.
        // WebRTC audio keeps playing after response.done fires. Speech events during
        // this tail are echo, not candidate speech — set protection window.
        const estimatedAudioMs = Math.max(2000, Math.min(10000, interviewerText.length / 12 * 1000));
        this.audioTailProtectionUntilMs = Date.now() + estimatedAudioMs;
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
        const inTailWindow = Date.now() < this.audioTailProtectionUntilMs;
        if (this.assistantSpeaking || inTailWindow) {
          const speakingDuration = Date.now() - this.assistantSpeakingStartedAtMs;
          const isGenuineInterruption =
            this.assistantSpeaking &&
            this.responseInFlight &&
            speakingDuration >= OpenAIWebRtcInterviewTransport.MIN_SPEAKING_BEFORE_INTERRUPT_MS;
          if (isGenuineInterruption) {
            this.cancelResponse();
          } else {
            // Echo from still-playing AI audio — discard captured buffer so model
            // does not receive its own voice as "candidate speech"
            this.sendJson({ type: "input_audio_buffer.clear" });
          }
        }
        this.callbacks.onInterrupted();
      }

      if (message.type === "response.created") {
        this.responseInFlight = true;
        this.assistantSpeaking = true;
        this.assistantSpeakingStartedAtMs = Date.now();
        this.callbacks.onThinkingChange?.(false); // model now generating/speaking — not processing a tool
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
        this.pendingResponseCreate = false;
        this.callbacks.onThinkingChange?.(false);
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
    this.responseInFlight = false;
    this.assistantSpeaking = false;
    this.audioTailProtectionUntilMs = 0; // candidate is interrupting — disable echo protection
    this.stopPlayback();
  }

  close(): void {
    this.manuallyClosed = true;
    this.completed = true;
    this.stopStallWatchdog();
    this.clearKillTimer();
    this.clearSectionTransitionTimers();
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

  // Schedule hard transition signals at each planned section boundary.
  // These fire as TIME_SIGNAL:SECTION_COMPLETE events via sendOrchestrationMessage,
  // which forces the model to move to the next section regardless of how many
  // questions it has asked. This is the ONLY reliable way to enforce section timing —
  // soft guidance in save_interview_event results is ignored by the model when rushing.
  private scheduleSectionTransitions(): void {
    this.clearSectionTransitionTimers();
    if (this.sectionPlan.length <= 1) return;

    let cumulativeMs = 0;
    for (let i = 0; i < this.sectionPlan.length - 1; i++) {
      cumulativeMs += this.sectionPlan[i].minutes * 60_000;
      const section = this.sectionPlan[i];
      const nextSection = this.sectionPlan[i + 1];
      const fireAt = this.sessionStartedAtMs + cumulativeMs;
      const delayMs = fireAt - Date.now();

      if (delayMs <= 0) {
        // This boundary already passed (e.g., session reconnect) — skip it.
        continue;
      }

      const timer = setTimeout(() => {
        if (this.completed || this.manuallyClosed) return;
        this.sendOrchestrationMessage(
          `TIME_SIGNAL:SECTION_COMPLETE:${section.name}. The planned ${section.minutes}-minute window for section "${section.name}" is now complete. IMMEDIATELY transition to section "${nextSection.name}" on your next response. Ask your first question in "${nextSection.name}" now. Do not ask any more questions about "${section.name}".`,
        );
      }, delayMs);

      this.sectionTransitionTimers.push(timer);
    }
  }

  private clearSectionTransitionTimers(): void {
    for (const t of this.sectionTransitionTimers) clearTimeout(t);
    this.sectionTransitionTimers = [];
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
    this.clearSectionTransitionTimers();
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

    // Structured per gpt-realtime-2 prompting guide: labeled sections, precise trigger/action/exception
    // format, no conflicting "always/never/must" overuse, wait_for_user for silence/noise.
    const SESSION_BEHAVIORAL_RULES = `# Role and Objective

AI interviewer conducting a structured mock interview for a technical role. Ask planned questions from each section in order. Evaluate answers briefly and objectively. Guide the candidate through the full scheduled interview duration. Generate a final evaluation report at the end.

# Personality and Tone

Professional and warm — like a senior hiring manager conducting a real interview.
- Acknowledgments: 1 sentence maximum before asking the next question.
- Vary acknowledgments each turn: "Good point", "Got it", "Makes sense", "Nice", "Thanks". Do not repeat the same phrase back-to-back.
- Never sound scripted or robotic. Never over-praise every answer.

# Language

English only. Do not switch languages based on accent, pronunciation, or isolated foreign words.

# Reasoning

Reason internally before: evaluating multi-part answers, choosing between sections, tool selection when ambiguous.
Respond quickly without extended reasoning: greetings, simple acknowledgments, repeating a question.
Do not reason when audio is unclear — ask for clarification instead.

# Preambles

Use a short preamble only before tool calls that take noticeable time (generate_section_questions, finalize_interview_report).
- "I'll note that." / "Let me get the next question." / "I'll generate a follow-up."

Skip preambles when:
- Giving a simple acknowledgment or asking the next question directly
- Audio is unclear
- Calling wait_for_user or save_interview_event

One sentence maximum. Never say: "Let me think...", "Hmm...", "One moment while I process that...", "Let me formulate my next question."

# Verbosity

- Acknowledgment: 1 sentence
- Questions: 1–3 sentences — do not over-explain
- Clarifications: one question at a time
- Never narrate your reasoning aloud

# Interview Flow

## Turn completion
When candidate says "I'm done", "done", "finished", "that's all", "next question", "continue", "move on": they finished their answer. Ask your next planned question immediately. Do NOT acknowledge these phrases verbally.

## Early exit requests
When candidate says "I want to stop", "end the interview", "I want to quit", "stop", "exit": respond exactly — "If you'd like to end early, click the 'End Interview' button on your screen. Otherwise let's continue." Then ask the next question.

## Filler-only responses
When candidate's full response is only 1–3 words of pure filler (uh / um / so / yeah / hmm): this is not a complete answer. Say "Go ahead" or "Please continue." Do NOT say "Good point" or infer a position they never stated.

## Meta-commentary
When candidate says "why are you pausing", "reply please", "are you stuck": say "Apologies, let's continue." and ask the next question immediately.

## No closing before signal
Never ask "Do you have any questions for me?" or "Do you have any questions about the role?" until you receive TIME_SIGNAL:DURATION_COMPLETE. If you feel the urge to close early, ask another section question instead.

## Section transition signals
When you receive TIME_SIGNAL:SECTION_COMPLETE:[name]: on your very next response transition to the named section and ask your first question there. Do not finish another question in the old section.

## Section timing (from save_interview_event results)
Each save_interview_event result includes sectionPacing.instruction. If it says "ask at least N more questions in section X", do so before transitioning.

## Never announce pauses
Never say "I'll pause here", "let's pause", "we'll pick up later". The interview runs continuously until finalize_interview_report is called.

# Unclear Audio

When candidate audio is unclear, cut off, or unintelligible: ask "Sorry, could you repeat that?" Do not guess. Do not call tools. Do not generate preambles. Do not repeat the same clarification request more than once for the same utterance.

# Long Context Behavior

As the interview grows, prioritize:
1. Latest candidate answer for evaluation
2. Most recent TIME_SIGNAL for current section and timing state
3. sessionTiming field in tool results for current clock state

If you lose track of section or question count, use the most recent TIME_SIGNAL:SECTION_COMPLETE or save_interview_event sectionName as ground truth.

---

${systemInstructions}`;

    this.sendJson({
      type: "session.update",
      session: {
        type: "realtime",
        instructions: SESSION_BEHAVIORAL_RULES,
        // medium: interview requires multi-step reasoning (timing decisions, answer evaluation,
        // tool sequencing) but must stay responsive. low would miss complex answer nuances.
        reasoning: { effort: "medium" },
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
            name: "wait_for_user",
            description: "Call this when the latest audio does not need a spoken response: silence, background noise, side conversation, or speech clearly not addressed to you (e.g. 'see you later', 'just a second', 'bye'). This ends the turn without a spoken reply. Do NOT say 'I'm here', 'I didn't catch that', or 'Take your time' after calling this. Resume normal responses only when the candidate clearly addresses you.",
            parameters: { type: "object", properties: {}, required: [] },
          },
          {
            type: "function",
            name: "save_interview_event",
            description: "PROACTIVE — Store per-question evaluation. Ask your NEXT question to the candidate FIRST (verbally), then call this tool immediately after. Do not announce the call. Do not ask for confirmation. Return value includes sectionPacing.instruction: follow it.",
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
            description: "SIGNAL-GATED — Store final report and end the interview. Only call AFTER receiving TIME_SIGNAL:DURATION_COMPLETE or TIME_SIGNAL:HARD_STOP_REACHED. If called early the system will block it and instruct you to continue. Preamble: 'That wraps up our questions. Let me put together your report.'",
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
            description: "PROACTIVE — Display code snippet, MCQ, or table on the candidate's screen BEFORE asking the question verbally. Sequence: (1) call this tool, (2) immediately say what the candidate should do — 'Take a look at the code on your screen. What will this print, and why?' — (3) wait for their answer. Never answer the question yourself. Never call this and stay silent.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Card title (e.g., 'Code Snippet: Polymorphism')" },
                question: { type: "string", description: "The question text to display. Required for MCQ and code cards." },
                options: { type: "array", items: { type: "string" }, description: "MCQ answer options." },
                content: { type: "string", description: "Markdown content. Use ```java for code blocks." },
              },
              required: ["title", "content"],
            },
          },
          {
            type: "function",
            name: "generate_section_questions",
            description: "Generate additional questions for the current section when planned questions are exhausted but section time remains. Use returned questions immediately. Preamble: 'Let me get the next question.'",
            parameters: {
              type: "object",
              properties: {
                sectionName: { type: "string" },
                topic: { type: "string" },
                difficulty: { type: "string" },
                count: { type: "number" },
                questionTypes: { type: "array", items: { type: "string" }, description: "NORMAL, MCQ, CODE_SNIPPET, or GRAPHICAL" },
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
            description: "Alias for generate_section_questions. Use generate_section_questions instead when possible.",
            parameters: {
              type: "object",
              properties: {
                sectionName: { type: "string" },
                topic: { type: "string" },
                difficulty: { type: "string" },
                count: { type: "number" },
                questionTypes: { type: "array", items: { type: "string" }, description: "NORMAL, MCQ, CODE_SNIPPET, or GRAPHICAL" },
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

  // Returns live session + section timing. Included in every tool result so
  // the model always has a fresh clock without a dedicated time-check tool call.
  private getSessionTiming() {
    const elapsedMs = Math.max(0, Date.now() - this.sessionStartedAtMs);
    const remainingMs = Math.max(0, this.durationMs - elapsedMs);
    return {
      sessionElapsedMinutes: Number((elapsedMs / 60000).toFixed(1)),
      sessionRemainingMinutes: Number((remainingMs / 60000).toFixed(1)),
      durationComplete: this.durationCompleteSignaled || this.hardStopSignaled || elapsedMs >= this.durationMs,
      currentSection: this.currentSectionName,
    };
  }

  private async handleFunctionCall(message: OpenAIEventRecord): Promise<void> {
    const fnName = readString(message.name);

    // wait_for_user is a silent no-op — no thinking indicator, no response, no audio
    if (fnName === "wait_for_user") {
      this.sendJson({
        type: "conversation.item.create",
        item: { type: "function_call_output", call_id: readString(message.call_id), output: JSON.stringify({ ok: true }) },
      });
      // Don't call safeResponseCreate — model should stay silent until candidate speaks
      return;
    }

    this.callbacks.onThinkingChange?.(true); // tool call in progress — show "Thinking" in UI

    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(readString(message.arguments) || "{}") as Record<string, unknown>;
    } catch {}

    let result: Record<string, unknown>;
    let needsContinuation = true;

    if (fnName === "save_interview_event") {
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
    } else if (fnName === "finalize_interview_report") {
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
    } else if (fnName === "show_reference_card") {
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
    } else if (fnName === "generate_section_questions" || fnName === "generate_followup_questions") {
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
      result = { ok: false, error: `Unknown function: ${fnName}` };
    }

    // Inject live session timing into every tool result — model always has a
    // fresh clock without needing a dedicated time-check tool call.
    const resultWithTiming = { ...result, sessionTiming: this.getSessionTiming() };

    this.sendJson({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: readString(message.call_id),
        output: JSON.stringify(resultWithTiming),
      },
    });

    this.callbacks.onThinkingChange?.(false); // tool result sent — back to listening or speaking

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
    const questionsPerMinute = (section.questionBankTarget ?? 3) / section.minutes;
    const suggestedMore = Math.max(1, Math.round(questionsPerMinute * remainingMinutes));

    return {
      sectionName,
      elapsedMinutes: Number(elapsedMinutes.toFixed(2)),
      remainingMinutes: Number(remainingMinutes.toFixed(2)),
      instruction:
        remainingMinutes > 0.5
          ? `SECTION TIMING REQUIRED: "${sectionName}" has ${remainingMinutes.toFixed(1)} of ${section.minutes} min remaining. Ask at least ${suggestedMore} more question(s) in this section before any transition. Use generate_section_questions if you run out of planned questions.`
          : `Section "${sectionName}" time nearly met. May transition when objective is complete.`,
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
      // Closing question ONLY allowed after explicit TIME_SIGNAL:DURATION_COMPLETE
      // or HARD_STOP. No time-window fallback — section timers enforce pacing,
      // so the model should never reach the closing question early.
      const closingWindowReached = this.durationCompleteSignaled || this.hardStopSignaled;
      if (!closingWindowReached) {
        this.lastGuardInterventionAtMs = now;
        this.sendSilentContextMessage(
          "CLOSING_WINDOW_GUARD: You asked the final candidate-question prompt too early. Do NOT ask 'Do you have any questions for me/about role/company' until TIME_SIGNAL:DURATION_COMPLETE. Continue with the current section's technical questions. Do not repeat the closing question.",
        );
        return;
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
    // Closing window = signal-only, no time-window fallback
    if (!this.durationCompleteSignaled && !this.hardStopSignaled) {
      blockers.push("TIME_SIGNAL:DURATION_COMPLETE not yet received.");
    }
    return blockers;
  }

  private sendJson(payload: Record<string, unknown>): void {
    if (!this.dc || this.dc.readyState !== "open") return;
    this.dc.send(JSON.stringify(payload));
  }
}
