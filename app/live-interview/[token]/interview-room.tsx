"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { IoMic, IoMicOff } from "react-icons/io5";
import type { InterviewFinalReport, InterviewReferenceCard, InterviewTranscriptEntry } from "@/lib/interview/types";
import { OpenAIWebRtcInterviewTransport } from "@/lib/interview/web-rtc-transport";
import { buildTimeline } from "@/app/components/interviews/timeline-utils";
import ConfirmationModal from "@/app/components/ui/confirmation-modal";

type Phase = "setup" | "live" | "results" | "error";
type SetupStep = "mic" | "connecting" | "starting" | "done";

type ServerMessage =
  | { type: "status"; message: string }
  | { type: "ready"; existingTranscript?: InterviewTranscriptEntry[]; existingReferenceCards?: InterviewReferenceCard[] }
  | { type: "error"; message: string }
  | { type: "transcript"; data: InterviewTranscriptEntry }
  | { type: "final_report"; data: InterviewFinalReport }
  | { type: "reference_card"; data: InterviewReferenceCard }
  | { type: "ai_interrupted" }
  | { type: "interview_complete" };

type TranscriptItem =
  | { kind: "speech"; entry: InterviewTranscriptEntry }
  | { kind: "card"; card: InterviewReferenceCard };


// ── Component ─────────────────────────────────────────────────────────────────

