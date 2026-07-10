"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import remarkGfm from "remark-gfm";
import type { InterviewFinalReport, InterviewReferenceCard, InterviewTranscriptEntry } from "@/lib/interview/types";
import { OpenAIWebRtcInterviewTransport } from "@/lib/interview/web-rtc-transport";

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
      if (!sessionIdRef.current) return;

      await fetch(`/api/interviews/webrtc/sessions/${sessionIdRef.current}/finalize`, {
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
      }).catch((error) => {
        console.error("Failed to finalize WebRTC session:", error);
      });
    },
    [],
  );

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
        stopMic();
        setPhase("results");
        void finalizeSession("COMPLETED");
        break;
    }
  }, [finalizeSession, scheduleSync, stopMic]);

  const beginInterview = useCallback(async () => {
    if (isStarting || phaseRef.current !== "setup") return;

    setIsStarting(true);
    setSetupStep("mic");
    setSetupStatus("Requesting microphone access…");
    cancelledRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
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
  }, [stopMic]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptItems]);

  // ── Error ──────────────────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <div
        className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4"
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl">✕</span>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Unable to Start Interview</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">{errorMsg}</p>
          <Link
            href="/mock-interviews"
            className="inline-block rounded-xl border border-[#5a58ab]/40 bg-[#5a58ab]/10 px-6 py-2.5 text-sm font-semibold text-[#a09fe0] hover:bg-[#5a58ab]/20 transition"
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
        className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4"
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        <div className="w-full max-w-sm">
          {/* Logo / brand */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#5a58ab] flex items-center justify-center">
                <span className="text-white text-xs font-bold">JB</span>
              </div>
              <span className="text-sm font-semibold text-gray-300">JB Recruitment Solutions</span>
            </div>
            <h1 className="text-xl font-bold text-white">Preparing Your Interview</h1>
            <p className="text-xs text-gray-500 mt-1">Please wait while we set everything up…</p>
          </div>

          {/* Animated blob placeholder */}
          <div className="flex justify-center mb-8">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-[#5a58ab]/20 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="absolute inset-2 rounded-full bg-[#5a58ab]/30 animate-pulse" />
              <div className="absolute inset-4 rounded-full bg-[#5a58ab]/50" />
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
                        ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                        : isActive
                          ? "bg-[#5a58ab]/20 border border-[#5a58ab]/60 text-[#a09fe0]"
                          : "bg-white/5 border border-white/10 text-gray-600"
                    }`}
                  >
                    {isDone ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-sm transition-colors ${
                      isDone ? "text-emerald-400" : isActive ? "text-gray-200" : "text-gray-600"
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
          <p className="text-center text-xs text-gray-500 min-h-[18px]">{setupStatus}</p>

          <button
            onClick={() => void beginInterview()}
            disabled={isStarting}
            className="mt-6 w-full rounded-xl bg-[#5a58ab] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4a49a0] disabled:cursor-not-allowed disabled:opacity-70"
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
      className="h-screen bg-[#0d1117] text-white flex flex-col overflow-hidden"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      {/* Top bar */}
      <div className="border-b border-white/5 px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#5a58ab] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">JB</span>
          </div>
          <span className="text-xs font-semibold text-gray-400">AI Interview</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 min-h-0">
        {/* Left: blob — fixed size, never grows */}
        <div className="flex flex-col items-center justify-center px-6 py-6 shrink-0 lg:w-80 lg:border-r lg:border-white/5 h-[260px] lg:h-auto">
          <canvas
            ref={canvasRef}
            width={220}
            height={220}
            className="rounded-full"
            style={{ background: "radial-gradient(circle at 40% 35%, #1a1a2e 0%, #0d0d1a 100%)" }}
          />
          <div className="mt-4 text-center">
            <p className="text-sm font-semibold text-white">AI Interviewer</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {aiSpeaking ? (
                <span className="text-[#8b89e6]">Speaking…</span>
              ) : (
                "Listening…"
              )}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5a58ab] animate-pulse" />
            <span className="text-xs text-gray-600">Your microphone is active</span>
          </div>
          <div className="mt-8">
            <button
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to end the interview early? The AI will compile your final report based on the completed answers.",
                  )
                ) {
                  stopMic();
                  setAiSpeaking(false);
                  transportRef.current?.endInterview();
                  setPhase("results");
                }
              }}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition cursor-pointer"
            >
              End Interview Early
            </button>
          </div>
        </div>

        {/* Right: transcript + reference cards inline — scrolls internally */}
        <div className="flex-1 flex flex-col min-h-0 p-4 lg:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3 shrink-0">Transcript</p>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
            {transcriptItems.length === 0 && (
              <div className="flex items-center justify-center h-32">
                <p className="text-xs text-gray-600 text-center">
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
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ReferenceCard({ card }: { card: InterviewReferenceCard }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="rounded-xl border border-[#5a58ab]/30 bg-[#5a58ab]/8 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-left"
      >
        <span className="text-xs font-semibold text-[#a09fe0]">{card.title}</span>
        <span className="text-[#5a58ab] text-xs">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="px-3 pb-3 border-t border-[#5a58ab]/20 max-w-none mt-2 text-xs text-gray-300
          [&_h1]:text-sm [&_h1]:font-bold [&_h1]:text-[#c4c2f0] [&_h1]:mt-3 [&_h1]:mb-1
          [&_h2]:text-xs [&_h2]:font-bold [&_h2]:text-[#c4c2f0] [&_h2]:mt-2 [&_h2]:mb-1
          [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-[#a09fe0] [&_h3]:mt-2 [&_h3]:mb-0.5
          [&_strong]:font-semibold [&_strong]:text-gray-100
          [&_em]:italic [&_em]:text-gray-400
          [&_blockquote]:border-l-2 [&_blockquote]:border-[#5a58ab]/50 [&_blockquote]:pl-3 [&_blockquote]:text-gray-400 [&_blockquote]:italic [&_blockquote]:my-1
          [&_hr]:border-[#5a58ab]/20 [&_hr]:my-2
          [&_pre]:bg-[#0d1117] [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-[#5a58ab]/20 [&_pre]:my-1
          [&_code]:font-mono [&_code]:text-[#a09fe0] [&_code]:text-xs [&_code]:bg-[#1a1a2e] [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5
          [&_pre_code]:text-gray-200 [&_pre_code]:bg-transparent [&_pre_code]:p-0
          [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs [&_table]:my-1
          [&_th]:border [&_th]:border-[#5a58ab]/30 [&_th]:bg-[#5a58ab]/15 [&_th]:px-2 [&_th]:py-1 [&_th]:text-[#a09fe0] [&_th]:font-semibold [&_th]:text-left
          [&_td]:border [&_td]:border-[#5a58ab]/20 [&_td]:px-2 [&_td]:py-1 [&_td]:text-gray-300
          [&_p]:mt-1 [&_p]:mb-1 [&_ul]:pl-4 [&_ul]:list-disc [&_ol]:pl-4 [&_ol]:list-decimal [&_li]:my-0.5 [&_a]:text-[#a09fe0] [&_a]:underline">
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
        className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${
          isAI ? "bg-[#5a58ab]/30 text-[#a09fe0]" : "bg-white/10 text-gray-300"
        }`}
      >
        {isAI ? "AI" : "You"}
      </div>
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isAI
            ? "bg-[#5a58ab]/15 border border-[#5a58ab]/20 text-gray-200 rounded-tl-sm"
            : "bg-white/8 border border-white/10 text-gray-100 rounded-tr-sm"
        }`}
      >
        {entry.text}
      </div>
    </div>
  );
}
