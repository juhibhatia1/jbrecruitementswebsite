"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  IoSparkles,
  IoAlertCircle,
  IoCheckmarkCircle,
  IoChevronDownOutline,
  IoDocumentTextOutline,
  IoOpenOutline,
} from "react-icons/io5";

interface AiSetupFormProps {
  purchaseId: string;
  candidateName: string;
  candidateEmail: string;
  onComplete: (interviewLink: string) => void;
}

interface DropdownOption {
  value: string;
  label: string;
}

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
  onChange: (nextValue: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selected = options.find((option) => option.value === value) ?? null;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="group flex w-full h-11.5 items-center justify-between gap-4 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-4 py-0.5 text-left transition duration-200 hover:border-[#5a58ab]/40 focus:outline-none cursor-pointer"
      >
        <span
          className={`block text-sm ${selected ? "text-[#252e3d]" : "text-slate-400"}`}
        >
          {selected?.label || placeholder}
        </span>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[#5a58ab] transition group-hover:scale-105">
          <IoChevronDownOutline
            className={`transition duration-200 ${open ? "rotate-180" : ""} w-3 h-3`}
          />
        </span>
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-2xl border border-[#d9def0] bg-white shadow-[0_24px_50px_rgba(37,46,61,0.14)]">
          <div className="max-h-64 overflow-y-auto p-2">
            {options.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`mb-2 flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition duration-200 last:mb-0 cursor-pointer ${
                    active
                      ? "border-[#5a58ab]/30 bg-[#f4f3ff] shadow-[0_10px_20px_rgba(90,88,171,0.08)]"
                      : "border-slate-200 bg-slate-50/70 hover:border-[#5a58ab]/20 hover:bg-[#faf9ff]"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block text-sm">{option.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function AiSetupForm({ purchaseId, candidateName, candidateEmail, onComplete }: AiSetupFormProps) {
  const [jobRole, setJobRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Mid-level");
  const [difficultyLevel, setDifficultyLevel] = useState("Medium");
  const [jobDescription, setJobDescription] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [careerGoal, setCareerGoal] = useState("Practice and sharpen interview skills");
  const [selfIntroNotes, setSelfIntroNotes] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [jobApplicationLink, setJobApplicationLink] = useState("");

  // Prep Integration state
  const [hasPurchasedPrep, setHasPurchasedPrep] = useState(false);
  const [interviewPrepPurchaseId, setInterviewPrepPurchaseId] = useState("");
  const [prepVerification, setPrepVerification] = useState<{
    verifying: boolean;
    result: {
      found: boolean;
      isPrepService?: boolean;
      serviceName?: string;
      interviewPrepUrl?: string | null;
      hasPrepDoc?: boolean;
      message?: string;
    } | null;
  }>({ verifying: false, result: null });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Debounced verification hook for Prep Purchase ID
  useEffect(() => {
    if (!hasPurchasedPrep || !interviewPrepPurchaseId.trim()) {
      setPrepVerification({ verifying: false, result: null });
      return;
    }

    const trimmedId = interviewPrepPurchaseId.trim();
    if (trimmedId.length < 5) {
      setPrepVerification({ verifying: false, result: null });
      return;
    }

    setPrepVerification({ verifying: true, result: null });
    const timer = setTimeout(() => {
      fetch(`/api/interviews/verify-prep-purchase?purchaseId=${encodeURIComponent(trimmedId)}`)
        .then((r) => r.json())
        .then((data) => {
          setPrepVerification({ verifying: false, result: data });
        })
        .catch(() => {
          setPrepVerification({
            verifying: false,
            result: { found: false, message: "Verification failed. Please try again." },
          });
        });
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasPurchasedPrep, interviewPrepPurchaseId]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobRole.trim() || !experienceLevel || !difficultyLevel || !jobDescription.trim()) {
      setFormError("Please fill out all required fields: Job Role, Experience, Difficulty, and Job Description.");
      return;
    }

    if (!resumeFile) {
      setFormError("Please upload your resume to personalize your custom mock interview.");
      return;
    }

    setGenerating(true);
    setFormError(null);
    setResumeError(null);

    let resumeUrl = "";
    let resumeText = "";

    try {
      // 1. Upload resume to cloud storage and extract text
      setUploadingResume(true);
      const uploadFormData = new FormData();
      uploadFormData.append("resume", resumeFile);

      const uploadRes = await fetch("/api/interviews/upload-resume", {
        method: "POST",
        body: uploadFormData,
      });

      const uploadData = await uploadRes.json();
      setUploadingResume(false);

      if (!uploadRes.ok) {
        const errMsg = uploadData.error || "Failed to process resume upload.";
        setResumeError(errMsg);
        setGenerating(false);
        return;
      }

      resumeUrl = uploadData.resumeUrl;
      resumeText = uploadData.resumeText;

      const prepPurchaseIdParam =
        hasPurchasedPrep && prepVerification.result?.found && prepVerification.result?.isPrepService
          ? interviewPrepPurchaseId.trim()
          : undefined;

      // 2. Generate custom template via public API endpoint
      const genRes = await fetch("/api/interviews/custom-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole,
          experienceLevel,
          difficultyLevel,
          durationMinutes: 30,
          jobDescription,
          resumeText,
          interviewPrepPurchaseId: prepPurchaseIdParam,
        }),
      });

      const genData = await genRes.json();
      if (!genRes.ok || !genData.templateId) {
        setFormError(genData.error || "Could not design custom interview template. Please try again.");
        setGenerating(false);
        return;
      }

      // 3. Activate the bundle interview & link to purchase record
      setSubmitting(true);
      const actRes = await fetch("/api/interviews/activate-bundle-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseId,
          templateId: genData.templateId,
          resumeUrl,
          resumeText,
          linkedInUrl: linkedInUrl || undefined,
          careerGoal: careerGoal || undefined,
          selfIntroNotes: selfIntroNotes || undefined,
          yearsOfExperience: yearsOfExperience || undefined,
          jobApplicationLink: jobApplicationLink || undefined,
        }),
      });

      const actData = await actRes.json();
      if (!actRes.ok || !actData.interviewLink) {
        setFormError(actData.error || "Failed to activate your interview slot. Please contact support.");
        setSubmitting(false);
        setGenerating(false);
        return;
      }

      toast.success("Success!", {
        description: "Your custom mock interview is fully generated and ready to start.",
      });

      onComplete(actData.interviewLink);
    } catch (err: any) {
      console.error(err);
      setFormError("A network or server error occurred. Please check your connection and try again.");
    } finally {
      setGenerating(false);
      setSubmitting(false);
      setUploadingResume(false);
    }
  };

  const experienceOptions = [
    { value: "Junior", label: "Junior (0-2 years)" },
    { value: "Mid-level", label: "Mid-level (2-5 years)" },
    { value: "Senior", label: "Senior (5+ years)" },
  ];

  const difficultyOptions = [
    { value: "Easy", label: "Easy (Conversational)" },
    { value: "Medium", label: "Medium (Standard)" },
    { value: "Hard", label: "Hard (Deep dive)" },
  ];

  const careerGoalOptions = [
    { value: "Get hired for this job", label: "Get hired for this job" },
    { value: "Switch to this industry", label: "Switch to this industry" },
    { value: "Move into a senior / leadership role", label: "Move into a senior / leadership role" },
    { value: "Returning after a career break", label: "Returning after a career break" },
    { value: "Practice and sharpen interview skills", label: "Practice and sharpen interview skills" },
    { value: "Prepare for a specific company", label: "Prepare for a specific company" },
  ];

  return (
    <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-3xl shadow-[0_12px_40px_rgba(37,55,77,0.06)] overflow-hidden transition-all duration-300 mx-4 p-6 sm:p-8">
      {/* Loader Overlay */}
      {(generating || submitting || uploadingResume) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl border border-slate-100 flex flex-col items-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-[#5a58ab]/10 border-t-[#5a58ab]" />
              <IoSparkles className="w-6 h-6 text-[#5a58ab] absolute top-4 left-4 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-[#252e3d] mb-2">
              {uploadingResume ? "Analyzing Resume" : "Designing Interview"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {uploadingResume
                ? "Extracting tech stack, experience points, and preparing personalized questions..."
                : "Our AI is designing custom interview modules, extracting keywords, and assembling voice instructions. This takes about 10-15 seconds..."}
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1.5">
          <IoCheckmarkCircle className="w-6 h-6 text-green-500" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5a58ab]">Payment Verified</p>
        </div>
        <h1 className="text-2xl font-bold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
          Configure Custom AI Mock Interview
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {candidateName ? `Hi ${candidateName}, let's` : "Let's"} set up the AI Mock Interview included in your bundle. Upload your target role and resume to generate a personalized session.
        </p>
      </div>

      {formError && (
        <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm flex items-start gap-2.5">
          <IoAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-5 text-left">
        {/* Upload Resume */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
            Upload Resume (PDF, Word, or Text) <span className="text-[#5a58ab]">*</span>
          </label>
          <input
            type="file"
            required
            accept=".pdf,.doc,.docx,.txt,.md"
            onChange={(e) => {
              setResumeError(null);
              setResumeFile(e.target.files?.[0] || null);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm px-4 py-2.5 outline-none transition file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#5a58ab]/10 file:text-[#5a58ab] hover:file:bg-[#5a58ab]/20"
          />
          {resumeError && (
            <p className="text-red-500 text-xs mt-1 font-semibold">
              {resumeError}
            </p>
          )}
        </div>

        {/* Job Config */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
              Target Job Title / Role <span className="text-[#5a58ab]">*</span>
            </label>
            <input
              type="text"
              required
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
              className="w-full h-11.5 rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm px-4 py-2.5 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
              Years of Experience (optional)
            </label>
            <input
              type="text"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              placeholder="e.g. 5+ years"
              className="w-full h-11.5 rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm px-4 py-2.5 outline-none transition"
            />
          </div>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PremiumDropdown
            label="Experience Level *"
            value={experienceLevel}
            options={experienceOptions}
            placeholder="Select Experience Level"
            onChange={setExperienceLevel}
          />

          <PremiumDropdown
            label="Interview Difficulty *"
            value={difficultyLevel}
            options={difficultyOptions}
            placeholder="Select Interview Difficulty"
            onChange={setDifficultyLevel}
          />
        </div>

        {/* Optional details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
              LinkedIn Profile URL (optional)
            </label>
            <input
              type="url"
              value={linkedInUrl}
              onChange={(e) => setLinkedInUrl(e.target.value)}
              placeholder="e.g. https://linkedin.com/in/username"
              className="w-full h-11.5 rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm px-4 py-2.5 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
              Job Posting URL (optional)
            </label>
            <input
              type="url"
              value={jobApplicationLink}
              onChange={(e) => setJobApplicationLink(e.target.value)}
              placeholder="e.g. https://careers.company.com/job"
              className="w-full h-11.5 rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm px-4 py-2.5 outline-none transition"
            />
          </div>
        </div>

        {/* Job Goal */}
        <PremiumDropdown
          label="What is your main career goal?"
          value={careerGoal}
          options={careerGoalOptions}
          placeholder="Select Career Goal"
          onChange={setCareerGoal}
        />

        {/* Self Intro Notes */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
            Key points for self-introduction (optional)
          </label>
          <textarea
            value={selfIntroNotes}
            onChange={(e) => setSelfIntroNotes(e.target.value)}
            placeholder="Introduce key projects or achievements you want the AI to ask you about..."
            rows={2}
            className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm px-4 py-3 outline-none transition resize-none"
          />
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
            Job Description (Copy & Paste) <span className="text-[#5a58ab]">*</span>
          </label>
          <textarea
            required
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job posting description here so the AI can extract responsibilities and technical questions..."
            rows={6}
            className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm px-4 py-3 outline-none transition resize-y"
          />
        </div>

        {/* Prep Integration Section */}
        <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                checked={hasPurchasedPrep}
                onChange={(e) => setHasPurchasedPrep(e.target.checked)}
                className="w-4.5 h-4.5 appearance-none border-2 border-slate-300 rounded cursor-pointer checked:bg-[#5a58ab] checked:border-[#5a58ab] transition-colors peer"
              />
              <svg
                className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                I have previously purchased Interview Prep services
              </span>
              <span className="text-xs text-[#5a58ab] font-medium mt-0.5">
                Checking this box will include your uploaded preparation document into the AI model's context to craft customized interview questions based on your prep material.
              </span>
            </div>
          </label>

          {hasPurchasedPrep && (
            <div className="pt-2 pl-7.5 animate-fadeIn space-y-2.5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                  Purchase ID <span className="text-[#5a58ab]">*</span>
                </label>
                <input
                  type="text"
                  required={hasPurchasedPrep}
                  value={interviewPrepPurchaseId}
                  onChange={(e) => setInterviewPrepPurchaseId(e.target.value)}
                  placeholder="e.g. cm2x1... or pi_3P..."
                  className="w-full max-w-sm rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-white text-sm px-4 py-2.5 outline-none transition font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <IoAlertCircle className="w-3.5 h-3.5" />
                  You can find your Purchase ID in your confirmation email or payment receipt.
                </p>
              </div>

              {/* Live verification & Document link */}
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
                            <span>View Document</span>
                            <IoOpenOutline className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <p className="text-[11px] text-emerald-800 italic">
                          ℹ️ Purchase ID verified! Your preparation document will be processed and included by the AI when crafting your mock interview.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-start gap-2">
                      <IoAlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{prepVerification.result.message || "Invalid Purchase ID. Please check your payment receipt."}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-[#5a58ab] hover:bg-[#4a489b] text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
          >
            <IoSparkles className="w-5 h-5" />
            Generate Custom AI Interview
          </button>
        </div>
      </form>
    </div>
  );
}
