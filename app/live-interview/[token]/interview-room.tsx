"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import type { InterviewFinalReport, InterviewReferenceCard, InterviewTranscriptEntry } from "@/lib/interview/types";
import { OpenAIWebRtcInterviewTransport } from "@/lib/interview/web-rtc-transport";
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

// ── Blob renderer ────────────────────────────────────────────────────────────

function drawBlob(canvas: HTMLCanvasElement, micLevel: number, aiSpeaking: boolean, t: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;

  // Breathing base pulse (always animates)
  const breathe = (Math.sin(t / 1400) * 0.5 + 0.5) * 0.12;
  const dynamicLevel = Math.max(micLevel * 2.8, aiSpeaking ? 0.42 : breathe);
  const radius = 58 + dynamicLevel * 52;

  ctx.clearRect(0, 0, w, h);

  // Outermost ring
  const outerAlpha = aiSpeaking ? 0.2 : 0.08 + breathe;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 22, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(90,88,171,${outerAlpha})`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Middle ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 10, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(90,88,171,${outerAlpha * 2})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Glow shadow
  ctx.save();
  ctx.shadowColor = "#5a58ab";
  ctx.shadowBlur = aiSpeaking ? 36 : 18 + breathe * 40;

  // Main blob
  const grad = ctx.createRadialGradient(cx - radius * 0.15, cy - radius * 0.15, 0, cx, cy, radius);
  if (aiSpeaking) {
    grad.addColorStop(0, "#a8a6f8");
    grad.addColorStop(0.5, "#7b79d4");
    grad.addColorStop(1, "#4a48a0");
  } else {
    grad.addColorStop(0, "#7b79d4");
    grad.addColorStop(0.5, "#5a58ab");
    grad.addColorStop(1, "#3d3b8a");
  }

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  // Specular highlight
  const highlightGrad = ctx.createRadialGradient(
    cx - radius * 0.3,
    cy - radius * 0.3,
    0,
    cx - radius * 0.3,
    cy - radius * 0.3,
    radius * 0.6,
  );
  highlightGrad.addColorStop(0, "rgba(255,255,255,0.12)");
  highlightGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = highlightGrad;
  ctx.fill();
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function InterviewRoom({ token }: { token: string }) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [setupStep, setSetupStep] = useState<SetupStep>("mic");
  const [setupStatus, setSetupStatus] = useState("Requesting microphone access…");
  const [errorMsg, setErrorMsg] = useState("");
  const [transcriptItems, setTranscriptItems] = useState<TranscriptItem[]>([]);
  const [finalReport, setFinalReport] = useState<InterviewFinalReport | null>(null);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

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
  const targetSignalSentRef = useRef(false);
  const hardStopSignalSentRef = useRef(false);
  const interviewStartedAtRef = useRef<number | null>(null);
  const interviewDurationMsRef = useRef(15 * 60 * 1000);

  const phaseRef = useRef<Phase>("setup");
  const sessionTokenKey = `jb-webrtc-session:${token}`;

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // ── Blob animation (runs when live) ───────────────────────────────────────
  useEffect(() => {
    if (phase !== "live") return;

    let running = true;
    const startTime = Date.now();

    const draw = () => {
      if (!running) return;
      const canvas = canvasRef.current;
      if (canvas) {
        let micLevel = 0;
        if (analyserRef.current) {
          const buf = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteTimeDomainData(buf);
          let rms = 0;
          for (let i = 0; i < buf.length; i++) {
            const norm = ((buf[i] ?? 128) - 128) / 128;
            rms += norm * norm;
          }
          micLevel = Math.sqrt(rms / buf.length);
        }
        drawBlob(canvas, micLevel, aiSpeaking, Date.now() - startTime);
      }
      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase, aiSpeaking]);

  const stopMic = useCallback(() => {
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

  const handleConfirmExit = useCallback(async () => {
    clearInterviewTiming();
    stopMic();
    setAiSpeaking(false);
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
    const hardStopAt = targetAt + 4 * 60_000;

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
        if (phaseRef.current !== "live" || targetSignalSentRef.current) return;
        targetSignalSentRef.current = true;
        transportRef.current?.sendOrchestrationMessage(
          "TIME_SIGNAL:TARGET_REACHED. The scheduled interview duration is now reached. Do not interrupt the candidate mid-answer. Complete the current section and any remaining mandatory objectives naturally, then close professionally.",
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
          "TIME_SIGNAL:HARD_STOP_REACHED. You are now at the maximum grace threshold (+4 minutes). Do not start new topics. Let the candidate finish the current answer, ask only essential final clarifications, deliver a professional closing, and call finalize_interview_report now.",
        );
      },
    );
  }, [clearInterviewTiming]);

  const handleTransportMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case "status":
        if (phaseRef.current !== "live") setSetupStatus(msg.message);
        break;

      case "error":
        setErrorMsg(msg.message);
        setAiSpeaking(false);
        if (phaseRef.current !== "live" && phaseRef.current !== "results") {
          setPhase("error");
        }
        break;

      case "ready":
        if (msg.existingTranscript?.length) {
          transcriptRef.current = msg.existingTranscript;
          referenceCardsRef.current = msg.existingReferenceCards || [];
          setTranscriptItems([
            ...msg.existingTranscript.map((entry) => ({ kind: "speech" as const, entry })),
            ...(msg.existingReferenceCards || []).map((card) => ({ kind: "card" as const, card })),
          ]);
        }
        setSetupStep("done");
        setSetupStatus("Interview starting…");
        setAiSpeaking(false);
        setPhase("live");
        armInterviewTiming();
        break;

      case "transcript":
        transcriptRef.current = [...transcriptRef.current, msg.data];
        if (msg.data.role === "interviewer" && pendingCardsRef.current.length > 0) {
          const pending = pendingCardsRef.current.splice(0);
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

      case "final_report":
        finalReportRef.current = msg.data;
        setFinalReport(msg.data);
        scheduleSync();
        break;

      case "reference_card":
        referenceCardsRef.current = [...referenceCardsRef.current, msg.data];
        pendingCardsRef.current.push(msg.data);
        scheduleSync();
        break;

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
      targetSignalSentRef.current = false;
      hardStopSignalSentRef.current = false;

      const parsedDuration = Number(startData.durationMinutes);
      interviewDurationMsRef.current = Number.isFinite(parsedDuration) && parsedDuration > 0
        ? parsedDuration * 60 * 1000
        : 15 * 60 * 1000;
      const parsedStartedAt = Date.parse(startData.sessionStartedAt);
      interviewStartedAtRef.current = Number.isFinite(parsedStartedAt)
        ? parsedStartedAt
        : Date.now();

      if (startData.existingTranscript?.length) {
        setTranscriptItems([
          ...startData.existingTranscript.map((entry) => ({ kind: "speech" as const, entry })),
          ...(startData.existingReferenceCards || []).map((card) => ({ kind: "card" as const, card })),
        ]);
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
      await transport.connect(
        {
          token,
          sessionId: startData.sessionId,
          clientSecret: startData.clientSecret,
          systemInstructions: startData.systemInstructions,
          openingPrompt: startData.openingPrompt,
          voice: startData.voice,
          playbackAudioContext: ctx,
        },
        stream,
      );
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
  }, [handleTransportMessage, isStarting, scheduleSync, sessionTokenKey, token]);

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
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
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
            href="/mock-interviews"
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
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="inline-block w-7 h-7 border-2 border-[#5a58ab] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-semibold text-slate-600 mb-1">Generating your report…</p>
              <p className="text-xs text-slate-400">This may take a moment. Please stay on the page.</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/mock-interviews"
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
        <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-red-600 font-semibold uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 min-h-0">
        {/* Left: blob — fixed size, bg white panel, border right */}
        <div className="flex flex-col items-center justify-center px-6 py-6 shrink-0 lg:w-80 lg:border-r lg:border-slate-200 bg-white h-[260px] lg:h-auto shadow-sm">
          <canvas
            ref={canvasRef}
            width={220}
            height={220}
            className="rounded-full"
            style={{ background: "radial-gradient(circle at 40% 35%, #ffffff 0%, #f0efff 100%)", border: "1px solid #e2e8f0" }}
          />
          <div className="mt-4 text-center">
            <p className="text-sm font-semibold text-[#252e3d]">AI Interviewer</p>
            <p className="text-xs mt-0.5 font-medium">
              {aiSpeaking ? (
                <span className="text-[#5a58ab]">Speaking…</span>
              ) : (
                <span className="text-slate-500">Listening…</span>
              )}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-slate-500 font-medium">Your mic is active</span>
          </div>
          <div className="mt-8">
            <button
              onClick={() => setShowExitConfirm(true)}
              className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition cursor-pointer"
            >
              End Interview Early
            </button>
          </div>
        </div>

        {/* Right: transcript + reference cards inline — scrolls internally */}
        <div className="flex-1 flex flex-col min-h-0 p-4 lg:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 shrink-0">Transcript</p>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
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
