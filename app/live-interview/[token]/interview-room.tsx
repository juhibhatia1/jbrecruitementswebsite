"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { InterviewFinalReport, InterviewTranscriptEntry } from "@/lib/interview/types";

type Phase = "setup" | "live" | "results" | "error";
type SetupStep = "mic" | "connecting" | "starting" | "done";

type ServerMessage =
  | { type: "status"; message: string }
  | { type: "ready" }
  | { type: "error"; message: string }
  | { type: "transcript"; data: InterviewTranscriptEntry }
  | { type: "backend_event"; data: { at: string; question: string; score: number; feedback: string } }
  | { type: "ai_audio_chunk"; data: string; mimeType: string }
  | { type: "final_report"; data: InterviewFinalReport }
  | { type: "interview_complete" };

// ── Audio helpers ────────────────────────────────────────────────────────────

function downsampleTo16k(input: Float32Array, fromRate: number): Float32Array {
  if (fromRate === 16000) return input;
  const ratio = fromRate / 16000;
  const outputLength = Math.floor(input.length / ratio);
  const output = new Float32Array(outputLength);
  for (let i = 0; i < outputLength; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.floor((i + 1) * ratio);
    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j] ?? 0;
    output[i] = sum / (end - start);
  }
  return output;
}

function floatTo16BitPcm(input: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i] ?? 0));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i] ?? 0);
  return btoa(binary);
}

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function parsePcmRate(mimeType: string): number {
  const match = /rate=(\d+)/.exec(mimeType);
  return match ? parseInt(match[1], 10) : 24000;
}

