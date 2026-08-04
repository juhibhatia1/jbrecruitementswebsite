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
  onThinkingChange?: (thinking: boolean, context?: string) => void;
  // Mute the microphone (true=mute, false=unmute). Called without updating the
  // UI locked state — purely a temporary hardware mute to prevent echo capture.
  onMuteRequired?: (muted: boolean) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  // Fired when the mic produces zero audio for ~30s while it should be active.
  // Handler should re-acquire the mic device and call transport.replaceAudioTrack().
  onMicHealthFailed?: () => void;
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
  // Tracks async tool execution (HTTP calls). Blocks nudge timers during long tool calls
  // so response.created doesn't fire mid-tool and clear the Thinking UI state.
  private toolCallInProgress = false;
  // True if the current response included a function call. Prevents response.done from
  // starting a spurious silence nudge after the candidate's answer was processed via tool.
  private currentResponseHadToolCall = false;
  // True if the current response included audio output. Used to decide needsContinuation
  // for save_interview_event: audio responses already asked the next question so no extra
  // response.create needed; tool-call-only responses need one to avoid a 47s stall.
  private currentResponseHadAudio = false;

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

  // Mic mute timer — unmutes shortly after AI audio finishes
  private muteTimer: ReturnType<typeof setTimeout> | null = null;

  // save_interview_event nudge timer — cancelled if model naturally generates next question
  private saveNudgeTimer: ReturnType<typeof setTimeout> | null = null;

  // True while PCM audio sources are scheduled and playing naturally (false after cancel/stop)
  // Used in source.onended to gate nudge start — prevents spurious nudge after cancelResponse
  private audioPlaybackActive = false;
  // True from speech_started until speech_stopped/committed — prevents nudge firing mid-answer
  private candidateSpeaking = false;

  // Mic health monitoring — detects silent/dead tracks (e.g. headset init race)
  private micHealthCheckInterval: ReturnType<typeof setInterval> | null = null;
  private lastTotalAudioEnergy = 0;
  private zeroEnergyStreak = 0;
  // Timestamp of last detected candidate speech — guards health check from normal silence
  private lastCandidateSpeechAtMs = 0;

  // Section boundary timers — fire TIME_SIGNAL:SECTION_COMPLETE at each planned boundary
  private sectionTransitionTimers: ReturnType<typeof setTimeout>[] = [];

  // Bug 4 fix: absolute kill timer after hard stop
  private killTimer: ReturnType<typeof setTimeout> | null = null;
  private static readonly KILL_AFTER_HARD_STOP_MS = 90_000; // 90 seconds after hard stop

  private evaluationEvents: InterviewEvaluationEvent[] = [];

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
    this.evaluationEvents = [];
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
      this.startMicHealthCheck();
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

      this.lastEventAtMs = Date.now();
      this.stallRecoveryAttempts = 0;

      // ── PIPELINE TIMESTAMP LOGGING (for latency diagnosis) ──────────────────
      // Events that matter for measuring listening/response delay.
      // Format: [RTPIPE] <event_type> <timestamp_ms>
      const pipelineEvents = new Set([
        "input_audio_buffer.speech_started",
        "input_audio_buffer.speech_stopped",
        "input_audio_buffer.committed",
        "response.created",
        "response.output_audio.delta",
        "response.output_audio_transcript.done",
        "response.done",
        "response.cancelled",
        "conversation.item.input_audio_transcription.completed",
      ]);
      if (message.type && pipelineEvents.has(message.type as string)) {
        const extra = message.type === "response.output_audio.delta" ? " (first_delta_only_once)" : "";
        console.log(`[RTPIPE] ${message.type}${extra} @ ${Date.now()}ms`);
      }
      // ─────────────────────────────────────────────────────────────────────────

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
        // response.output_audio_transcript.done fires after audio has already played
        // via the WebRTC RTP stream. Only ~500-800ms of buffer tail remains.
        // 500ms: enough for WebRTC buffer tail (~200-400ms). Was 700ms but reducing
        // to cut total response latency (700ms unmute + 800ms VAD = 1.5s before AI can
        // start processing candidate speech).
        // Text-length-based unmute: ~15 chars/sec speaking rate + 1000ms WebRTC buffer.
        // Previous fixed 500ms was wrong — transcript.done fires while audio still plays
        // 1-3s more. This unmutes AFTER audio actually finishes so AEC has nothing to cancel.
        // transcript.done fires after all RTP audio has been sent; only ~200-400ms of
        // WebRTC buffer tail remains. Use actual playbackCursor remainder + 500ms tail guard
        // instead of total-text-length estimate, which was keeping mic muted 10-14s.
        let unmuteDelayMs: number;
        if (this.playbackCtx) {
          const remainingAudioMs = Math.max(0, (this.playbackCursor - this.playbackCtx.currentTime) * 1000);
          unmuteDelayMs = Math.max(800, remainingAudioMs + 500);
        } else {
          unmuteDelayMs = 1500;
        }
        this.audioTailProtectionUntilMs = Date.now() + unmuteDelayMs;
        this.scheduleMicUnmute(unmuteDelayMs);
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
          // Candidate transcription received — mic is working; reset health streak
          this.zeroEnergyStreak = 0;
          // Candidate transcription received — they answered; clear any stale nudge timer
          this.candidateSpeaking = false;
          if (this.saveNudgeTimer) { clearTimeout(this.saveNudgeTimer); this.saveNudgeTimer = null; }
          // NOTE: Do NOT send response.create here. With server_vad, OpenAI automatically
          // generates a response after detecting end of speech. Sending a manual response.create
          // causes duplicate responses (AI repeats questions, says "let me think", etc.)
        }
      }

      if (
        message.type === "input_audio_buffer.speech_stopped" ||
        message.type === "input_audio_buffer.committed"
      ) {
        // VAD detected end of candidate speech — clear speaking flag so nudge can run again
        this.candidateSpeaking = false;
        // Refresh lastCandidateSpeechAtMs on each VAD commit so the 30s guard stays
        // active for the full duration of long answers (not just from speech_started).
        if (message.type === "input_audio_buffer.committed") {
          this.lastCandidateSpeechAtMs = Date.now();
        }
      }

      if (message.type === "response.function_call_arguments.done") {
        this.currentResponseHadToolCall = true;
        void this.handleFunctionCall(message);
      }

      if (message.type === "input_audio_buffer.speech_started") {
        // Candidate started speaking — cancel nudge, mark speaking
        this.candidateSpeaking = true;
        this.lastCandidateSpeechAtMs = Date.now();
        if (this.saveNudgeTimer) { clearTimeout(this.saveNudgeTimer); this.saveNudgeTimer = null; }
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
        this.currentResponseHadToolCall = false;
        this.currentResponseHadAudio = false;
        this.responseInFlight = true;
        this.assistantSpeaking = true;
        this.assistantSpeakingStartedAtMs = Date.now();
        // Don't clear thinking if a tool HTTP call is still running — the response.created
        // may be a spurious one triggered before the tool completed.
        if (!this.toolCallInProgress) this.callbacks.onThinkingChange?.(false);
        // RE-ENABLED: Logs confirmed echo loop — "গাস টাক গরু নেচ কোশেং" garbage
        // transcriptions are echo being mis-transcribed by Whisper. AEC is NOT cancelling
        // physical speaker echo. input_audio_buffer.clear alone can't keep up (echo refills
        // buffer faster than we clear). Mic muting is the only reliable solution.
        // Previous unmute timing was wrong (500ms after transcript.done while audio still
        // played 1-3s more). Now using text-length estimate to unmute AFTER audio finishes.
        this.callbacks.onMuteRequired?.(true);
        if (this.saveNudgeTimer) { clearTimeout(this.saveNudgeTimer); this.saveNudgeTimer = null; }
        this.callbacks.onAssistantSpeakingChange?.(true);
      }

      if (message.type === "response.output_audio.delta" && message.delta) {
        this.currentResponseHadAudio = true;
        this.playAudioDelta(readString(message.delta));
        this.assistantSpeaking = true;
        this.callbacks.onAssistantSpeakingChange?.(true);
      }

      if (message.type === "response.done") {
        this.responseInFlight = false;
        if (this.scheduledSources.length === 0) {
          // Only clear assistantSpeaking if muteTimer is NOT running.
          // If muteTimer is still active, the previous real response's audio is still
          // playing. A fast save_interview_event response.done fires between the real
          // response's audio start and end — setting assistantSpeaking=false here causes
          // the UI to briefly flash "Listening" while mic is muted, confusing the candidate.
          if (!this.muteTimer) {
            this.assistantSpeaking = false;
            this.callbacks.onAssistantSpeakingChange?.(false);
          }
        }
        // No-audio response with no tool call — unmute quickly and start nudge timer.
        // Skip if response had a tool call: either muteTimer covers it (audio+tool), or
        // the candidate already answered and we must not restart the silence clock.
        if (!this.muteTimer && !this.currentResponseHadToolCall) {
          this.scheduleMicUnmute(300, () => this.startCandidateSilenceNudge());
        }
        if (this.pendingResponseCreate) {
          this.pendingResponseCreate = false;
          this.safeResponseCreate();
        }
      }

      if (message.type === "response.cancelled") {
        this.responseInFlight = false;
        this.assistantSpeaking = false;
        this.pendingResponseCreate = false;
        this.callbacks.onThinkingChange?.(false);
        this.callbacks.onAssistantSpeakingChange?.(false);
        this.unmuteMicNow();
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
    this.audioTailProtectionUntilMs = 0;
    this.unmuteMicNow();
    this.stopPlayback();
  }

  async replaceAudioTrack(newTrack: MediaStreamTrack): Promise<void> {
    if (!this.pc) return;
    const audioSender = this.pc.getSenders().find(s => s.track?.kind === 'audio');
    if (audioSender) await audioSender.replaceTrack(newTrack);
    // Reset energy baseline — new track starts at 0
    this.lastTotalAudioEnergy = 0;
    this.zeroEnergyStreak = 0;
  }

  close(): void {
    this.manuallyClosed = true;
    this.completed = true;
    this.stopStallWatchdog();
    this.stopMicHealthCheck();
    this.clearKillTimer();
    this.clearSectionTransitionTimers();
    if (this.saveNudgeTimer) { clearTimeout(this.saveNudgeTimer); this.saveNudgeTimer = null; }
    this.unmuteMicNow();
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

  // Mic health monitoring — polls RTCStats every 5s for zero audio energy.
  // 15s startup delay lets the device and AI opening message settle first.
  // After 6 consecutive zero-energy polls (30s), fires onMicHealthFailed so
  // the room can re-acquire the mic device (handles headset init race / AEC over-suppression).
  private startMicHealthCheck(): void {
    setTimeout(() => {
      if (this.completed || this.manuallyClosed) return;
      this.micHealthCheckInterval = setInterval(() => void this.checkMicHealth(), 5_000);
    }, 15_000);
  }

  private stopMicHealthCheck(): void {
    if (this.micHealthCheckInterval) {
      clearInterval(this.micHealthCheckInterval);
      this.micHealthCheckInterval = null;
    }
  }

  private async checkMicHealth(): Promise<void> {
    if (!this.pc || this.completed || this.manuallyClosed) return;
    // Skip while mic is intentionally muted — no audio expected
    if (this.assistantSpeaking || this.muteTimer) {
      this.zeroEnergyStreak = 0;
      return;
    }
    // Normal interview silence (candidate thinking between questions) looks identical to a
    // dead mic. If candidate spoke within the last 90s the mic is clearly working — reset
    // streak. The hardware init bug only happens when the mic NEVER produces any energy.
    if (this.lastCandidateSpeechAtMs > 0 && Date.now() - this.lastCandidateSpeechAtMs < 90_000) {
      this.zeroEnergyStreak = 0;
      return;
    }
    try {
      const stats = await this.pc.getStats();
      let totalAudioEnergy = 0;
      stats.forEach((report) => {
        // media-source report tracks the local audio source (microphone)
        if (report.type === "media-source" && (report as Record<string, unknown>)["kind"] === "audio") {
          totalAudioEnergy = Number((report as Record<string, unknown>)["totalAudioEnergy"] ?? 0);
        }
      });
      const delta = totalAudioEnergy - this.lastTotalAudioEnergy;
      this.lastTotalAudioEnergy = totalAudioEnergy;
      if (delta < 1e-6) {
        this.zeroEnergyStreak++;
      } else {
        this.zeroEnergyStreak = 0;
      }
      if (this.zeroEnergyStreak >= 6) {
        console.warn("[WebRTC] Mic silent for 30s — triggering device recovery");
        this.zeroEnergyStreak = 0;
        this.lastTotalAudioEnergy = 0;
        this.callbacks.onMicHealthFailed?.();
      }
    } catch {
      // getStats throws when connection is closing — safe to ignore
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
      // Send a lightweight nudge — the SYSTEM_RECOVERY text was confusing the model
      // into saying "Apologies, the connection experienced a brief interruption" which
      // sounded broken to the candidate. A simple nudge keeps the interview flowing.
      this.sendJson({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{
            type: "input_text",
            text: "NUDGE: Continue the interview. Ask your next planned question in the current section now.",
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

  // Schedule section transition signals at each planned section boundary.
  // Uses sendSilentContextMessage (NOT sendOrchestrationMessage) to avoid
  // forcing a safeResponseCreate that causes pendingResponseCreate chains
  // and duplicate "Let's move to Section X" responses when responseInFlight=true.
  // Model sees TIME_SIGNAL:SECTION_COMPLETE on its next natural turn and obeys RULE 10.
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
        continue;
      }

      const timer = setTimeout(() => {
        if (this.completed || this.manuallyClosed) return;
        // Silent injection: model sees this on next natural response turn.
        // No safeResponseCreate avoids double "Let's move to Section X" when
        // the timer fires during an active response (pendingResponseCreate chain).
        this.sendSilentContextMessage(
          `TIME_SIGNAL:SECTION_COMPLETE:${section.name}. The planned ${section.minutes}-minute window for section "${section.name}" is now complete. On your next response, transition to section "${nextSection.name}". Ask your first question in "${nextSection.name}". Do not ask more questions about "${section.name}".`,
        );
      }, delayMs);

      this.sectionTransitionTimers.push(timer);
    }
  }

  private clearSectionTransitionTimers(): void {
    for (const t of this.sectionTransitionTimers) clearTimeout(t);
    this.sectionTransitionTimers = [];
  }

  // Schedule mic unmute after a delay. Cancels any pending unmute timer first.
  private scheduleMicUnmute(delayMs: number, onUnmuted?: () => void): void {
    if (this.muteTimer) {
      clearTimeout(this.muteTimer);
      this.muteTimer = null;
    }
    this.muteTimer = setTimeout(() => {
      this.muteTimer = null;
      this.callbacks.onMuteRequired?.(false);
      if (!this.responseInFlight) {
        this.assistantSpeaking = false;
        this.callbacks.onAssistantSpeakingChange?.(false);
      }
      onUnmuted?.();
    }, delayMs);
  }

  // Immediately cancel any pending unmute timer and unmute the mic now.
  private unmuteMicNow(): void {
    if (this.muteTimer) {
      clearTimeout(this.muteTimer);
      this.muteTimer = null;
    }
    this.callbacks.onMuteRequired?.(false);
  }

  // Start nudge timer after AI speech is fully done. Called from source.onended (audio path)
  // or scheduleMicUnmute callback (no-audio path). Uses 30s if candidate requested more time.
  private startCandidateSilenceNudge(): void {
    if (this.completed || this.manuallyClosed || this.responseInFlight || this.candidateSpeaking) return;
    // Don't restart nudge clock if candidate spoke within last 30s — prevents firing mid long-answer
    if (this.lastCandidateSpeechAtMs > 0 && Date.now() - this.lastCandidateSpeechAtMs < 30_000) return;
    if (this.saveNudgeTimer) clearTimeout(this.saveNudgeTimer);
    this.saveNudgeTimer = setTimeout(() => {
      this.saveNudgeTimer = null;
      if (this.completed || this.manuallyClosed || this.responseInFlight || this.assistantSpeaking || this.toolCallInProgress || this.candidateSpeaking) return;
      this.sendSilentContextMessage(
        "CANDIDATE_SILENT_CHECK: The candidate has been silent since your last question. Check in naturally — vary your phrasing, never repeat the same check-in twice.",
      );
      this.safeResponseCreate();
    }, 17000);
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
    this.stopMicHealthCheck();
    this.clearKillTimer();
    this.clearSectionTransitionTimers();
    if (this.saveNudgeTimer) { clearTimeout(this.saveNudgeTimer); this.saveNudgeTimer = null; }
    this.unmuteMicNow();
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
    this.audioPlaybackActive = true;
    this.scheduledSources.push(source);
    source.onended = () => {
      this.scheduledSources = this.scheduledSources.filter((item) => item !== source);
      // Last buffer finished AND no response generating → AI is truly done speaking
      if (this.scheduledSources.length === 0 && !this.responseInFlight) {
        this.assistantSpeaking = false;
        this.callbacks.onAssistantSpeakingChange?.(false);
        // Start nudge only if playback ended naturally (not cancelled via stopPlayback)
        if (this.audioPlaybackActive) {
          this.startCandidateSilenceNudge();
        }
      }
    };

    const startAt = Math.max(ctx.currentTime, this.playbackCursor);
    source.start(startAt);
    this.playbackCursor = startAt + buffer.duration;
  }

  private stopPlayback(): void {
    // Clear flag before stopping sources so source.onended does NOT trigger nudge
    this.audioPlaybackActive = false;
    for (const source of this.scheduledSources) {
      try {
        source.stop();
      } catch {}
    }
    this.scheduledSources = [];
    this.playbackCursor = 0;
    this.unmuteMicNow();
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

IMPORTANT — INTRO GATE (hard rule, no exceptions):
You may have background information about the candidate from their application or resume. This context is for personalising questions later — it does NOT count as their introduction.

The candidate MUST verbally introduce themselves in this session before you do any of the following:
- Say "Nice background", "Great background", "Nice intro", "Thanks for sharing that", or any acknowledgment of their background
- Ask the first technical or behavioural question
- Transition to Section 1

A valid verbal introduction requires ALL of the following to be present in one spoken response:
1. Their name (spoken aloud)
2. Their current or most recent role
3. At least a sentence or two of background context

If their first spoken response is only 1–5 words, a noise phrase, or does not include their name and role: do NOT treat it as an introduction. Re-ask the introduction prompt once and wait.

The greeting, showing the reference card, and asking "whenever you're ready, please introduce yourself" do NOT count as receiving the intro — they are the setup. The intro is only received when the candidate speaks it.

# Personality and Tone

Senior engineer running a mock interview — you are both evaluating the candidate honestly AND coaching them to improve. Warm but direct. Engaged and curious. Evaluate each answer on its merit — strong answers get genuine acknowledgment, weak or wrong answers get an honest assessment plus the correct explanation. When they miss something, name what they missed and why it matters in real interviews. Your dual goal: give them an accurate sense of where they stand, and leave them knowing more than when they started. React to each answer differently based on quality — over-praising everything equally is both dishonest and unhelpful.

# Speech Delivery

Speak at a measured, unhurried pace — slightly slower than normal conversation speed. Pause naturally between your acknowledgment and your next question. Use short, clearly separated sentences rather than long run-on responses. Never rush through a question; give the candidate time to process each word before they need to respond.

# Language

English only. Do not switch languages based on accent, pronunciation, or isolated foreign words.

# Reasoning

Reason internally before: evaluating multi-part answers, choosing between sections, tool selection when ambiguous.
Respond quickly without extended reasoning: greetings, simple acknowledgments, repeating a question.
Do not reason when audio is unclear — ask for clarification instead.

# Preambles

Never announce tool calls. generate_section_questions and finalize_interview_report run silently — do NOT say "Let me get the next question", "I'll generate a follow-up", or any variation before calling them. The sequence is: evaluate/acknowledge answer aloud → call save_interview_event silently → (if needed) call generate_section_questions silently → ask the next question directly.

Before save_interview_event: evaluate and acknowledge the answer aloud first (see ## Answer handling), then call the tool silently — never say "I'll save that", "I'll note that", or "I'll log that".

Never say: "Let me think...", "Hmm...", "One moment...", "Let me formulate my next question.", "I'll generate a follow-up.", "Let me get the next question."

# Verbosity

- Acknowledgment + next question: always in ONE spoken turn (see ## Answer handling). The total length of acknowledgment can be 1–3 sentences — vary by answer quality — but the next question must always follow in the same turn before calling save_interview_event.
- Questions: 1–3 sentences — do not over-explain
- MCQ answers: name the choice, say if right or wrong, give the one-line reason, then ask the next question — all in one turn
- Clarifications: one question at a time
- Never narrate your reasoning aloud
- It is always better to spend one extra turn going deeper on a meaningful answer than to rush to the next question. Depth signals a real interview, not a quiz.

# Interview Flow

## Turn completion
When candidate says "I'm done", "done", "finished", "that's all", "next question", "continue", "move on": they finished their answer. Ask your next planned question immediately. Do NOT acknowledge these phrases verbally.

## Early exit requests
When candidate says "I want to stop", "end the interview", "I want to quit", "stop", "exit": respond exactly — "If you'd like to end early, click the 'End Interview' button on your screen. Otherwise let's continue." Then ask the next question.

## Filler-only responses
When candidate's full response is only 1–3 words of pure filler (uh / um / so / yeah / hmm): this is not a complete answer. Say "Go ahead" or "Please continue." Do NOT say "Good point" or infer a position they never stated.

## Thinking time
When candidate says "wait", "I'm thinking", "give me a moment", "let me think", "one second" — say "Take your time." and wait silently. Do NOT repeat the question. Do NOT prompt again for at least 30 seconds.

## Answer handling

You are a mock interviewer whose job is to help the candidate improve. React to what they actually said — like a senior engineer having a real conversation, not a rubric scoring answers into buckets.

After every complete answer, follow this EXACT sequence in ONE single spoken turn:
1. Acknowledge the answer with 1–3 sentences referencing their actual words. Vary length by quality:
   - Strong answer: acknowledge the specific point, add one useful depth note
   - Missed key points: name what they got right, name what was missing and why it matters
   - Wrong answer: "Not quite — [clarification]. The real answer is [correct explanation]."
   - Vague answer: ask specifically for what's missing before moving on
2. Ask the next planned question immediately in the SAME spoken response — do NOT end your turn after the acknowledgment alone.
3. THEN call save_interview_event silently.

CRITICAL — NEVER split these into two turns:
- WRONG: Turn 1: "Good point about SEO." → [ends] → Tool call → Turn 2: "Next question: what is SEM?"
- RIGHT: Turn 1: "Good point about SEO — worth adding that organic ranking builds compounding value over time. What is SEM and how does it differ?" → [call save_interview_event]

If you find yourself about to end a spoken response with only an acknowledgment and no next question, add the question before ending the turn. The acknowledgment and the next question are always ONE response.

## Incomplete answers
If a technical or behavioral question gets a 1–5 word answer with no explanation: do NOT call save_interview_event. Ask specifically for what's missing: "Can you explain what that looks like in practice?" or "How would that work in a real system?" Wait for a real answer, then respond and save. Do NOT probe MCQ answers — they are closed-choice.

## Transition sentences
Never end a response with a transition sentence alone ("Let's build on that", "Let's move to the next question", "Let's keep going", "Let's continue with", "Moving on to"). Every response that contains a transition MUST include the actual question in the same response. Transition + question = one single response. Never split across two turns.

## Meta-commentary (expanded)
When candidate says "why are you pausing", "reply please", "are you stuck", "go on", "move on", "do your response", "I already answered", "I said that", "I did complete my answer" — say "Apologies." and ask your next planned question immediately. Do not generate an empty or silent response.

## Silence check-in (CANDIDATE_SILENT_CHECK)
IMPORTANT: The check-in phrases below are EXCLUSIVELY for use when you receive the explicit CANDIDATE_SILENT_CHECK signal. Never use them in any other context — especially not after save_interview_event returns or after a candidate completes their answer.
When you receive CANDIDATE_SILENT_CHECK: the candidate has been silent since your last question. Check in briefly and naturally — vary your wording every time, never repeat the same phrasing twice in a row. Examples (use ONLY when triggered by CANDIDATE_SILENT_CHECK):
- "Take your time — still working through it, or ready to move on?"
- "No rush — need more time, or shall we continue?"
- "Still thinking? Whenever you're ready."
- "Are you ready for the next question, or would you like more time?"
Then:
- If they say they need time / are thinking / "yes" / "give me a sec" / any affirmative: say "Of course." or "Sure, take your time." and wait silently. Do NOT ask another question. Do NOT send another check-in.
- If they say skip / next / move on / "next question": acknowledge briefly and ask your next planned question.
- If response is unclear: treat it as needing more time and wait silently.

## Repeat requests
When candidate says "repeat", "can you repeat that", "say that again", "ask again", "what was the question", "didn't catch that", "pardon", "come again", "I didn't hear you", "could you repeat" — immediately repeat your last question verbatim, word for word. Rules:
- Do NOT call save_interview_event.
- Do NOT evaluate this as an answer.
- Do NOT move to the next question.
- Do NOT add commentary before repeating — just say the question again.
- If candidate asks to repeat multiple times in a row: repeat each time without frustration.

## No duplicate questions
Never ask a question you have already asked in this interview, even rephrased. Each save_interview_event records a question as asked. If generate_section_questions returns, all previously asked questions are automatically excluded. Do NOT revisit covered ground.

## No closing before signal
Never ask "Do you have any questions for me?" or "Do you have any questions about the role?" until you receive TIME_SIGNAL:DURATION_COMPLETE. If you feel the urge to close early, ask another section question instead.

## Closing question handling (FINAL_CLOSING_WINDOW only)
Once you have asked "Do you have any questions for me?" (only after TIME_SIGNAL:DURATION_COMPLETE), handle the candidate's response as a real interviewer would:

- If they ask a genuine question about the role, company, process, team, or career: answer it properly. Give a thoughtful, relevant response — at least 2–4 sentences. Do NOT deflect with "that's a great question, I'll note that" and move on. Actually answer it. If they ask a follow-up, answer that too.
- If they say they have no questions or give a short close ("no thanks", "I'm good", "that's all"): acknowledge it warmly and move to closing remarks.
- After all their questions are answered: thank them, give a brief verbal summary of the topics covered, wish them well, then call finalize_interview_report.

This is a ONE-WAY gate — do NOT return to technical questions after asking the closing question under any circumstances.

## Section timing — HARD CONSTRAINT

NEVER self-initiate a section transition. Only transition when:
- You receive TIME_SIGNAL:SECTION_COMPLETE:[name], OR
- sectionPacing.instruction explicitly says "time nearly met"

Every save_interview_event result includes sectionPacing.instruction. Treat it as a hard order:
- "X min remaining, ask at least N more question(s)": you MUST stay in the current section and ask those questions. Do NOT wrap up. Do NOT close. Do NOT ask "any questions for me?".
- "time nearly met": you may transition when the current question cycle completes naturally.

If you run out of planned questions but sectionPacing says time remains: call generate_section_questions immediately (sectionName = current section, count = ceil(remainingMinutes × 1.2) capped at 5, min 2). After results return, continue in the same section — do NOT transition.

When you receive TIME_SIGNAL:SECTION_COMPLETE:[name]: transition on your very next response and ask the first question of the named section. Do not finish another question in the old section.

## Never announce pauses
Never say "I'll pause here", "let's pause", "we'll pick up later". The interview runs continuously until finalize_interview_report is called.

# Noise and Hallucinated Transcripts — MANDATORY SILENT DISCARD

Speech recognition (Whisper) frequently hallucinates short filler phrases from silence or ambient noise. These are NOT candidate answers.

AUTOMATIC wait_for_user triggers — call the tool with ZERO spoken response when the transcript is:
- An exact match (case-insensitive, 1–4 words total) to one of these: "okay", "ok", "yeah", "yep", "nope", "sure", "right", "bye", "bye bye", "goodbye", "thanks", "thank you", "later", "see you", "see you later", "stay healthy", "take care", "shalom", "dios", "chur", "chur chur", "soon", "bye everyone", "hmm", "uh", "um", "ah", "oh"
- Side-conversation: the utterance explicitly mentions another person or place that is clearly not this interview (e.g. "talk to you later John", "I'll be right there")

IMPORTANT SAFETY RULE — do NOT call wait_for_user when:
- The transcript is 5 or more words, regardless of how it starts (even if it begins with "yeah", "so", "okay" — a long response is always a real candidate attempt)
- The transcript contains a name, a role title, a company name, or any factual content — treat it as a real answer
- You are waiting for the intro and the response contains personal information

Rules:
- Do NOT say "I may have caught background noise" more than once per 3-minute window — if noise repeats, call wait_for_user silently every time
- Do NOT interpret a standalone "thank you" or "okay" as confirmation of an answer unless they preceded it with a substantive response in the same turn
- A candidate saying only "okay" or "sure" (≤4 words, no content) after your question is NOT an answer — call wait_for_user and wait

# Unclear Audio

When candidate audio is unclear, cut off, or unintelligible (but is clearly an attempt to answer): ask "Sorry, could you repeat that?" Do not guess. Do not call tools. Do not generate preambles. Do not repeat the same clarification request more than once for the same utterance.

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
        // low: interview conductor doesn't need deep reasoning. medium added ~1s latency
        // per response making conversation feel sluggish. low is sufficient for
        // answer evaluation, tool selection, and section timing decisions.
        reasoning: { effort: "low" },
        audio: {
          input: {
            format: { type: "audio/pcm", rate: 24000 },
            turn_detection: {
              type: "server_vad",
              // threshold 0.65: raised from API default 0.5 — keyboard clicks, ambient noise,
              // and breathing no longer trigger speech detection mid-answer. Normal speech volume
              // still clears this easily. silence_duration_ms: 1000ms prevents fragmentation when
              // candidate pauses briefly mid-sentence.
              threshold: 0.65,
              silence_duration_ms: 1500,
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
            description: "Call this silently (no spoken reply) ONLY when the transcript is a short noise or filler phrase with NO substantive content.\n\nUSE when the transcript is 1–4 words AND is an exact or near-exact match to a known noise phrase: 'thank you', 'thanks', 'bye', 'bye bye', 'goodbye', 'see you', 'see you later', 'ok', 'okay', 'yeah', 'yep', 'nope', 'sure', 'right', 'hmm', 'uh', 'um', 'ah', 'oh', 'stay healthy', 'take care', 'shalom', 'dios', 'chur', 'chur chur', 'soon', 'bye everyone'.\nAlso use for clear side-conversations not addressed to you.\n\nDO NOT USE when:\n• The transcript is 5 or more words — always treat as a real candidate response\n• The transcript contains a name, role, company, or any factual content\n• You are unsure — when in doubt, respond normally\n\nAfter calling this, say nothing. Wait silently for the candidate to speak again.",
            parameters: { type: "object", properties: {}, required: [] },
          },
          {
            type: "function",
            name: "save_interview_event",
            description: "PROACTIVE — Evaluate and store a candidate answer. CRITICAL SEQUENCE: (1) In your CURRENT spoken response, acknowledge the answer AND ask the NEXT planned question. Both must be in the SAME spoken turn. (2) THEN call this tool silently — no preamble, no 'I'll note that', no spoken announcement of any kind. (3) Do NOT generate another spoken response after this tool returns (no continuation). The next spoken response comes when the candidate answers your question. Do NOT say 'I'll note that' or any other indicator before calling this tool.",
            parameters: {
              type: "object",
              properties: {
                question: { type: "string" },
                sectionName: { type: "string" },
                answerSummary: { type: "string" },
                score: {
                  type: "number",
                  description: "Score 1–10. CALIBRATION (strictly follow this): 9–10 = correct, well-articulated, showed depth or real-world understanding; 7–8 = correct with solid understanding, minor gaps or missing edge cases are acceptable; 5–6 = partially correct, some understanding but notable gaps or vagueness; 3–4 = mostly incorrect or very vague, limited understanding; 1–2 = wrong answer or no meaningful attempt. CRITICAL: Do NOT default to 5–6 for correct answers. A candidate who answers correctly and demonstrates understanding MUST receive 7–9. Reserve scores below 5 strictly for wrong or deeply confused answers. When in doubt between two bands, round UP.",
                },
                feedback: {
                  type: "string",
                  description: "Constructive and specific. Lead with what the candidate got right before noting gaps. Frame gaps as growth opportunities, not failures. Be encouraging.",
                },
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
                summary: { type: "string", description: "Supportive, constructive summary. Acknowledge what the candidate did well first, then frame areas for growth as learning opportunities. Candidate should feel motivated." },
                strengths: { type: "array", items: { type: "string" } },
                weaknesses: { type: "array", items: { type: "string" } },
                improvements: { type: "array", items: { type: "string" } },
                finalScore: { type: "number" },
                sectionScores: {
                  type: "array",
                  description: "One entry per interview section from the blueprint. Score each section 1–5 (1=poor, 2=below average, 3=average, 4=good, 5=excellent).",
                  items: {
                    type: "object",
                    properties: {
                      section: { type: "string", description: "Section name exactly as used during the interview" },
                      score: { type: "number", description: "1–5 score for this section" },
                      maxScore: { type: "number", description: "Always 5" },
                    },
                    required: ["section", "score", "maxScore"],
                  },
                },
                encouragementLine: {
                  type: "string",
                  description: "One genuine, specific positive sentence about this candidate. Reference something real from the interview — a strong answer, clear communication, good project knowledge, or enthusiasm. Never write generic filler like 'You did a great job!' — make it specific to what this candidate actually demonstrated.",
                },
              },
              required: ["summary", "strengths", "weaknesses", "improvements", "finalScore"],
            },
          },
          {
            type: "function",
            name: "show_reference_card",
            description: "PROACTIVE — Display a code snippet or MCQ on the candidate's screen BEFORE asking the question verbally. ONLY USE FOR: code snippets (Java code to analyze/debug), MCQ answer options. DO NOT USE FOR: architecture diagrams, system design prompts, or open-ended design questions — those must be asked verbally only, no card. Sequence when appropriate: (1) call tool, (2) immediately say 'Take a look at the code on your screen. What will this print, and why?' — (3) wait for answer. Never answer the question yourself. Never call this and stay silent.",
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
            description: "Generate additional questions when planned questions run out but section time remains. Set count = Math.ceil(sessionTiming.sessionRemainingMinutes * 1.2) capped at 5, minimum 2 — use remaining interview time to generate the right number, not a fixed 3. Call silently — no preamble. After receiving results, ask the first question directly.",
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

    // Emit contextual thinking text so UI can show what's happening
    const thinkingContext: Record<string, string> = {
      save_interview_event: "Evaluating answer…",
      finalize_interview_report: "Generating your report…",
      show_reference_card: "Preparing question…",
      generate_section_questions: "Planning follow-up questions…",
      generate_followup_questions: "Planning follow-up questions…",
      wait_for_user: "",
    };
    this.callbacks.onThinkingChange?.(true, thinkingContext[fnName] ?? "Processing…");
    this.toolCallInProgress = true;

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
      this.evaluationEvents.push(event);
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
        instruction = `You are slightly behind question pace — keep your acknowledgment to 1–2 sentences and move to the next question. That said, if the candidate's last answer opened an interesting thread worth one follow-up, pursue it briefly before moving on. Quality and natural flow matter more than hitting a number. REMINDER: Use show_reference_card for code snippets, MCQs, and visual questions.${sectionGuidance?.instruction ? ` ${sectionGuidance.instruction}` : ""}`;
      } else {
        instruction = `Pacing is good. Continue at a natural conversational pace — it is perfectly fine to spend an extra turn going deeper on a strong or weak answer before moving on. Do not rush through questions just to cover more ground. REMINDER: Use show_reference_card for code snippets, MCQs, and visual questions — aim for at least 1 reference card per section.${sectionGuidance?.instruction ? ` ${sectionGuidance.instruction}` : ""}`;
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
      // Reset speech timestamp so the nudge guard doesn't block the NEXT question's
      // silence window — answer is saved, new question cycle starts clean.
      this.lastCandidateSpeechAtMs = 0;
      // needsContinuation=!currentResponseHadAudio: if the model combined audio + tool in one
      // response (spoke acknowledgment then called tool), it already asked the next question —
      // no extra response.create needed. If it sent tool-only (no audio), fire safeResponseCreate()
      // after HTTP returns to avoid a 47s stall. currentResponseHadToolCall=true blocks the
      // response.done nudge-restart path so we don't restart the 15s silence timer.
      needsContinuation = !this.currentResponseHadAudio;
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

    this.toolCallInProgress = false;
    // Keep thinking=true when continuation fires — response.created of next response clears it.
    // Only clear here when no continuation (no more AI response coming immediately).
    if (!needsContinuation) {
      this.callbacks.onThinkingChange?.(false);
    }

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
          alreadyAskedQuestions: this.evaluationEvents.map((e) => e.question),
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
    // Fuzzy match: strip "Section N - " prefix and normalize case so AI-reported names match blueprint
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/^section\s*\d+[\s\-:]+/i, "")
        .trim();
    const section = this.sectionPlan.find(
      (item) => item.name === sectionName || normalize(item.name) === normalize(sectionName),
    );
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