export default function InterviewRoom({ token }: { token: string }) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [setupStep, setSetupStep] = useState<SetupStep>("mic");
  const [setupStatus, setSetupStatus] = useState("Requesting microphone access…");
  const [errorMsg, setErrorMsg] = useState("");
  const [transcriptItems, setTranscriptItems] = useState<TranscriptItem[]>([]);
  const [finalReport, setFinalReport] = useState<InterviewFinalReport | null>(null);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiThinkingText, setAiThinkingText] = useState("Thinking…");
  const [isStarting, setIsStarting] = useState(false);
  const [micLocked, setMicLocked] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [clockTick, setClockTick] = useState(() => Date.now());
  const [hasStream, setHasStream] = useState(false);
  const [timingState, setTimingState] = useState({
    startedAt: 0,
    durationMs: 15 * 60 * 1000,
  });

  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const micCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silentGainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const remotePlaybackSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const remotePlaybackGainRef = useRef<GainNode | null>(null);
  const transportRef = useRef<OpenAIWebRtcInterviewTransport | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const sessionTokenRef = useRef<string>(token);
  const syncTimerRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);
  const transcriptRef = useRef<InterviewTranscriptEntry[]>([]);
  const evaluationEventsRef = useRef<{ at: string; question: string; answerSummary: string; score: number; feedback: string; improvementTip?: string }[]>([]);
  const referenceCardsRef = useRef<InterviewReferenceCard[]>([]);
  const finalReportRef = useRef<InterviewFinalReport | null>(null);
  const pendingCardsRef = useRef<InterviewReferenceCard[]>([]);
  const durationWarningTimerRef = useRef<number | null>(null);
  const durationTargetTimerRef = useRef<number | null>(null);
  const durationHardStopTimerRef = useRef<number | null>(null);
  const durationWarningShownRef = useRef(false);
  const durationCompleteSignalSentRef = useRef(false);
  const hardStopSignalSentRef = useRef(false);
  const interviewStartedAtRef = useRef<number | null>(null);
  const interviewDurationMsRef = useRef(15 * 60 * 1000);

  const phaseRef = useRef<Phase>("setup");
  const sessionTokenKey = `jb-webrtc-session:${token}`;

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (phase !== "live") {
      return;
    }

    const timerId = window.setInterval(() => {
      setClockTick(Date.now());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [phase]);

  const setMicCaptureEnabled = useCallback((enabled: boolean) => {
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
    setMicLocked(!enabled);
  }, []);

  const toggleMicCapture = useCallback(() => {
    if (!streamRef.current) return;
    setMicCaptureEnabled(micLocked);
  }, [micLocked, setMicCaptureEnabled]);



  const stopMic = useCallback(() => {
    setMicLocked(true);
    setHasStream(false);
    silentGainRef.current?.disconnect();
    analyserRef.current?.disconnect();
    sourceRef.current?.disconnect();
    remotePlaybackSourceRef.current?.disconnect();
    remotePlaybackGainRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    void micCtxRef.current?.close();
    silentGainRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    remotePlaybackSourceRef.current = null;
    remotePlaybackGainRef.current = null;
    streamRef.current = null;
    micCtxRef.current = null;
  }, []);

  const scheduleSync = useCallback(() => {
    if (!sessionIdRef.current) return;
    if (syncTimerRef.current) {
      window.clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = window.setTimeout(() => {
      void fetch(`/api/interviews/webrtc/sessions/${sessionIdRef.current}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionTokenRef.current,
          transcript: transcriptRef.current,
          events: evaluationEventsRef.current,
          referenceCards: referenceCardsRef.current,
          finalReport: finalReportRef.current,
          status: phaseRef.current === "results" ? "COMPLETED" : "ACTIVE",
        }),
      }).catch(() => {});
    }, 1000);
  }, []);

  const finalizeSession = useCallback(
    async (status: "COMPLETED" | "TERMINATED" | "FAILED") => {
      if (!sessionIdRef.current) return null;

      try {
        const res = await fetch(`/api/interviews/webrtc/sessions/${sessionIdRef.current}/finalize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: sessionTokenRef.current,
            transcript: transcriptRef.current,
            events: evaluationEventsRef.current,
            referenceCards: referenceCardsRef.current,
            finalReport: finalReportRef.current,
            status,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.finalReport) {
            finalReportRef.current = data.finalReport;
            setFinalReport(data.finalReport);
            return data.finalReport;
          }
        }
      } catch (error) {
        console.error("Failed to finalize WebRTC session:", error);
      }
      return null;
    },
    [],
  );

  const clearInterviewTiming = useCallback(() => {
    const timers = [
      durationWarningTimerRef.current,
      durationTargetTimerRef.current,
      durationHardStopTimerRef.current,
    ];
    for (const timer of timers) {
      if (timer) {
        window.clearTimeout(timer);
      }
    }
    durationWarningTimerRef.current = null;
    durationTargetTimerRef.current = null;
    durationHardStopTimerRef.current = null;
  }, []);

  const formatTimer = useCallback((totalSeconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }, []);

  const handleConfirmExit = useCallback(async () => {
    clearInterviewTiming();
    stopMic();
    setAiSpeaking(false);
    setAiThinking(false);
    transportRef.current?.endInterview();
    setPhase("results");
    await finalizeSession("COMPLETED");
  }, [clearInterviewTiming, stopMic, finalizeSession]);

  const armInterviewTiming = useCallback(() => {
    if (!interviewStartedAtRef.current || !interviewDurationMsRef.current) {
      return;
    }

    clearInterviewTiming();

    const now = Date.now();
    const targetAt = interviewStartedAtRef.current + interviewDurationMsRef.current;
    const warningAt = targetAt - 30_000;
    const hardStopAt = targetAt + 2 * 60_000; // 2 min grace after duration (not 5)

    const schedule = (at: number, setter: (timerId: number) => void, action: () => void) => {
      const delay = at - now;
      if (delay <= 0) {
        action();
        return;
      }
      const timerId = window.setTimeout(action, delay);
      setter(timerId);
    };

    schedule(
      warningAt,
      (timerId) => {
        durationWarningTimerRef.current = timerId;
      },
      () => {
        if (phaseRef.current !== "live" || durationWarningShownRef.current) return;
        durationWarningShownRef.current = true;
        toast.info("Interview is nearing completion. About 30 seconds left in the scheduled duration.");
        transportRef.current?.sendOrchestrationMessage(
          "TIME_SIGNAL:30_SECONDS_REMAINING. You are 30 seconds away from the scheduled interview duration. Keep all mandatory interview requirements intact, tighten pacing, and prepare a graceful close without ending abruptly.",
        );
      },
    );

    schedule(
      targetAt,
      (timerId) => {
        durationTargetTimerRef.current = timerId;
      },
      () => {
        if (phaseRef.current !== "live" || durationCompleteSignalSentRef.current) return;
        durationCompleteSignalSentRef.current = true;
        transportRef.current?.sendOrchestrationMessage(
          "TIME_SIGNAL:DURATION_COMPLETE. The scheduled interview duration is NOW COMPLETE. You MUST begin wrapping up immediately. Steps: (1) Let the candidate finish their current answer if mid-response. (2) Ask AT MOST 1-2 more quick questions if critical coverage is missing. (3) Ask 'Do you have any questions about the role or company?' — this is the FINAL candidate question. (4) After the candidate responds, thank them and call finalize_interview_report IMMEDIATELY. Do NOT continue asking new technical questions after this signal.",
        );
      },
    );

    schedule(
      hardStopAt,
      (timerId) => {
        durationHardStopTimerRef.current = timerId;
      },
      () => {
        if (phaseRef.current !== "live" || hardStopSignalSentRef.current) return;
        hardStopSignalSentRef.current = true;
        transportRef.current?.sendOrchestrationMessage(
          "TIME_SIGNAL:HARD_STOP_REACHED. MANDATORY: Stop all questioning NOW. Say 'Thank you for your time — your performance report will be generated shortly.' Then IMMEDIATELY call finalize_interview_report with your evaluation. Do NOT ask any more questions.",
        );
      },
    );

    // Bug 4 fix: absolute client-side kill — force finalize 2 minutes after hard stop
    const absoluteKillAt = hardStopAt + 2 * 60_000;
    schedule(
      absoluteKillAt,
      (timerId) => {
        // Reuse hardStopTimerRef slot since hard stop already fired
        durationHardStopTimerRef.current = timerId;
      },
      () => {
        if (phaseRef.current !== "live") return;
        console.warn("[InterviewRoom] Absolute kill timer fired — forcing session end");
        toast.info("Interview time limit reached. Finalizing your session...");
        clearInterviewTiming();
        stopMic();
        setAiSpeaking(false);
        transportRef.current?.close();
        setPhase("results");
        void finalizeSession("COMPLETED");
      },
    );
  }, [clearInterviewTiming, finalizeSession, stopMic]);

  const handleTransportMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case "status":
        if (phaseRef.current !== "live") setSetupStatus(msg.message);
        break;

      case "error":
        setErrorMsg(msg.message);
        setAiSpeaking(false);
        if (phaseRef.current === "live") {
          // Bug 3 fix: Surface errors during live phase as a toast, not a phase change
          toast.error(msg.message);
        } else if (phaseRef.current !== "results") {
          setPhase("error");
        }
        break;

      case "ready":
        if (msg.existingTranscript?.length) {
          transcriptRef.current = msg.existingTranscript;
          referenceCardsRef.current = msg.existingReferenceCards || [];
          setTranscriptItems(buildTimeline(msg.existingTranscript, msg.existingReferenceCards || []));
        }
        setSetupStep("done");
        setSetupStatus("Interview starting…");
        setAiSpeaking(false);
        setPhase("live");
        armInterviewTiming();
        break;

      case "transcript": {
        const isCandidate = msg.data.role === "candidate";
        if (isCandidate && !isEnglishText(msg.data.text)) {
          console.warn("Ignoring non-English/noise candidate transcript input:", msg.data.text);
          break;
        }
        transcriptRef.current = [...transcriptRef.current, msg.data];
        if (msg.data.role === "interviewer" && pendingCardsRef.current.length > 0) {
          const pending = pendingCardsRef.current.splice(0);
          for (const card of pending) {
            card.afterTranscriptIndex = transcriptRef.current.length;
          }
          setTranscriptItems((prev) => [
            ...prev,
            { kind: "speech", entry: msg.data },
            ...pending.map((card) => ({ kind: "card" as const, card })),
          ]);
        } else {
          setTranscriptItems((prev) => [...prev, { kind: "speech", entry: msg.data }]);
        }
        scheduleSync();
        break;
      }

      case "final_report":
        finalReportRef.current = msg.data;
        setFinalReport(msg.data);
        scheduleSync();
        break;

      case "reference_card": {
        const card = msg.data.afterTranscriptIndex === undefined
          ? { ...msg.data, afterTranscriptIndex: transcriptRef.current.length }
          : msg.data;
        referenceCardsRef.current = [...referenceCardsRef.current, card];
        pendingCardsRef.current.push(card);
        scheduleSync();
        break;
      }

      case "ai_interrupted":
        setAiSpeaking(false);
        break;

      case "interview_complete":
        clearInterviewTiming();
        stopMic();
        setPhase("results");
        void finalizeSession("COMPLETED");
        break;
    }
  }, [armInterviewTiming, clearInterviewTiming, finalizeSession, scheduleSync, stopMic]);

  const currentTimeMs = clockTick;
  const elapsedSeconds =
    phase === "live" && timingState.startedAt
      ? Math.max(0, Math.floor((currentTimeMs - timingState.startedAt) / 1000))
      : 0;
  const totalDurationSeconds = Math.max(1, Math.floor(timingState.durationMs / 1000));
  const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);
  const progressPercent = Math.min(100, (elapsedSeconds / totalDurationSeconds) * 100);
  const timerTone =
    remainingSeconds <= 60
      ? "text-red-600"
      : remainingSeconds <= 5 * 60
        ? "text-amber-600"
        : "text-emerald-600";

  const beginInterview = useCallback(async () => {
    if (isStarting || phaseRef.current !== "setup") return;

    setIsStarting(true);
    setSetupStep("mic");
    setSetupStatus("Requesting microphone access…");
    cancelledRef.current = false;

    try {
      const interviewAudioConstraints: MediaTrackConstraints & {
        voiceIsolation?: boolean;
        googNoiseSuppression?: boolean;
        googEchoCancellation?: boolean;
        googAutoGainControl?: boolean;
        googHighpassFilter?: boolean;
      } = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
        voiceIsolation: true,
        googNoiseSuppression: true,
        googEchoCancellation: true,
        googAutoGainControl: true,
        googHighpassFilter: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: interviewAudioConstraints,
        video: false,
      });

      if (cancelledRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      setMicCaptureEnabled(false);

      setSetupStep("connecting");
      setSetupStatus("Initializing interview session…");

      const storedSessionId = window.localStorage.getItem(sessionTokenKey);
      if (storedSessionId) {
        sessionIdRef.current = storedSessionId;
      }

      const startRes = await fetch("/api/interviews/webrtc/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          sessionIdHint: sessionIdRef.current,
        }),
      });

      if (!startRes.ok) {
        const data = (await startRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Failed to initialize interview session.");
      }

      const startData = (await startRes.json()) as {
        sessionId: string;
        openingPrompt: string;
        systemInstructions: string;
        sessionBlueprint?: {
          questionTarget: number;
          sections: Array<{ name: string; minutes: number; objective: string; questionBankTarget: number }>;
        } | null;
        clientSecret: string;
        voice: string;
        durationMinutes: number;
        sessionStartedAt: string;
        existingTranscript?: InterviewTranscriptEntry[];
        existingReferenceCards?: InterviewReferenceCard[];
        existingEvents?: Array<{ at: string; question: string; answerSummary: string; score: number; feedback: string; improvementTip?: string }>;
      };

      if (cancelledRef.current) return;

      sessionIdRef.current = startData.sessionId;
      sessionTokenRef.current = token;
      window.localStorage.setItem(sessionTokenKey, startData.sessionId);
      transcriptRef.current = startData.existingTranscript || [];
      evaluationEventsRef.current = startData.existingEvents || [];
      referenceCardsRef.current = startData.existingReferenceCards || [];
      finalReportRef.current = null;
      durationWarningShownRef.current = false;
      durationCompleteSignalSentRef.current = false;
      hardStopSignalSentRef.current = false;

      const parsedDuration = Number(startData.durationMinutes);
      const resolvedDurationMs = Number.isFinite(parsedDuration) && parsedDuration > 0
        ? parsedDuration * 60 * 1000
        : 15 * 60 * 1000;
      interviewDurationMsRef.current = resolvedDurationMs;
      const parsedStartedAt = Date.parse(startData.sessionStartedAt);
      const resolvedStartedAt = Number.isFinite(parsedStartedAt)
        ? parsedStartedAt
        : Date.now();
      interviewStartedAtRef.current = resolvedStartedAt;
      setTimingState({
        startedAt: resolvedStartedAt,
        durationMs: resolvedDurationMs,
      });

      if (startData.existingTranscript?.length) {
        setTranscriptItems(buildTimeline(startData.existingTranscript, startData.existingReferenceCards || []));
      }

      setSetupStep("starting");
      setSetupStatus("Connecting to OpenAI Realtime…");

      const ctx = new AudioContext();
      await ctx.resume().catch(() => {});
      micCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      const silentGain = ctx.createGain();
      silentGain.gain.value = 0;
      silentGainRef.current = silentGain;
      source.connect(analyser);
      analyser.connect(silentGain);
      silentGain.connect(ctx.destination);

      const transport = new OpenAIWebRtcInterviewTransport({
        onReady: () => {
          setHasStream(true);
          setMicCaptureEnabled(true);
          toast.success("AI interviewer is ready. Your microphone is now active.");
          handleTransportMessage({
            type: "ready",
            existingTranscript: startData.existingTranscript,
            existingReferenceCards: startData.existingReferenceCards,
          });
        },
        onStatus: (message) => handleTransportMessage({ type: "status", message }),
        onError: (message) => handleTransportMessage({ type: "error", message }),
        onTranscript: (entry) => handleTransportMessage({ type: "transcript", data: entry }),
        onEvaluationEvent: (event) => {
          evaluationEventsRef.current = [...evaluationEventsRef.current, event];
          scheduleSync();
        },
        onFinalReport: (report) => handleTransportMessage({ type: "final_report", data: report }),
        onReferenceCard: (card) => handleTransportMessage({ type: "reference_card", data: card }),
        onInterrupted: () => handleTransportMessage({ type: "ai_interrupted" }),
        onComplete: () => handleTransportMessage({ type: "interview_complete" }),
        onAssistantSpeakingChange: (speaking) => setAiSpeaking(speaking),
        onThinkingChange: (thinking, context) => {
          setAiThinking(thinking);
          if (thinking && context) setAiThinkingText(context);
        },
        // Temporarily mute/unmute mic tracks without changing the UI locked state.
        // This prevents AI voice echo from reaching VAD and being transcribed as
        // fake candidate answers ("get the recent data..." hallucination pattern).
        onMuteRequired: (muted) => {
          streamRef.current?.getAudioTracks().forEach((track) => {
            track.enabled = !muted;
          });
        },
        onRemoteStream: (remoteStream) => {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
            void remoteAudioRef.current.play().catch(() => {
              const playbackCtx = micCtxRef.current;
              if (!playbackCtx || remotePlaybackSourceRef.current) return;

              try {
                const remoteSource = playbackCtx.createMediaStreamSource(remoteStream);
                const remoteGain = playbackCtx.createGain();
                remoteGain.gain.value = 1;
                remoteSource.connect(remoteGain);
                remoteGain.connect(playbackCtx.destination);
                remotePlaybackSourceRef.current = remoteSource;
                remotePlaybackGainRef.current = remoteGain;
              } catch (error) {
                console.error("Failed to attach fallback remote audio playback:", error);
              }
            });
          }
        },
      });

      transportRef.current = transport;
      if (!cancelledRef.current) {
        setPhase("live");
      }

      // Bug 3 fix: add setup timeout — if connect hangs for 30s, fail gracefully
      const connectTimeout = setTimeout(() => {
        if (phaseRef.current === "live" && !transport.isReady()) {
          throw new Error("Connection to AI interviewer timed out. Please try again.");
        }
      }, 30_000);

      try {
        await transport.connect(
          {
            token,
            sessionId: startData.sessionId,
            clientSecret: startData.clientSecret,
            systemInstructions: startData.systemInstructions,
            openingPrompt: startData.openingPrompt,
            sessionBlueprint: startData.sessionBlueprint ?? null,
            voice: startData.voice,
            durationMinutes: startData.durationMinutes,
            sessionStartedAt: startData.sessionStartedAt,
            playbackAudioContext: ctx,
          },
          stream,
        );
      } finally {
        clearTimeout(connectTimeout);
      }
    } catch (error) {
      console.error("Interview setup failed:", error);
      if (!cancelledRef.current) {
        setErrorMsg(error instanceof Error ? error.message : "Failed to start interview.");
        setPhase("error");
      }
    } finally {
      if (!cancelledRef.current) {
        setIsStarting(false);
      }
    }
  }, [handleTransportMessage, isStarting, scheduleSync, sessionTokenKey, setMicCaptureEnabled, token]);

  useEffect(() => {
    const audioElement = remoteAudioRef.current;
    return () => {
      cancelledRef.current = true;
    clearInterviewTiming();
    transportRef.current?.close();
    transportRef.current = null;
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }
      stopMic();
      if (audioElement) {
        audioElement.pause();
        audioElement.srcObject = null;
      }
    };
  }, [clearInterviewTiming, stopMic]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptItems]);

  // ── Error ──────────────────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <div
        className="min-h-screen bg-[#F9F9FB] flex items-center justify-center px-4"
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl text-red-500 font-bold">✕</span>
          </div>
          <h2 className="text-lg font-semibold text-[#252e3d] mb-2">Unable to Start Interview</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">{errorMsg}</p>
          <Link
            href="/mock-interview"
            className="inline-block rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            ← Back to Sessions
          </Link>
        </div>
      </div>
    );
  }

  // ── Setup ──────────────────────────────────────────────────────────────────
  if (phase === "setup") {
    const steps: { key: SetupStep; label: string }[] = [
      { key: "mic", label: "Microphone access" },
      { key: "connecting", label: "Connecting to server" },
      { key: "starting", label: "Starting AI interviewer" },
    ];
    const stepOrder: SetupStep[] = ["mic", "connecting", "starting", "done"];
    const currentIdx = stepOrder.indexOf(setupStep);

    return (
      <div
        className="min-h-screen bg-[#F9F9FB] flex items-center justify-center px-4"
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          {/* Logo / brand */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#5a58ab] flex items-center justify-center">
                <span className="text-white text-xs font-bold">JB</span>
              </div>
              <span className="text-sm font-semibold text-[#252e3d]">JB Recruitment Solutions</span>
            </div>
            <h1 className="text-xl font-bold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>Preparing Your Interview</h1>
            <p className="text-xs text-slate-500 mt-1">Please wait while we set everything up…</p>
          </div>

          {/* Animated blob placeholder */}
          <div className="flex justify-center mb-8">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-[#5a58ab]/10 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="absolute inset-2 rounded-full bg-[#5a58ab]/15 animate-pulse" />
              <div className="absolute inset-4 rounded-full bg-[#5a58ab] flex items-center justify-center text-white font-bold">
                JB
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-6">
            {steps.map(({ key, label }, i) => {
              const stepIdx = stepOrder.indexOf(key);
              const isDone = stepIdx < currentIdx;
              const isActive = stepIdx === currentIdx;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                      isDone
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-600"
                        : isActive
                          ? "bg-[#f0efff] border border-[#5a58ab]/40 text-[#5a58ab]"
                          : "bg-slate-50 border border-slate-200 text-slate-400"
                    }`}
                  >
                    {isDone ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-sm transition-colors ${
                      isDone ? "text-emerald-600 font-medium" : isActive ? "text-[#252e3d] font-semibold" : "text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                  {isActive && (
                    <span className="ml-auto">
                      <span className="inline-block w-4 h-4 border-2 border-[#5a58ab] border-t-transparent rounded-full animate-spin" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Status text */}
          <p className="text-center text-xs text-slate-500 min-h-[18px]">{setupStatus}</p>

          <button
            onClick={() => void beginInterview()}
            disabled={isStarting}
            className="mt-6 w-full rounded-xl bg-[#252e3d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2d3645] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isStarting ? "Starting…" : "Start Interview"}
          </button>
        </div>
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (phase === "results") {
    return (
      <div
        className="min-h-screen bg-[#F9F9FB]"
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        {/* Top bar */}
        <div className="border-b border-slate-200 bg-white px-6 py-4 flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-[#5a58ab] flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-bold">JB</span>
          </div>
          <span className="text-sm font-semibold text-[#252e3d]">JB Recruitment Solutions</span>
          <span className="ml-auto rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs text-emerald-700 font-medium">
            ✓ Session Complete
          </span>
        </div>

        <div className="mx-auto max-w-2xl px-4 py-10">
          {finalReport ? (
            <div className="space-y-5">
              {/* Score + summary card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-xl font-bold text-[#252e3d]">Interview Complete</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Your performance report is ready</p>
                  </div>
                  {finalReport.finalScore != null && (
                    <div className="shrink-0 rounded-xl bg-[#5a58ab] px-5 py-3 text-center">
                      <p className="text-2xl font-extrabold text-white leading-none">{finalReport.finalScore}</p>
                      <p className="text-[10px] text-white/70 font-semibold mt-0.5">/ 10</p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{finalReport.summary}</p>
              </div>

              {/* Strengths */}
              {finalReport.strengths.length > 0 && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {finalReport.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-slate-700 flex gap-2.5">
                        <span className="text-emerald-500 mt-0.5 shrink-0 font-bold">+</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Email notice */}
              <div className="rounded-2xl border border-[#e0e0f0] bg-[#f0efff] p-5 text-center">
                <p className="text-sm font-semibold text-[#5a58ab] mb-1">Your personalised improvement plan is on its way!</p>
                <p className="text-xs text-[#7674b8]">Detailed improvement plan, question-by-question feedback, observed weaknesses, and your full report have been sent to your email.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-pulse">
              {/* Score + summary card skeleton */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="space-y-2">
                    <div className="h-5 w-44 bg-slate-200 rounded-md"></div>
                    <div className="h-3 w-56 bg-slate-200/60 rounded-md"></div>
                  </div>
                  {/* Score block skeleton */}
                  <div className="shrink-0 w-16 h-16 bg-slate-200 rounded-xl"></div>
                </div>
                {/* Summary text skeleton */}
                <div className="space-y-3">
                  <div className="h-3.5 w-full bg-slate-200/70 rounded-md"></div>
                  <div className="h-3.5 w-11/12 bg-slate-200/70 rounded-md"></div>
                  <div className="h-3.5 w-4/5 bg-slate-200/70 rounded-md"></div>
                </div>
              </div>

              {/* Strengths skeleton */}
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                <div className="h-3.5 w-20 bg-emerald-200/60 rounded-md mb-4"></div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-300"></div>
                    <div className="h-3 w-5/6 bg-emerald-200/40 rounded-md"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-300"></div>
                    <div className="h-3 w-3/4 bg-emerald-200/40 rounded-md"></div>
                  </div>
                </div>
              </div>

              {/* Status footer notice */}
              <div className="rounded-2xl border border-[#e0e0f0] bg-white border border-slate-200 p-6 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="inline-block w-6 h-6 border-2 border-[#5a58ab] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm font-semibold text-[#252e3d]">Generating your personalised performance report…</p>
                <p className="text-xs text-slate-400 mt-1">AI is analyzing your session transcript and grading your responses. Please do not close this window.</p>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/mock-interview"
              className="inline-block rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              ← Back to Sessions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Live interview ─────────────────────────────────────────────────────────
  return (
    <div
      className="h-screen bg-[#F9F9FB] text-[#252e3d] flex flex-col overflow-hidden"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white px-5 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#5a58ab] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">JB</span>
          </div>
          <span className="text-xs font-semibold text-slate-700">AI Mock Interview</span>
        </div>
        <div className="flex items-center gap-3">
          {phase === "live" && (
            <div className="hidden sm:flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
              <div className="text-right">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${timerTone}`}>Time Left</p>
                <p className={`text-sm font-extrabold tabular-nums ${timerTone}`}>{formatTimer(remainingSeconds)}</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Elapsed</p>
                <p className="text-sm font-bold text-slate-700 tabular-nums">{formatTimer(elapsedSeconds)}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-red-600 font-semibold uppercase tracking-wider">Live</span>
          </div>
        </div>
      </div>
      {phase === "live" && (
        <div className="h-1.5 w-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${remainingSeconds <= 60 ? "bg-red-500" : remainingSeconds <= 5 * 60 ? "bg-amber-500" : "bg-[#5a58ab]"}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 min-h-0">
        {/* Left: JB circle logo in the center — fixed size, bg white panel, border right */}
        <div className="flex flex-col items-center justify-center px-6 py-6 shrink-0 lg:w-80 lg:border-r lg:border-slate-200 bg-white h-[260px] lg:h-auto shadow-sm">
          <div className="relative w-48 h-48 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#5a58ab]/10 via-[#7b79d4]/5 to-transparent border border-slate-100 shadow-inner">
            {/* Thinking takes priority over Speaking for rings */}
            {aiThinking ? (
              <>
                <div className="absolute inset-0 rounded-full bg-amber-400/10 animate-ping" style={{ animationDuration: "1.4s" }} />
                <div className="absolute inset-4 rounded-full bg-amber-400/15 animate-pulse" />
              </>
            ) : aiSpeaking ? (
              <>
                <div className="absolute inset-0 rounded-full bg-[#5a58ab]/10 animate-ping" style={{ animationDuration: "2s" }} />
                <div className="absolute inset-4 rounded-full bg-[#5a58ab]/20 animate-pulse" />
              </>
            ) : null}
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-[#7b79d4] via-[#5a58ab] to-[#3d3b8a] flex items-center justify-center text-white font-bold text-4xl shadow-lg border-2 border-white/20 transition-transform duration-300 ${aiSpeaking ? "scale-105" : "scale-100"}`}>
              JB
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm font-semibold text-[#252e3d]">AI Interviewer</p>
            <p className="text-xs mt-0.5 font-medium">
              {aiThinking ? (
                <span className="text-amber-500 flex items-center justify-center gap-1">
                  <span className="inline-block w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
                  {aiThinkingText}
                </span>
              ) : aiSpeaking ? (
                <span className="text-[#5a58ab]">Speaking…</span>
              ) : (
                <span className="text-slate-500">Listening…</span>
              )}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-full px-3 py-1">
            <span className={`w-1.5 h-1.5 rounded-full ${micLocked ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
            <span className="text-[10px] text-slate-500 font-medium">
              {micLocked ? "Mic activates when AI intro is ready" : "Your mic is active"}
            </span>
          </div>
          <div className="mt-8">
            <button
              onClick={toggleMicCapture}
              disabled={phase !== "live" || !hasStream}
              className={`mb-3 flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-xs font-semibold transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                micLocked
                  ? "border-slate-300 bg-white text-[#252e3d] hover:bg-slate-50"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
              aria-pressed={!micLocked}
            >
              {micLocked ? <IoMicOff className="w-4 h-4" /> : <IoMic className="w-4 h-4" />}
              {micLocked ? "Turn Mic On" : "Mute Mic"}
            </button>
            <button
              onClick={() => setShowExitConfirm(true)}
              className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition cursor-pointer"
            >
              End Interview Early
            </button>
          </div>
          {phase === "live" && (
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-center shadow-sm sm:hidden">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${timerTone}`}>Time Left</p>
              <p className={`mt-1 text-2xl font-extrabold tabular-nums ${timerTone}`}>{formatTimer(remainingSeconds)}</p>
              <p className="mt-1 text-[11px] text-slate-500">Elapsed {formatTimer(elapsedSeconds)}</p>
            </div>
          )}
        </div>

        {/* Right: transcript + reference cards inline — scrolls internally */}
        <div className="flex-1 flex flex-col min-h-0 p-4 lg:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 shrink-0">Transcript</p>
          <div
            data-lenis-prevent
            className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0 overscroll-contain"
          >
            {transcriptItems.length === 0 && (
              <div className="flex items-center justify-center h-32">
                <p className="text-xs text-slate-400 text-center">
                  The conversation will appear here as the interview progresses.
                </p>
              </div>
            )}
            {transcriptItems.map((item, i) => {
              if (item.kind === "card") {
                return <ReferenceCard key={item.card.id} card={item.card} />;
              }
              return <TranscriptBubble key={i} entry={item.entry} />;
            })}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={handleConfirmExit}
        title="End Interview Early?"
        message="Are you sure you want to end the interview early? The AI will compile your final report based on the completed answers."
        confirmText="End Early"
        cancelText="Cancel"
        danger
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ReferenceCard({ card }: { card: InterviewReferenceCard }) {
  const [expanded, setExpanded] = useState(true);
  const hasStructuredQuestion = Boolean(card.question || (card.options && card.options.length > 0));
  return (
    <div className="rounded-xl border border-[#e0dfff] bg-white overflow-hidden shadow-sm hover:shadow transition-shadow">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#f8f7ff] text-left"
      >
        <span className="text-xs font-semibold text-[#5a58ab]">{card.title}</span>
        <span className="text-[#5a58ab] text-[10px]">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="px-3.5 pb-3.5 pt-2 border-t border-[#e0dfff] max-w-none text-xs text-slate-600 leading-relaxed
          [&_h1]:text-sm [&_h1]:font-bold [&_h1]:text-[#252e3d] [&_h1]:mt-3 [&_h1]:mb-1
          [&_h2]:text-xs [&_h2]:font-bold [&_h2]:text-[#252e3d] [&_h2]:mt-2 [&_h2]:mb-1
          [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-[#5a58ab] [&_h3]:mt-2 [&_h3]:mb-0.5
          [&_strong]:font-semibold [&_strong]:text-[#252e3d]
          [&_em]:italic [&_em]:text-slate-400
          [&_blockquote]:border-l-2 [&_blockquote]:border-[#5a58ab]/40 [&_blockquote]:pl-3 [&_blockquote]:text-slate-500 [&_blockquote]:italic [&_blockquote]:my-1
          [&_hr]:border-slate-100 [&_hr]:my-2
          [&_pre]:bg-slate-50 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-slate-200 [&_pre]:my-1
          [&_code]:font-mono [&_code]:text-[#5a58ab] [&_code]:text-xs [&_code]:bg-[#f8f7ff] [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5
          [&_pre_code]:text-slate-800 [&_pre_code]:bg-transparent [&_pre_code]:p-0
          [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs [&_table]:my-1
          [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-2 [&_th]:py-1 [&_th]:text-[#5a58ab] [&_th]:font-semibold [&_th]:text-left
          [&_td]:border [&_td]:border-slate-100 [&_td]:px-2 [&_td]:py-1 [&_td]:text-slate-600
          [&_p]:mt-1 [&_p]:mb-1 [&_ul]:pl-4 [&_ul]:list-disc [&_ol]:pl-4 [&_ol]:list-decimal [&_li]:my-0.5 [&_a]:text-[#5a58ab] [&_a]:underline">
          {hasStructuredQuestion && (
            <div className="mb-3 rounded-lg border border-[#e0dfff] bg-[#faf9ff] px-3 py-2">
              {card.question && <p className="font-semibold text-[#252e3d]">Question: {card.question}</p>}
              {card.options && card.options.length > 0 && (
                <div className="mt-2 space-y-1">
                  {card.options.map((option, index) => (
                    <div key={`${card.id}-option-${index}`} className="rounded-md bg-white px-2 py-1 border border-slate-100 text-slate-600">
                      <span className="font-semibold text-[#5a58ab]">{String.fromCharCode(65 + index)}.</span>{" "}
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{card.content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

function TranscriptBubble({ entry }: { entry: InterviewTranscriptEntry }) {
  const isAI = entry.role === "interviewer";
  return (
    <div className={`flex gap-2.5 ${isAI ? "" : "flex-row-reverse"}`}>
      <div
        className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${
          isAI ? "bg-[#f0efff] text-[#5a58ab]" : "bg-slate-100 text-slate-500"
        }`}
      >
        {isAI ? "AI" : "YOU"}
      </div>
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isAI
            ? "bg-[#f0efff] border border-[#e0dfff] text-[#252e3d] rounded-tl-sm"
            : "bg-white border border-slate-200 text-[#252e3d] rounded-tr-sm shadow-sm"
        }`}
      >
        {entry.text}
      </div>
    </div>
  );
}

function isEnglishText(text: string): boolean {
  if (!text) return true;
  // Strip standard punctuation/spacing/emojis
  const clean = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, "")
    .trim();
  if (!clean) return true;

  // Check if it's primarily Latin/ASCII script
  const asciiRatio = (clean.match(/[\x00-\x7F]/g) || []).length / clean.length;
  if (asciiRatio < 0.85) return false;

  // Check if it's not a block of repeating consonants or gibberish (e.g. "shshsh", "zzzzz")
  if (/^[^aeiouy]{5,}$/i.test(clean)) return false;

  return true;
}
