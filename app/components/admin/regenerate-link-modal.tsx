"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  IoCopyOutline,
  IoCheckmarkOutline,
  IoRefreshOutline,
  IoMailOutline,
  IoLinkOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoClose,
  IoOpenOutline,
} from "react-icons/io5";

export interface InterviewLinkManagerProps {
  applicationId?: string | null;
  purchaseId?: string | null;
  candidateEmail: string;
  candidateName: string;
  initialLink?: string | null;
  expiresAt?: string | null;
  onLinkUpdated?: (newLink: string) => void;
}

export function InterviewLinkCard({
  applicationId,
  purchaseId,
  candidateEmail,
  candidateName,
  initialLink,
  expiresAt,
  onLinkUpdated,
}: InterviewLinkManagerProps) {
  const [link, setLink] = useState<string>(initialLink || "");
  const [currentExpiresAt, setCurrentExpiresAt] = useState<string | null>(expiresAt || null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sendEmailOnRegenerate, setSendEmailOnRegenerate] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCopyLink = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Interview link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link to clipboard.");
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/interviews/regenerate-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: applicationId || undefined,
          purchaseId: purchaseId || undefined,
          candidateEmail,
          sendEmail: sendEmailOnRegenerate,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.error || "Failed to regenerate interview link.";
        setFeedback({ type: "error", text: errorMsg });
        toast.error(errorMsg);
        return;
      }

      setLink(data.interviewLink);
      if (data.expiresAt) setCurrentExpiresAt(data.expiresAt);
      if (onLinkUpdated) onLinkUpdated(data.interviewLink);

      const successMsg = data.emailSent
        ? `Fresh 7-day link generated and emailed to ${candidateEmail}.`
        : `Fresh 7-day interview link generated successfully.`;

      setFeedback({ type: "success", text: successMsg });
      toast.success(successMsg);
    } catch (err: any) {
      const errorMsg = err?.message || "Network error. Please try again.";
      setFeedback({ type: "error", text: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!link) {
      toast.error("No link to send. Please regenerate first.");
      return;
    }

    setIsSendingEmail(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/interviews/send-link-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: applicationId || undefined,
          purchaseId: purchaseId || undefined,
          interviewLink: link,
          candidateEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.error || "Failed to send invitation email.";
        setFeedback({ type: "error", text: errorMsg });
        toast.error(errorMsg);
        return;
      }

      const successMsg = `Interview invitation email sent to ${candidateEmail}!`;
      setFeedback({ type: "success", text: successMsg });
      toast.success(successMsg);
    } catch (err: any) {
      const errorMsg = err?.message || "Network error. Please try again.";
      setFeedback({ type: "error", text: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-xs space-y-4">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#5a58ab]/10 text-[#5a58ab]">
            <IoLinkOutline className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[#252e3d]">
              Interview Link & Access
            </h4>
            <p className="text-[11px] text-slate-500">
              Unique 7-day token for candidate access
            </p>
          </div>
        </div>

        {(() => {
          const isExpired = currentExpiresAt
            ? new Date(currentExpiresAt).getTime() < Date.now()
            : false;
          const badgeClass = !link
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : isExpired
            ? "bg-rose-50 text-rose-700 border-rose-200"
            : "bg-emerald-50 text-emerald-700 border-emerald-200";
          const dotClass = !link
            ? "bg-amber-500"
            : isExpired
            ? "bg-rose-500"
            : "bg-emerald-500";
          const label = !link
            ? "No Link"
            : isExpired
            ? "Link Expired"
            : "Link Active";

          return (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${badgeClass}`}
            >
              <span className={`h-2 w-2 rounded-full ${dotClass}`} />
              {label}
            </span>
          );
        })()}
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        If the candidate reports their link is invalid or expired, copy the direct link below, send a fresh email, or regenerate a new 7-day access token.
      </p>

      {/* Shareable Link Box */}
      {link ? (
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Shareable Interview Link
            </label>
            <span className="text-[10px] text-slate-400">Click to select all</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 min-w-0 w-full overflow-hidden">
            <div
              className="flex-1 min-w-0 overflow-hidden px-2.5 py-1.5 text-xs font-mono text-slate-700 select-all truncate bg-white rounded-lg border border-slate-200/70 cursor-text"
              title={link}
              onClick={(e) => {
                const range = document.createRange();
                range.selectNodeContents(e.currentTarget);
                const sel = window.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(range);
              }}
            >
              {link}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer shadow-2xs ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
                title="Copy Link to Clipboard"
              >
                {copied ? (
                  <>
                    <IoCheckmarkOutline className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <IoCopyOutline className="w-4 h-4 text-slate-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-[#5a58ab]/10 px-3 py-1.5 text-xs font-semibold text-[#5a58ab] hover:bg-[#5a58ab]/15 transition disabled:opacity-50 cursor-pointer shadow-2xs"
                title={`Send email directly to ${candidateEmail}`}
              >
                <IoMailOutline className="w-4 h-4" />
                <span>{isSendingEmail ? "Sending..." : "Send Email"}</span>
              </button>

              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition shadow-2xs cursor-pointer"
                title="Open link in new tab to test"
              >
                <IoOpenOutline className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-3.5 text-center">
          <p className="text-xs text-slate-500">
            No active interview link found. Generate a fresh 7-day interview link below.
          </p>
        </div>
      )}

      {/* Regenerate Action Row */}
      <div className="rounded-xl border border-slate-100 bg-[#fbfbfd] p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sendEmailOnRegenerate}
            onChange={(e) => setSendEmailOnRegenerate(e.target.checked)}
            className="w-4 h-4 rounded text-[#5a58ab] focus:ring-[#5a58ab] cursor-pointer"
          />
          <span className="font-medium">Also email new link to candidate immediately</span>
        </label>

        <button
          type="button"
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5a58ab] hover:bg-[#4a489b] text-white text-xs font-semibold px-4 py-2.5 transition shadow-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer shrink-0"
        >
          <IoRefreshOutline className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`} />
          <span>{isRegenerating ? "Regenerating..." : link ? "Regenerate Link" : "Generate Link"}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <IoCheckmarkCircleOutline className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <IoAlertCircleOutline className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span className="leading-snug">{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
            title="Dismiss"
          >
            <IoClose className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function RegenerateLinkModal({
  isOpen,
  onClose,
  applicationId,
  purchaseId,
  candidateEmail,
  candidateName,
  initialLink,
}: {
  isOpen: boolean;
  onClose: () => void;
  applicationId?: string | null;
  purchaseId?: string | null;
  candidateEmail: string;
  candidateName: string;
  initialLink?: string | null;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#252e3d]/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          title="Close"
        >
          <IoClose className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5a58ab]">
            Candidate Interview Link
          </p>
          <h3 className="text-xl font-bold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
            {candidateName}
          </h3>
          <p className="text-xs text-slate-500">{candidateEmail}</p>
        </div>

        <InterviewLinkCard
          applicationId={applicationId}
          purchaseId={purchaseId}
          candidateEmail={candidateEmail}
          candidateName={candidateName}
          initialLink={initialLink}
        />
      </div>
    </div>
  );
}

