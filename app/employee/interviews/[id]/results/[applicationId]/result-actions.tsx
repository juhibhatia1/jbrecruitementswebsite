"use client";

import { useState } from "react";
import { RegenerateLinkModal } from "@/app/components/admin/regenerate-link-modal";

type Props = {
  sessionId: string;
  candidateEmail: string;
  applicationId?: string;
  candidateName?: string;
};

export default function ResultActions({
  sessionId,
  candidateEmail,
  applicationId,
  candidateName,
}: Props) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);

  const handleSendResults = async () => {
    setSending(true);
    setSendError("");
    try {
      const res = await fetch(`/api/interviews/sessions/${sessionId}/send-results`, { method: "POST" });
      const data = await res.json() as { message?: string; error?: string };
      if (!res.ok) {
        setSendError(data.error ?? "Failed to send email.");
      } else {
        setSent(true);
      }
    } catch {
      setSendError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <a
          href={`/api/interviews/sessions/${sessionId}/pdf`}
          download
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm flex items-center gap-1.5"
        >
          ↓ Download PDF Report
        </a>

        {sent ? (
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
            ✓ Results sent to {candidateEmail}
          </span>
        ) : (
          <button
            onClick={handleSendResults}
            disabled={sending}
            className="rounded-lg border border-[#5a58ab]/30 bg-[#f0efff] px-4 py-2 text-xs font-semibold text-[#5a58ab] hover:bg-[#e8e7ff] transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {sending ? "Sending…" : "✉ Email Results to Candidate"}
          </button>
        )}

        {applicationId && (
          <button
            type="button"
            onClick={() => setIsRegenerateOpen(true)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            ↻ Regenerate Interview Link
          </button>
        )}

        {sendError && (
          <p className="w-full text-xs text-red-500 mt-1">{sendError}</p>
        )}
      </div>

      {applicationId && (
        <RegenerateLinkModal
          isOpen={isRegenerateOpen}
          onClose={() => setIsRegenerateOpen(false)}
          applicationId={applicationId}
          candidateEmail={candidateEmail}
          candidateName={candidateName || "Candidate"}
        />
      )}
    </>
  );
}
