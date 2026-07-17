"use client";
import { useState } from "react";

export function GenerateVoicesButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleClick = async () => {
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/admin/voice-previews/generate", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setStatus("done");
        setMsg(data.message ?? "Done");
      } else {
        setStatus("error");
        setMsg(data.error ?? "Failed");
      }
    } catch {
      setStatus("error");
      setMsg("Network error");
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={status === "loading"}
        className="rounded-xl border border-[#5a58ab] px-4 py-2 text-sm font-semibold text-[#5a58ab] hover:bg-[#5a58ab]/5 transition disabled:opacity-50"
      >
        {status === "loading" ? "Generating…" : "Generate Voice Previews"}
      </button>
      {msg && (
        <p className={`text-xs max-w-xs text-right ${status === "error" ? "text-red-500" : "text-slate-500"}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
