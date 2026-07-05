"use client";

/**
 * DEV ONLY — Test page for AI interview providers.
 * Connects to /ws/interview-dev (no token auth, no DB writes).
 * Remove or protect before production deployment.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { InterviewFinalReport, InterviewTranscriptEntry } from "@/lib/interview/types";

// ── Audio helpers (same as interview-room.tsx) ──────────────────────────────

function downsampleTo(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
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

// ── Types ───────────────────────────────────────────────────────────────────

type Phase = "config" | "connecting" | "live" | "done" | "error";

type Config = {
  provider: "gemini-live" | "openai-realtime";
  model: string;
  voice: string;
  role: string;
  candidateName: string;
  templateId: string;
};

type Template = {
  id: string;
  jobRole: string;
  ownerRole: "ADMIN" | "EMPLOYEE";
  interviewDescription: string | null;
};

type VoiceOption = { value: string; label: string; badge?: string; note: string };
const OPENAI_VOICES: VoiceOption[] = [
  { value: "cedar",   label: "Cedar",   badge: "Recommended",  note: "Warm · Natural · Best quality" },
  { value: "marin",   label: "Marin",   badge: "Recommended",  note: "Clear · Neutral · Best quality" },
  { value: "alloy",   label: "Alloy",   note: "Neutral · Versatile · Gender-neutral" },
  { value: "ash",     label: "Ash",     note: "Warm · Conversational · Approachable" },
  { value: "ballad",  label: "Ballad",  note: "Expressive · Emotive · Storytelling tone" },
  { value: "coral",   label: "Coral",   note: "Bright · Engaging · Upbeat" },
  { value: "echo",    label: "Echo",    note: "Deep · Resonant · Authoritative" },
  { value: "sage",    label: "Sage",    note: "Calm · Measured · Thoughtful" },
  { value: "shimmer", label: "Shimmer", note: "Optimistic · Bright · Energetic" },
  { value: "verse",   label: "Verse",   note: "Dynamic · Expressive · Fluid" },
];

type ModelOption = {
  value: string;
  label: string;
  badge: string;
  badgeColor: string;
  note: string;
};

const MODEL_OPTIONS: Record<Config["provider"], ModelOption[]> = {
  "gemini-live": [
    {
      value: "gemini-3.1-flash-live-preview",
      label: "Gemini 3.1 Flash Live Preview",
      badge: "Recommended",
      badgeColor: "bg-green-500/20 text-green-400 border-green-500/30",
      note: "Most advanced · Best quality · Low latency · Native audio",
    },
    {
      value: "gemini-live-2.5-flash-native-audio",
      label: "Gemini 2.5 Flash Native Audio",
      badge: "Stable",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      note: "Stable GA · Affective dialog · Barge-in support",
    },
    {
      value: "gemini-1.5-flash-002",
      label: "Gemini 1.5 Flash 002",
      badge: "Legacy",
      badgeColor: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      note: "Legacy stable · Lower cost · TTS pipeline · Fallback only",
    },
  ],
  "openai-realtime": [
    {
      value: "gpt-realtime-2",
      label: "GPT Realtime 2",
      badge: "GA · Recommended",
      badgeColor: "bg-green-500/20 text-green-400 border-green-500/30",
      note: "Voice agent with reasoning · Low latency · Tool use",
    },
    {
      value: "gpt-4o-realtime-preview",
      label: "GPT-4o Realtime Preview",
      badge: "Legacy Beta",
      badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      note: "Older beta model · May still work on paid accounts",
    },
    {
      value: "gpt-4o-mini-realtime-preview",
      label: "GPT-4o Mini Realtime Preview",
      badge: "Legacy · Cheaper",
      badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      note: "Lower cost beta · Less capable · Fastest latency",
    },
  ],
};

const PROVIDER_DEFAULTS: Record<Config["provider"], { model: string; voice: string }> = {
  "gemini-live": { model: MODEL_OPTIONS["gemini-live"][0].value, voice: "" },
  "openai-realtime": { model: MODEL_OPTIONS["openai-realtime"][0].value, voice: "cedar" },
};

// ── Component ────────────────────────────────────────────────────────────────

export default function DevInterviewTestPage() {
  const [phase, setPhase] = useState<Phase>("config");
  const [config, setConfig] = useState<Config>({
    provider: "gemini-live",
    model: PROVIDER_DEFAULTS["gemini-live"].model,
    voice: PROVIDER_DEFAULTS["gemini-live"].voice,
    role: "Software Engineer",
    candidateName: "Test Candidate",
    templateId: "",
  });
  const [templates, setTemplates] = useState<Template[]>([]);

  const [statusLog, setStatusLog] = useState<string[]>([]);

  // Fetch available templates on mount
  useEffect(() => {
    fetch("/api/dev/templates")
      .then((r) => r.json())
      .then((data) => setTemplates(data.templates || []))
      .catch(() => {});
  }, []);
  const [transcript, setTranscript] = useState<InterviewTranscriptEntry[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [finalReport, setFinalReport] = useState<InterviewFinalReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextAudioAt = useRef(0);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  const log = useCallback((msg: string) => {
    setStatusLog((prev) => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close();
      processorRef.current?.disconnect();
      sourceRef.current?.disconnect();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
    };
  }, []);

  const playAudioChunk = useCallback((b64: string, mimeType: string) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const bytes = base64ToUint8Array(b64);
    const sampleRate = parsePcmRate(mimeType);
    const audioBuffer = pcmBytesToAudioBuffer(ctx, bytes, sampleRate);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    const now = ctx.currentTime;
    const startAt = Math.max(now, nextAudioAt.current);
    source.start(startAt);
    nextAudioAt.current = startAt + audioBuffer.duration;
  }, []);

  const handleProviderChange = (provider: Config["provider"]) => {
    const defaults = PROVIDER_DEFAULTS[provider];
    setConfig((c) => ({ ...c, provider, model: defaults.model, voice: defaults.voice }));
  };

  const startInterview = async () => {
    setPhase("connecting");
    setStatusLog([]);
    setTranscript([]);
    setEvents([]);
    setFinalReport(null);
    setErrorMsg("");

    // Request mic
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch (err: any) {
      setErrorMsg(`Mic access denied: ${err.message}`);
      setPhase("error");
      return;
    }

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    nextAudioAt.current = 0;

    // Build WS URL
    const params = new URLSearchParams({
      provider: config.provider,
      model: config.model,
      role: config.role,
      name: config.candidateName,
    });
    if (config.provider === "openai-realtime" && config.voice) {
      params.set("voice", config.voice);
    }
    if (config.templateId) {
      params.set("templateId", config.templateId);
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/interview-dev?${params}`);
    wsRef.current = ws;

    ws.onopen = () => log("WebSocket connected");

    ws.onmessage = (event) => {
      let msg: any;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      if (msg.type === "status") {
        log(msg.message);
      } else if (msg.type === "ready") {
        log("Provider ready — starting mic capture");
        setPhase("live");
        startMic(stream, ctx, ws, (msg.audioInputRate as number) || 16000);
      } else if (msg.type === "error") {
        log(`ERROR: ${msg.message}`);
        setErrorMsg(msg.message);
        setPhase("error");
        stopMic();
        ws.close();
      } else if (msg.type === "transcript") {
        setTranscript((prev) => [...prev, msg.data as InterviewTranscriptEntry]);
      } else if (msg.type === "backend_event") {
        setEvents((prev) => [...prev, msg.data]);
      } else if (msg.type === "ai_audio_chunk") {
        playAudioChunk(msg.data, msg.mimeType);
      } else if (msg.type === "final_report") {
        setFinalReport(msg.data as InterviewFinalReport);
      } else if (msg.type === "interview_complete") {
        log("Interview complete");
        setPhase("done");
        stopMic();
      }
    };

    ws.onerror = (e) => {
      log("WebSocket error");
      setErrorMsg("WebSocket connection error");
      setPhase("error");
    };

    ws.onclose = (e) => {
      log(`WebSocket closed (${e.code})`);
      stopMic();
      if (phase !== "done") setPhase("done");
    };
  };

  const startMic = (
    stream: MediaStream,
    ctx: AudioContext,
    ws: WebSocket,
    targetRate: number,
  ) => {
    const source = ctx.createMediaStreamSource(stream);
    sourceRef.current = source;
    const bufferSize = 4096;
    // ScriptProcessorNode is deprecated but widely supported; AudioWorklet is the modern alternative
    const processor = ctx.createScriptProcessor(bufferSize, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      const raw = e.inputBuffer.getChannelData(0);
      const down = downsampleTo(raw, ctx.sampleRate, targetRate);
      const pcm = floatTo16BitPcm(down);
      const b64 = arrayBufferToBase64(pcm);
      ws.send(JSON.stringify({ type: "audio_chunk", data: b64 }));
    };

    source.connect(processor);
    processor.connect(ctx.destination);
  };

  const stopMic = () => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    processorRef.current = null;
    sourceRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const endInterview = () => {
    wsRef.current?.send(JSON.stringify({ type: "end_interview" }));
    log("End interview requested");
  };

  const disconnect = () => {
    stopMic();
    wsRef.current?.close();
    wsRef.current = null;
    setPhase("config");
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 font-mono">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 border border-yellow-500/40 bg-yellow-500/5 rounded-lg p-3">
          <p className="text-yellow-400 text-sm font-semibold">
            DEV ONLY — Interview Provider Test Page
          </p>
          <p className="text-yellow-500/70 text-xs mt-1">
            Connects to /ws/interview-dev · No token auth · No DB writes · Remove before production
          </p>
        </div>

        {/* Config form */}
        {phase === "config" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Configure Test Interview</h2>

            {/* Provider */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Provider</label>
              <div className="flex gap-3">
                {(["gemini-live", "openai-realtime"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => handleProviderChange(p)}
                    className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                      config.provider === p
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {p === "gemini-live" ? "Gemini Live" : "OpenAI Realtime"}
                  </button>
                ))}
              </div>
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Model</label>
              <div className="space-y-2">
                {MODEL_OPTIONS[config.provider].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setConfig((c) => ({ ...c, model: opt.value }))}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      config.model === opt.value
                        ? "bg-indigo-600/20 border-indigo-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">{opt.label}</span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded border font-medium ${opt.badgeColor}`}
                      >
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{opt.note}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice (OpenAI only) */}
            {config.provider === "openai-realtime" && (
              <div>
                <label className="block text-xs text-gray-400 mb-2">Voice</label>
                <div className="grid grid-cols-2 gap-2">
                  {OPENAI_VOICES.map((v) => (
                    <button
                      key={v.value}
                      onClick={() => setConfig((c) => ({ ...c, voice: v.value }))}
                      className={`text-left px-3 py-2 rounded-lg border transition-colors ${
                        config.voice === v.value
                          ? "bg-purple-600/20 border-purple-500 text-white"
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-medium">{v.label}</span>
                        {v.badge && (
                          <span className="text-xs px-1.5 py-0 rounded border bg-green-500/20 text-green-400 border-green-500/30 font-medium">
                            {v.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{v.note}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Template */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Interview Template</label>
              {templates.length === 0 ? (
                <p className="text-xs text-gray-600 italic">No active templates found — using generic instructions.</p>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => setConfig((c) => ({ ...c, templateId: "", role: "Software Engineer" }))}
                    className={`w-full text-left px-4 py-2.5 rounded-lg border transition-colors ${
                      !config.templateId
                        ? "bg-indigo-600/20 border-indigo-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    <p className="text-xs font-medium">None — Use generic instructions</p>
                    <p className="text-xs text-gray-500 mt-0.5">Generic 5-question technical + behavioral interview</p>
                  </button>
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setConfig((c) => ({ ...c, templateId: t.id, role: t.jobRole }))}
                      className={`w-full text-left px-4 py-2.5 rounded-lg border transition-colors ${
                        config.templateId === t.id
                          ? "bg-indigo-600/20 border-indigo-500 text-white"
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium">{t.jobRole}</span>
                        <span className={`text-xs px-1.5 py-0 rounded border font-medium ${
                          t.ownerRole === "ADMIN"
                            ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }`}>
                          {t.ownerRole}
                        </span>
                      </div>
                      {t.interviewDescription && (
                        <p className="text-xs text-gray-500 truncate">{t.interviewDescription}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Job Role
                {config.templateId && (
                  <span className="ml-2 text-indigo-400">(from template)</span>
                )}
              </label>
              <input
                type="text"
                value={config.role}
                onChange={(e) => setConfig((c) => ({ ...c, role: e.target.value }))}
                disabled={!!config.templateId}
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 ${
                  config.templateId
                    ? "border-gray-700 text-gray-500 cursor-not-allowed"
                    : "border-gray-700 text-white"
                }`}
              />
            </div>

            {/* Candidate Name */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Candidate Name</label>
              <input
                type="text"
                value={config.candidateName}
                onChange={(e) => setConfig((c) => ({ ...c, candidateName: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={startInterview}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              Start Test Interview
            </button>
          </div>
        )}

        {/* Connecting */}
        {phase === "connecting" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mb-4" />
            <p className="text-gray-300">Connecting to {config.provider}…</p>
          </div>
        )}

        {/* Live / Done */}
        {(phase === "live" || phase === "done") && (
          <div className="space-y-4">
            {/* Controls */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
              <div className="text-sm">
                <span className="text-gray-400">Provider: </span>
                <span className="text-indigo-400">{config.provider}</span>
                <span className="text-gray-600 mx-2">|</span>
                <span className="text-gray-400">Model: </span>
                <span className="text-green-400">{config.model}</span>
                {config.provider === "openai-realtime" && config.voice && (
                  <>
                    <span className="text-gray-600 mx-2">|</span>
                    <span className="text-gray-400">Voice: </span>
                    <span className="text-purple-400">{config.voice}</span>
                  </>
                )}
                <span className="text-gray-600 mx-2">|</span>
                <span
                  className={`font-semibold ${phase === "live" ? "text-green-400" : "text-gray-400"}`}
                >
                  {phase === "live" ? "● LIVE" : "■ DONE"}
                </span>
              </div>
              <div className="flex gap-2">
                {phase === "live" && (
                  <button
                    onClick={endInterview}
                    className="px-3 py-1.5 text-xs bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
                  >
                    End Interview
                  </button>
                )}
                <button
                  onClick={disconnect}
                  className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  {phase === "live" ? "Disconnect" : "New Test"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Transcript */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Transcript
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {transcript.length === 0 && (
                    <p className="text-xs text-gray-600 italic">Waiting for speech…</p>
                  )}
                  {transcript.map((entry, i) => (
                    <div key={i} className="text-xs">
                      <span
                        className={`font-semibold ${
                          entry.role === "interviewer" ? "text-indigo-400" : "text-green-400"
                        }`}
                      >
                        {entry.role === "interviewer" ? "AI" : "You"}:{" "}
                      </span>
                      <span className="text-gray-300">{entry.text}</span>
                    </div>
                  ))}
                  <div ref={transcriptEndRef} />
                </div>
              </div>

              {/* Status log */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Status Log
                </h3>
                <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                  {statusLog.map((msg, i) => (
                    <p key={i} className="text-xs text-gray-400">
                      {msg}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Evaluation events */}
            {events.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Evaluation Events ({events.length})
                </h3>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {events.map((ev, i) => (
                    <div
                      key={i}
                      className="text-xs bg-gray-800 rounded-lg p-3 flex items-start gap-3"
                    >
                      <span className="text-yellow-400 font-bold whitespace-nowrap">
                        {ev.score}/10
                      </span>
                      <div>
                        <p className="text-gray-200 font-medium">{ev.question}</p>
                        <p className="text-gray-400 mt-0.5">{ev.feedback}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final report */}
            {finalReport && (
              <div className="bg-gray-900 border border-indigo-500/40 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-indigo-400 mb-3">
                  Final Report — Score: {finalReport.finalScore}/10
                </h3>
                <p className="text-xs text-gray-300 mb-3">{finalReport.summary}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-green-400 mb-1">Strengths</p>
                    <ul className="space-y-1">
                      {finalReport.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-gray-300">
                          · {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-orange-400 mb-1">Improvements</p>
                    <ul className="space-y-1">
                      {finalReport.improvements.map((s, i) => (
                        <li key={i} className="text-xs text-gray-300">
                          · {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {phase === "error" && (
          <div className="bg-gray-900 border border-red-500/40 rounded-xl p-6 space-y-4">
            <p className="text-red-400 font-semibold text-sm">Connection Error</p>
            <p className="text-red-300 text-xs">{errorMsg}</p>
            {statusLog.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-3 max-h-48 overflow-y-auto">
                {statusLog.map((msg, i) => (
                  <p key={i} className="text-xs text-gray-400">
                    {msg}
                  </p>
                ))}
              </div>
            )}
            <button
              onClick={() => setPhase("config")}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              Back to Config
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
