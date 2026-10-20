"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  IoCloseOutline,
  IoCopyOutline,
  IoCheckmarkOutline,
  IoSendOutline,
  IoChevronDownOutline,
  IoAlertCircle,
  IoCheckmarkCircle,
  IoDocumentTextOutline,
  IoOpenOutline,
} from "react-icons/io5";

// ─── PremiumDropdown (identical to the one in custom/page.tsx) ───────────────
type DropdownOption = { value: string; label: string };

function PremiumDropdown({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  placeholder: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="group flex w-full h-11.5 items-center justify-between gap-4 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-4 py-0.5 text-left transition duration-200 hover:border-[#5a58ab]/40 focus:outline-none"
      >
        <span className={`block text-sm ${selected ? "text-[#252e3d]" : "text-slate-400"}`}>
          {selected?.label || placeholder}
        </span>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[#5a58ab] transition group-hover:scale-105">
          <IoChevronDownOutline className={`transition duration-200 ${open ? "rotate-180" : ""} w-3 h-3`} />
        </span>
      </button>

      {open && (
        <div className="absolute z-[9999] mt-1 w-full overflow-hidden rounded-2xl border border-[#d9def0] bg-white shadow-[0_24px_50px_rgba(37,46,61,0.14)]">
          <div className="max-h-48 overflow-y-auto p-2">
            {options.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => { onChange(option.value); setOpen(false); }}
                  className={`mb-1.5 flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition duration-200 last:mb-0 ${
                    active
                      ? "border-[#5a58ab]/30 bg-[#f4f3ff] shadow-[0_10px_20px_rgba(90,88,171,0.08)]"
                      : "border-slate-200 bg-slate-50/70 hover:border-[#5a58ab]/20 hover:bg-[#faf9ff]"
                  }`}
                >
                  <span className="block text-sm font-medium text-[#252e3d]">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Option Arrays (matching custom/page.tsx exactly) ───────────────────────
const experienceOptions: DropdownOption[] = [
  { value: "Junior", label: "Junior (0-2 years)" },
  { value: "Mid-level", label: "Mid-level (2-5 years)" },
  { value: "Senior", label: "Senior (5+ years)" },
];

const difficultyOptions: DropdownOption[] = [
  { value: "Easy", label: "Easy (Conversational)" },
  { value: "Medium", label: "Medium (Standard)" },
  { value: "Hard", label: "Hard (Deep dive)" },
];

const careerGoalOptions: DropdownOption[] = [
  { value: "Get hired for this job", label: "Get hired for this job" },
  { value: "Switch to this industry", label: "Switch to this industry" },
  { value: "Move into a senior / leadership role", label: "Move into a senior / leadership role" },
  { value: "Returning after a career break", label: "Returning after a career break" },
  { value: "Practice and sharpen interview skills", label: "Practice and sharpen interview skills" },
  { value: "Prepare for a specific company", label: "Prepare for a specific company" },
];

// ─── Main Modal ──────────────────────────────────────────────────────────────
type Props = { isOpen: boolean; onClose: () => void };

export default function CreateCandidateInterviewModal({ isOpen, onClose }: Props) {
  const router = useRouter();

  const [form, setForm] = useState({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    linkedInUrl: "",
    jobRole: "",
    experienceLevel: "",
    difficultyLevel: "",
    jobDescription: "",
    careerGoal: "",
    focusAreas: "",
    selfIntroNotes: "",
    hasPurchasedPrep: false,
    interviewPrepPurchaseId: "",
    paymentUtr: "",
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [prepVerification, setPrepVerification] = useState<{
    verifying: boolean;
    result: {
      found: boolean;
      isPrepService?: boolean;
      serviceName?: string;
      candidateName?: string;
      interviewPrepUrl?: string | null;
      hasPrepDoc?: boolean;
      message?: string;
    } | null;
  }>({ verifying: false, result: null });

  const [result, setResult] = useState<{
    interviewLink: string;
    candidateEmail: string;
    message: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Prep purchase ID live verification (matching custom/page.tsx)
  useEffect(() => {
    if (!form.hasPurchasedPrep || !form.interviewPrepPurchaseId.trim()) {
      setPrepVerification({ verifying: false, result: null });
      return;
    }
    const trimmedId = form.interviewPrepPurchaseId.trim();
    if (trimmedId.length < 5) { setPrepVerification({ verifying: false, result: null }); return; }

    setPrepVerification({ verifying: true, result: null });
    const timer = setTimeout(() => {
      fetch(`/api/interviews/verify-prep-purchase?purchaseId=${encodeURIComponent(trimmedId)}`)
        .then((r) => r.json())
        .then((data) => setPrepVerification({ verifying: false, result: data }))
        .catch(() => setPrepVerification({ verifying: false, result: { found: false, message: "Network error verifying Purchase ID" } }));
    }, 400);
    return () => clearTimeout(timer);
  }, [form.hasPurchasedPrep, form.interviewPrepPurchaseId]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setResult(null);
      setError(null);
      setResumeError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setForm({
      candidateName: "", candidateEmail: "", candidatePhone: "", linkedInUrl: "",
      jobRole: "", experienceLevel: "", difficultyLevel: "", jobDescription: "",
      careerGoal: "", focusAreas: "", selfIntroNotes: "",
      hasPurchasedPrep: false, interviewPrepPurchaseId: "", paymentUtr: "",
    });
    setResumeFile(null);
    setResumeError(null);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s\-\(\)\.]{6,20}$/;
    const phoneClean = form.candidatePhone.trim();
    const phoneDigits = phoneClean.replace(/\D/g, "");

    if (!form.candidateName.trim() || form.candidateName.trim().length < 2 || !/\p{L}/u.test(form.candidateName)) {
      setError("Please enter a valid candidate full name (at least 2 letters).");
      return;
    }
    if (!form.candidateEmail.trim() || !emailRegex.test(form.candidateEmail.trim())) {
      setError("Please enter a valid candidate email address.");
      return;
    }
    if (!phoneClean || !phoneRegex.test(phoneClean) || phoneDigits.length < 6 || phoneDigits.length > 15) {
      setError("Please enter a valid candidate phone number with country code (e.g. +1 555 123 4567 or +44 7911 123456).");
      return;
    }
    if (!form.jobRole.trim()) { setError("Job Title / Target Role is required."); return; }
    if (!form.experienceLevel) { setError("Please select an Experience Level."); return; }
    if (!form.difficultyLevel) { setError("Please select a Difficulty Level."); return; }
    if (!form.jobDescription.trim()) { setError("Job Description is required."); return; }
    if (!form.careerGoal) { setError("Please select a Main Career Goal."); return; }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("candidateName", form.candidateName.trim());
      formData.append("candidateEmail", form.candidateEmail.trim());
      formData.append("candidatePhone", form.candidatePhone.trim());
      formData.append("linkedInUrl", form.linkedInUrl.trim());
      formData.append("interviewPreference", "AI");
      formData.append("jobRole", form.jobRole.trim());
      formData.append("experienceLevel", form.experienceLevel);
      formData.append("difficultyLevel", form.difficultyLevel);
      formData.append("durationMinutes", "30");
      formData.append("jobDescription", form.jobDescription.trim());
      formData.append("careerGoal", form.careerGoal);
      formData.append("focusAreas", form.focusAreas.trim());
      formData.append("selfIntroNotes", form.selfIntroNotes.trim());
      formData.append("paymentUtr", form.paymentUtr.trim());
      if (form.hasPurchasedPrep && form.interviewPrepPurchaseId.trim()) {
        formData.append("interviewPrepPurchaseId", form.interviewPrepPurchaseId.trim());
      }
      if (resumeFile) formData.append("resume", resumeFile);

      const res = await fetch("/api/admin/interviews/create-for-candidate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create interview");

      setResult({
        interviewLink: data.interviewLink,
        candidateEmail: form.candidateEmail.trim(),
        message: data.message,
      });
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.interviewLink) {
      navigator.clipboard.writeText(result.interviewLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs"
      onWheel={(e) => e.stopPropagation()}
    >
        <div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-100 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb:hover]:bg-[#5a58ab]/60"
          style={{ fontFamily: "Raleway, sans-serif", scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}
        >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 bg-white rounded-t-3xl border-b border-slate-100">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#5a58ab]">
              UPI QR Code Candidate
            </p>
            <h2 className="mt-0.5 text-xl font-semibold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
              Configure Custom Interview
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <IoCloseOutline className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 sm:px-8 py-6">
          {result ? (
            <div className="py-4 text-center space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <IoSendOutline className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
                  Interview Setup Complete!
                </h3>
                <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
                  An invitation email with the interview access link has been sent to{" "}
                  <span className="font-bold text-[#5a58ab]">{result.candidateEmail}</span>.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Candidate Direct Access Link
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={result.interviewLink}
                    className="w-full text-xs font-mono bg-white px-3 py-2.5 border border-slate-200 rounded-xl text-slate-700 outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#5a58ab] hover:bg-[#4a489b] text-white text-xs font-semibold rounded-xl transition cursor-pointer shrink-0"
                  >
                    {copied ? <IoCheckmarkOutline className="w-4 h-4" /> : <IoCopyOutline className="w-4 h-4" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetForm}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition cursor-pointer"
                >
                  + Setup Another
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#5a58ab] hover:bg-[#4a489b] text-white font-semibold text-sm transition cursor-pointer shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Candidate Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Your Full Name <span className="text-[#5a58ab]">*</span>
                  </label>
                  <input
                    type="text"
                    name="candidateName"
                    required
                    minLength={2}
                    value={form.candidateName}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm text-[#252e3d] px-4 py-3 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Email Address <span className="text-[#5a58ab]">*</span>
                  </label>
                  <input
                    type="email"
                    name="candidateEmail"
                    required
                    value={form.candidateEmail}
                    onChange={handleChange}
                    placeholder="e.g. john@example.com"
                    className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm text-[#252e3d] px-4 py-3 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Phone Number <span className="text-[#5a58ab]">*</span>
                  </label>
                  <input
                    type="tel"
                    name="candidatePhone"
                    required
                    pattern="^\+?[0-9\s\-\(\)\.]{6,20}$"
                    title="Please enter a valid phone number with digits and country code (e.g. +1 555 123 4567 or +44 7911 123456)"
                    value={form.candidatePhone}
                    onChange={handleChange}
                    placeholder="e.g. +1 555 123 4567"
                    className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm text-[#252e3d] px-4 py-3 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    LinkedIn Profile URL (optional)
                  </label>
                  <input
                    type="url"
                    name="linkedInUrl"
                    value={form.linkedInUrl}
                    onChange={handleChange}
                    placeholder="e.g. https://linkedin.com/in/username"
                    className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm text-[#252e3d] px-4 py-3 outline-none transition"
                  />
                </div>
              </div>

              {/* Payment UTR */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-white text-[10px] font-black">₹</div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                      UPI Payment UTR / Transaction ID <span className="text-[#5a58ab]">*</span>
                    </label>
                    <input
                      type="text"
                      name="paymentUtr"
                      required
                      value={form.paymentUtr}
                      onChange={handleChange}
                      placeholder="e.g. 426831297654 or T2608061234567890"
                      className="w-full rounded-xl border border-amber-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-white text-sm text-[#252e3d] px-4 py-3 outline-none transition font-mono"
                    />
                    <p className="mt-1.5 text-[10px] text-slate-500">
                      12-digit UTR or bank transaction reference number from the candidate&apos;s UPI payment screenshot.
                    </p>
                  </div>
                </div>
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                  Upload Resume (PDF, Word, or Text){" "}
                  <span className="text-[#5a58ab]">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={(e) => {
                    setResumeError(null);
                    setResumeFile(e.target.files?.[0] || null);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-sm px-4 py-2.5 outline-none transition file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#5a58ab]/10 file:text-[#5a58ab] hover:file:bg-[#5a58ab]/20"
                />
                {resumeError && <p className="text-red-500 text-xs mt-1 font-semibold">{resumeError}</p>}
              </div>

              {/* Job Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Job Title / Target Role{" "}
                    <span className="text-[#5a58ab]">*</span>
                  </label>
                  <input
                    type="text"
                    name="jobRole"
                    required
                    value={form.jobRole}
                    onChange={handleChange}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm text-[#252e3d] px-4 py-3 outline-none transition"
                  />
                </div>
                <div>
                  <PremiumDropdown
                    label="Experience Level *"
                    value={form.experienceLevel}
                    options={experienceOptions}
                    placeholder="Select experience level"
                    onChange={(v) => setForm((prev) => ({ ...prev, experienceLevel: v }))}
                  />
                </div>
                <div>
                  <PremiumDropdown
                    label="Difficulty Level *"
                    value={form.difficultyLevel}
                    options={difficultyOptions}
                    placeholder="Select difficulty level"
                    onChange={(v) => setForm((prev) => ({ ...prev, difficultyLevel: v }))}
                  />
                </div>
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                  Job Description <span className="text-[#5a58ab]">*</span>
                </label>
                <textarea
                  name="jobDescription"
                  required
                  value={form.jobDescription}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Paste the full job description here (responsibilities, technical requirements, stack, credentials...)"
                  className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm text-[#252e3d] px-4 py-3 outline-none transition resize-y font-mono text-xs sm:text-sm"
                />
              </div>

              {/* Personalisation */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Personalise Your Interview
                </h3>

                <PremiumDropdown
                  label="Main Career Goal *"
                  value={form.careerGoal}
                  options={careerGoalOptions}
                  placeholder="Select your primary goal…"
                  onChange={(v) => setForm((prev) => ({ ...prev, careerGoal: v }))}
                />

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Focus Areas{" "}
                    <span className="text-slate-400 normal-case font-normal">(optional)</span>
                  </label>
                  <textarea
                    name="focusAreas"
                    value={form.focusAreas}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g. system design, SQL, behavioural questions…"
                    className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm text-[#252e3d] px-4 py-3 outline-none transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Anything you&apos;d like the AI interviewer to know?{" "}
                    <span className="text-slate-400 normal-case font-normal">(optional)</span>
                  </label>
                  <textarea
                    name="selfIntroNotes"
                    value={form.selfIntroNotes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="e.g. I have a 2-year gap due to caregiving, I'm pivoting from finance to tech…"
                    className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm text-[#252e3d] px-4 py-3 outline-none transition resize-none"
                  />
                </div>

                {/* Interview Prep Checkbox */}
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        name="hasPurchasedPrep"
                        checked={form.hasPurchasedPrep}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, hasPurchasedPrep: e.target.checked }))
                        }
                        className="w-4 h-4 appearance-none border-2 border-slate-300 rounded cursor-pointer checked:bg-[#5a58ab] checked:border-[#5a58ab] transition-colors peer"
                      />
                      <svg
                        className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                        I have previously purchased Interview Prep services
                      </span>
                      <span className="text-xs text-[#5a58ab] font-medium mt-0.5">
                        Checking this box will include your uploaded preparation document into the AI model&apos;s context to craft customized interview questions based on your prep material.
                      </span>
                    </div>
                  </label>

                  {form.hasPurchasedPrep && (
                    <div className="pt-2 pl-7 space-y-2.5">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                          Purchase ID <span className="text-[#5a58ab]">*</span>
                        </label>
                        <input
                          type="text"
                          name="interviewPrepPurchaseId"
                          required={form.hasPurchasedPrep}
                          value={form.interviewPrepPurchaseId}
                          onChange={handleChange}
                          placeholder="e.g. cm2x1... or pi_3P..."
                          className="w-full max-w-sm rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-white text-sm text-[#252e3d] px-4 py-2.5 outline-none transition font-mono"
                        />
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <IoAlertCircle className="w-3.5 h-3.5" />
                          You can find your Purchase ID in your confirmation email or payment receipt.
                        </p>
                      </div>

                      {prepVerification.verifying && (
                        <div className="flex items-center gap-2 text-xs text-[#5a58ab]">
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#5a58ab] border-t-transparent" />
                          <span>Verifying Purchase ID...</span>
                        </div>
                      )}

                      {!prepVerification.verifying && prepVerification.result && (
                        <div className="pt-1">
                          {prepVerification.result.found && prepVerification.result.isPrepService ? (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 space-y-2 text-xs text-emerald-900">
                              <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                                <IoCheckmarkCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Verified: {prepVerification.result.serviceName}</span>
                              </div>
                              {prepVerification.result.interviewPrepUrl ? (
                                <div className="bg-white rounded-lg p-2.5 border border-emerald-200/80 flex items-center justify-between gap-3 shadow-xs">
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <IoDocumentTextOutline className="w-4 h-4 text-[#5a58ab] shrink-0" />
                                    <span className="font-semibold text-slate-700 truncate">Uploaded Prep Document</span>
                                  </div>
                                  <a
                                    href={prepVerification.result.interviewPrepUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 bg-[#5a58ab] hover:bg-[#4a489b] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0"
                                  >
                                    View <IoOpenOutline className="w-3 h-3" />
                                  </a>
                                </div>
                              ) : (
                                <p className="text-amber-700 font-medium">
                                  ⚠ No prep document uploaded yet - the AI will still use your resume and JD.
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs text-red-700 font-medium">
                              {prepVerification.result.message || "Purchase ID not found or is not an Interview Prep service."}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-[#5a58ab] hover:bg-[#4a489b] text-white rounded-xl text-sm font-bold transition disabled:opacity-50 shadow-md shadow-[#5a58ab]/20 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Creating & Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <IoSendOutline className="w-4 h-4" />
                      <span>Create & Email Interview Link</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