function pcmBytesToAudioBuffer(ctx: AudioContext, bytes: Uint8Array, sampleRate: number): AudioBuffer {
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
  const [transcript, setTranscript] = useState<InterviewTranscriptEntry[]>([]);
  const [finalReport, setFinalReport] = useState<InterviewFinalReport | null>(null);
  const [aiSpeaking, setAiSpeaking] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const micCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const playCtxRef = useRef<AudioContext | null>(null);
  const playbackCursorRef = useRef(0);
  const aiSpeakingUntilRef = useRef(0);

  const phaseRef = useRef<Phase>("setup");
  phaseRef.current = phase;

  const sendJson = useCallback((payload: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

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
        const speaking = Date.now() < aiSpeakingUntilRef.current;
        setAiSpeaking(speaking);
        drawBlob(canvas, micLevel, speaking, Date.now() - startTime);
      }
      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase]);

  // ── Start mic from already-acquired stream ─────────────────────────────────
  const activateMic = useCallback(
    async (stream: MediaStream) => {
      const ctx = new AudioContext();
      micCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(analyser);
      analyser.connect(processor);
      processor.connect(ctx.destination);

      processor.onaudioprocess = (e) => {
        // Prevent echo feedback loops by not sending mic input while AI is speaking
        if (Date.now() < aiSpeakingUntilRef.current) {
          return;
        }
        const input = e.inputBuffer.getChannelData(0);
        const downsampled = downsampleTo16k(input, ctx.sampleRate);
        const pcm = floatTo16BitPcm(downsampled);
        const b64 = arrayBufferToBase64(pcm);
        sendJson({ type: "audio_chunk", data: b64 });
      };
    },
    [sendJson],
  );

  const stopMic = useCallback(() => {
    processorRef.current?.disconnect();
    analyserRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    void micCtxRef.current?.close();
    processorRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    micCtxRef.current = null;
  }, []);

  // ── AI audio playback ──────────────────────────────────────────────────────
  const playAiAudio = useCallback((b64: string, mimeType: string) => {
    if (!playCtxRef.current) playCtxRef.current = new AudioContext();
    const ctx = playCtxRef.current;
    if (ctx.state === "suspended") void ctx.resume();

    const bytes = base64ToUint8Array(b64);
    const sampleRate = parsePcmRate(mimeType);
    const buffer = pcmBytesToAudioBuffer(ctx, bytes, sampleRate);
    const durationMs = buffer.duration * 1000;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const startAt = Math.max(ctx.currentTime, playbackCursorRef.current);
    source.start(startAt);
    playbackCursorRef.current = startAt + buffer.duration;
    aiSpeakingUntilRef.current = Date.now() + Math.max(250, durationMs);
  }, []);

  // ── Main setup + WS effect ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let ws: WebSocket | null = null;
    let lastError = "";

    async function setup() {
      // Step 1: Microphone permission
      setSetupStep("mic");
      setSetupStatus("Requesting microphone access…");

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
      } catch {
        if (!cancelled) {
          setErrorMsg(
            "Microphone access is required for the interview. Please allow microphone access in your browser and reload.",
          );
          setPhase("error");
        }
        return;
      }

      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;

      // Step 2: WebSocket connection
      setSetupStep("connecting");
      setSetupStatus("Connecting to interview server…");

      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      ws = new WebSocket(`${proto}//${window.location.host}/ws/interview`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        ws!.send(JSON.stringify({ type: "auth", token }));
        setSetupStep("starting");
        setSetupStatus("Authenticating and starting AI interviewer…");
      };

      ws.onmessage = async (ev) => {
        if (cancelled) return;
        let msg: ServerMessage;
        try {
          msg = JSON.parse(ev.data as string) as ServerMessage;
        } catch {
          return;
        }

        switch (msg.type) {
          case "status":
            if (phaseRef.current !== "live") setSetupStatus(msg.message);
            break;

          case "error":
            // During setup, errors can be transient (Gemini model fallback).
            // Treat as status update — only go to error if WS closes without ready.
            lastError = msg.message;
            if (phaseRef.current !== "live") {
              setSetupStatus(`Retrying… (${msg.message.slice(0, 60)})`);
            }
            break;

          case "ready":
            if (cancelled) return;
            setSetupStep("done");
            setSetupStatus("Interview starting…");
            if (streamRef.current) {
              await activateMic(streamRef.current);
            }
            setPhase("live");
            break;

          case "transcript":
            setTranscript((prev) => [...prev, msg.data]);
            break;

          case "ai_audio_chunk":
            playAiAudio(msg.data, msg.mimeType);
            break;

          case "final_report":
            setFinalReport(msg.data);
            break;

          case "interview_complete":
            stopMic();
            sendJson({ type: "end_interview" });
            setPhase("results");
            break;
        }
      };

      ws.onerror = () => {
        if (cancelled) return;
        if (phaseRef.current !== "live" && phaseRef.current !== "results") {
          setErrorMsg(lastError || "Connection error. Please check your internet and try again.");
          setPhase("error");
        }
      };

      ws.onclose = () => {
        if (cancelled) return;
        if (phaseRef.current === "setup") {
          setErrorMsg(lastError || "Connection closed before interview could start. Please try again.");
          setPhase("error");
        }
      };
    }

    void setup();

    return () => {
      cancelled = true;
      ws?.close();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      stopMic();
      void playCtxRef.current?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

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
          <a
            href="/mock-interviews"
            className="inline-block rounded-xl border border-[#5a58ab]/40 bg-[#5a58ab]/10 px-6 py-2.5 text-sm font-semibold text-[#a09fe0] hover:bg-[#5a58ab]/20 transition"
          >
            ← Back to Sessions
          </a>
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

              {/* Areas to improve */}
              {finalReport.improvements.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-3">Areas to Improve</h3>
                  <ul className="space-y-2">
                    {finalReport.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-slate-700 flex gap-2.5">
                        <span className="text-amber-500 mt-0.5 shrink-0 font-bold">△</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Email notice */}
              <div className="rounded-2xl border border-[#e0e0f0] bg-[#f0efff] p-4 text-center">
                <p className="text-sm text-[#5a58ab] font-medium">Full report with detailed feedback has been emailed to you.</p>
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
            <a
              href="/mock-interviews"
              className="inline-block rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              ← Back to Sessions
            </a>
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
        </div>

        {/* Right: transcript — scrolls internally */}
        <div className="flex-1 flex flex-col min-h-0 p-4 lg:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3 shrink-0">Transcript</p>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
            {transcript.length === 0 && (
              <div className="flex items-center justify-center h-32">
                <p className="text-xs text-gray-600 text-center">
                  The conversation will appear here as the interview progresses.
                </p>
              </div>
            )}
            {transcript.map((entry, i) => (
              <TranscriptBubble key={i} entry={entry} />
            ))}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

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
