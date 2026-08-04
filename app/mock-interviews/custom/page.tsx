"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  IoAlertCircle,
  IoLockClosed,
  IoBriefcaseOutline,
  IoSparkles,
  IoChevronBackOutline,
  IoChevronDownOutline,
  IoArrowForwardOutline,
  IoCloseOutline,
  IoCheckmarkCircle,
  IoDocumentTextOutline,
  IoOpenOutline,
} from "react-icons/io5";
import { detectCurrencyFromBrowser } from "@/lib/geo-utils";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

// ─── Stripe inner checkout form ─────────────────────────────────────────────
interface CheckoutFormProps {
  totalAmount: number;
  currency: string;
  clientSecret: string;
  onCancel: () => void;
}

type DropdownOption = {
  value: string;
  label: string;
};

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
        className="group flex w-full h-11.5 items-center justify-between gap-4 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-4 py-0.5 text-left transition duration-200 hover:border-[#5a58ab]/40 focus:outline-none"
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
        <div className="absolute z-30 mt-0 w-full overflow-hidden rounded-2xl border border-[#d9def0] bg-white shadow-[0_24px_50px_rgba(37,46,61,0.14)]">
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
                  className={`mb-2 flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition duration-200 last:mb-0 ${
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

function CheckoutForm({
  totalAmount,
  currency,
  clientSecret,
  onCancel,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setErrorMessage(null);

    const appUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      window.location.origin;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${appUrl}/payment/success`,
      },
    });

    if (error) {
      setErrorMessage(
        error.type === "card_error" || error.type === "validation_error"
          ? (error.message ?? "An error occurred.")
          : "An unexpected error occurred.",
      );
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm flex items-start gap-2 animate-fadeIn">
          <IoAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-[#252e3d] hover:bg-slate-50 transition active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={processing || !stripe || !elements}
          className="flex-[2] rounded-xl bg-[#5a58ab] px-4 py-3 text-sm font-semibold text-white hover:bg-[#4a489b] active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Processing…
            </>
          ) : (
            <>
              <IoLockClosed className="w-4 h-4" />
              Pay {currency} {totalAmount.toLocaleString()}
            </>
          )}
        </button>
      </div>

      <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
        <IoLockClosed className="w-3 h-3" />
        Secured by Stripe · Your card details are never stored
      </p>
    </form>
  );
}

// ─── Main Custom JD Form Page ────────────────────────────────────────────────
export default function CustomJdMockInterviewPage() {
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
  });

  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumePreviewOpen, setResumePreviewOpen] = useState(false);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const [currency, setCurrency] = useState<"USD" | "AED" | "INR" | "">("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStage, setPaymentStage] = useState<"form" | "checkout">("form");
  const [generatedTemplateId, setGeneratedTemplateId] = useState<string | null>(
    null,
  );

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
  }>({
    verifying: false,
    result: null,
  });

  useEffect(() => {
    if (!form.hasPurchasedPrep || !form.interviewPrepPurchaseId.trim()) {
      setPrepVerification({ verifying: false, result: null });
      return;
    }

    const trimmedId = form.interviewPrepPurchaseId.trim();
    if (trimmedId.length < 5) {
      setPrepVerification({ verifying: false, result: null });
      return;
    }

    setPrepVerification({ verifying: true, result: null });

    const timer = setTimeout(() => {
      fetch(`/api/interviews/verify-prep-purchase?purchaseId=${encodeURIComponent(trimmedId)}`)
        .then((res) => res.json())
        .then((data) => {
          setPrepVerification({ verifying: false, result: data });
        })
        .catch(() => {
          setPrepVerification({
            verifying: false,
            result: { found: false, message: "Network error verifying Purchase ID" },
          });
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [form.hasPurchasedPrep, form.interviewPrepPurchaseId]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Price calculations
  const totalAmount = currency === "AED" ? 99 : currency === "INR" ? 499 : 39;
  const displayCurrency = currency || "USD";

  // Location currency detection using local /api/geo first, then ipapi.co
  useEffect(() => {
    const GEO_CACHE_KEY = "jb_currency_v3";
    const browserCurrency = detectCurrencyFromBrowser();
    const cached = sessionStorage.getItem(GEO_CACHE_KEY) as
      | "USD"
      | "AED"
      | "INR"
      | null;
    if (cached && ["AED", "INR"].includes(cached)) {
      setCurrency(cached);
      return;
    }
    if (browserCurrency !== "USD") {
      setCurrency(browserCurrency);
      sessionStorage.setItem(GEO_CACHE_KEY, browserCurrency);
      return;
    }

    if (cached === "USD") {
      setCurrency(cached);
      return;
    }

    const AED_COUNTRIES = new Set(["AE"]);
    const INR_COUNTRIES = new Set(["IN", "PK", "LK"]);

    // First try the local geo API which runs server-side and has edge header support
    fetch("/api/geo")
      .then((r) => {
        if (!r.ok) throw new Error("Local geo API failed");
        return r.json();
      })
      .then((data) => {
        if (data.currency && ["USD", "AED", "INR"].includes(data.currency)) {
          setCurrency(data.currency);
          sessionStorage.setItem(GEO_CACHE_KEY, data.currency);
        } else {
          throw new Error("Invalid currency returned from local API");
        }
      })
      .catch((err) => {
        console.warn(
          "[geo-detect] Local geo API lookup failed, falling back to ipapi.co:",
          err,
        );
        // Fallback to client-side ipapi.co (might be blocked by adblockers)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        fetch("https://ipapi.co/json/", {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        })
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((data: { country_code?: string; error?: boolean }) => {
            if (data.error) throw new Error();
            const code = (data.country_code || "").toUpperCase();
            let detected: "USD" | "AED" | "INR" = "USD";
            if (AED_COUNTRIES.has(code)) detected = "AED";
            else if (INR_COUNTRIES.has(code)) detected = "INR";
            setCurrency(detected);
            sessionStorage.setItem(GEO_CACHE_KEY, detected);
          })
          .catch(() => {
            setCurrency("USD");
          })
          .finally(() => clearTimeout(timeout));
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    if (!resumeFile) {
      setResumePreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(resumeFile);
    setResumePreviewUrl(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [resumeFile]);

  const experienceOptions: DropdownOption[] = [
    {
      value: "Junior",
      label: "Junior (0-2 years)",
    },
    {
      value: "Mid-level",
      label: "Mid-level (2-5 years)",
    },
    {
      value: "Senior",
      label: "Senior (5+ years)",
    },
  ];

  const difficultyOptions: DropdownOption[] = [
    {
      value: "Easy",
      label: "Easy (Conversational)",
    },
    {
      value: "Medium",
      label: "Medium (Standard)",
    },
    {
      value: "Hard",
      label: "Hard (Deep dive)",
    },
  ];

  const careerGoalOptions: DropdownOption[] = [
    { value: "Get hired for this job", label: "Get hired for this job" },
    { value: "Switch to this industry", label: "Switch to this industry" },
    { value: "Move into a senior / leadership role", label: "Move into a senior / leadership role" },
    { value: "Returning after a career break", label: "Returning after a career break" },
    { value: "Practice and sharpen interview skills", label: "Practice and sharpen interview skills" },
    { value: "Prepare for a specific company", label: "Prepare for a specific company" },
  ];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.candidateName.trim() ||
      !form.candidateEmail.trim() ||
      !form.jobRole.trim() ||
      !form.experienceLevel.trim() ||
      !form.difficultyLevel.trim() ||
      !form.jobDescription.trim()
    ) {
      toast.error("Validation Error", {
        description:
          "Please fill out your role, experience level, difficulty level, and job description before continuing.",
      });
      return;
    }

    if (!form.careerGoal) {
      toast.error("Career Goal Required", {
        description: "Please select your main career goal so we can personalise your interview.",
      });
      return;
    }

    if (!resumeFile) {
      toast.error("Resume Required", {
        description:
          "Please upload your resume to personalize your custom mock interview.",
      });
      return;
    }

    setGenerating(true);
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
        toast.error("Resume Upload Failed", {
          description: errMsg,
        });
        setGenerating(false);
        return;
      }

      resumeUrl = uploadData.resumeUrl;
      resumeText = uploadData.resumeText;

      // 2. Generate custom template via public API endpoint
      const genRes = await fetch("/api/interviews/custom-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: form.jobRole,
          experienceLevel: form.experienceLevel,
          difficultyLevel: form.difficultyLevel,
          durationMinutes: 30,
          jobDescription: form.jobDescription,
          resumeText,
          interviewPrepPurchaseId: form.hasPurchasedPrep && form.interviewPrepPurchaseId.trim() ? form.interviewPrepPurchaseId.trim() : undefined,
        }),
      });

      const genData = await genRes.json();
      if (!genRes.ok || !genData.templateId) {
        toast.error("Interview Generation Failed", {
          description:
            genData.error || "Could not design custom interview template.",
        });
        setGenerating(false);
        return;
      }

      setGeneratedTemplateId(genData.templateId);

      // 3. Initialize Stripe payment details using the generated template ID
      setSubmitting(true);
      const payRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceNames: ["AI Mock Interview"],
          candidateName: form.candidateName,
          candidateEmail: form.candidateEmail,
          candidatePhone: form.candidatePhone,
          currency: displayCurrency,
          interviewMetadata: {
            templateId: genData.templateId,
            linkedInUrl: form.linkedInUrl,
            interviewPreference: "AI",
            resumeUrl,
            resumeText,
            careerGoal: form.careerGoal || undefined,
            focusAreas: form.focusAreas || undefined,
            selfIntroNotes: form.selfIntroNotes || undefined,
          },
        }),
      });

      const payData = await payRes.json();
      if (!payRes.ok || !payData.clientSecret) {
        toast.error("Checkout Setup Failed", {
          description: payData.error || "Could not initialize Stripe session.",
        });
        setSubmitting(false);
        setGenerating(false);
        return;
      }

      setClientSecret(payData.clientSecret);
      setPaymentStage("checkout");
      setTimeout(() => {
        containerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    } catch (err) {
      toast.error("Connection Error", {
        description: "Check your internet connection and try again.",
      });
    } finally {
      setGenerating(false);
      setSubmitting(false);
      setUploadingResume(false);
    }
  };

  const handleCancelCheckout = () => {
    setPaymentStage("form");
    setClientSecret(null);
    setTimeout(() => {
      containerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  return (
    <div
      className="min-h-screen bg-[#F9F9FB] text-[#252E3D]"
      style={{ fontFamily: "Raleway, sans-serif" }}
      ref={containerRef}
    >
      <main className="mx-auto max-w-4xl px-4 md:px-6 pt-28 sm:pt-36 md:pt-24 pb-16 md:pb-24">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-[#252e3d] mb-4">
            Practice with your own Job Description
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed">
            Enter your target job details and paste the Job Description. Our AI
            will analyze the JD and build a completely customized, interactive
            voice mock interview matching the skills, responsibilities, and tech
            stack of that specific role.
          </p>
        </div>

        {/* Loader Overlay */}
        {(generating || submitting || uploadingResume) && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl border border-slate-100 flex flex-col items-center">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-[#5a58ab]/10 border-t-[#5a58ab]" />
                <IoSparkles className="w-6 h-6 text-[#5a58ab] absolute top-4 left-4 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-[#252e3d] mb-2">
                {uploadingResume
                  ? "Analyzing Resume"
                  : "Analyzing Job Description"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {uploadingResume
                  ? "Extracting tech stack, experience points, and preparing personalized questions..."
                  : "Our AI is designing custom interview modules, extracting keywords, and assembling voice instructions. This takes about 10-15 seconds..."}
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Form vs Checkout Layout */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-3xs overflow-hidden transition-all duration-300">
          <div className="p-6 sm:p-8 md:p-10">
            {paymentStage === "form" ? (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <h2
                  className="text-2xl font-semibold text-[#252e3d] border-b border-slate-100 pb-3"
                  style={{ fontFamily: "Crimson Text, serif" }}
                >
                  Configure Custom Interview
                </h2>

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
                      value={form.candidateName}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm px-4 py-3 outline-none transition"
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
                      className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm px-4 py-3 outline-none transition"
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
                      value={form.candidatePhone}
                      onChange={handleChange}
                      placeholder="e.g. +91 99999 99999"
                      className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm px-4 py-3 outline-none transition"
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
                      className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm px-4 py-3 outline-none transition"
                    />
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
                  {resumeError && (
                    <p className="text-red-500 text-xs mt-1 font-semibold">
                      {resumeError}
                    </p>
                  )}
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
                      className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm px-4 py-3 outline-none transition"
                    />
                  </div>
                  <div>
                    <PremiumDropdown
                      label="Experience Level"
                      value={form.experienceLevel}
                      options={experienceOptions}
                      placeholder="Select experience level"
                      onChange={(nextValue) =>
                        setForm((prev) => ({
                          ...prev,
                          experienceLevel: nextValue,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <PremiumDropdown
                      label="Difficulty Level"
                      value={form.difficultyLevel}
                      options={difficultyOptions}
                      placeholder="Select difficulty level"
                      onChange={(nextValue) =>
                        setForm((prev) => ({
                          ...prev,
                          difficultyLevel: nextValue,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Job Description Paste Box */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Job Description <span className="text-[#5a58ab]">*</span>
                  </label>
                  <textarea
                    name="jobDescription"
                    required
                    value={form.jobDescription}
                    onChange={handleChange}
                    rows={8}
                    placeholder="Paste the full job description here (responsibilities, technical requirements, stack, credentials...)"
                    className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm px-4 py-3 outline-none transition resize-y font-mono text-xs sm:text-sm"
                  />
                </div>

                {/* Personalisation fields */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Personalise Your Interview</h3>
                  <PremiumDropdown
                    label="Main Career Goal *"
                    value={form.careerGoal}
                    options={careerGoalOptions}
                    placeholder="Select your primary goal…"
                    onChange={(nextValue) =>
                      setForm((prev) => ({ ...prev, careerGoal: nextValue }))
                    }
                  />
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                      Focus Areas <span className="text-slate-400 normal-case font-normal">(optional)</span>
                    </label>
                    <textarea
                      name="focusAreas"
                      value={form.focusAreas}
                      onChange={handleChange}
                      rows={2}
                      placeholder="e.g. system design, SQL, behavioural questions…"
                      className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm px-4 py-3 outline-none transition resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                      Anything you'd like the AI interviewer to know? <span className="text-slate-400 normal-case font-normal">(optional)</span>
                    </label>
                    <textarea
                      name="selfIntroNotes"
                      value={form.selfIntroNotes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="e.g. I have a 2-year gap due to caregiving, I'm pivoting from finance to tech…"
                      className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm px-4 py-3 outline-none transition resize-none"
                    />
                  </div>

                  <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center mt-0.5">
                        <input
                          type="checkbox"
                          name="hasPurchasedPrep"
                          checked={form.hasPurchasedPrep}
                          onChange={(e) => setForm(prev => ({ ...prev, hasPurchasedPrep: e.target.checked }))}
                          className="w-4.5 h-4.5 appearance-none border-2 border-slate-300 rounded cursor-pointer checked:bg-[#5a58ab] checked:border-[#5a58ab] transition-colors peer"
                        />
                        <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">I have previously purchased Interview Prep services</span>
                        <span className="text-xs text-[#5a58ab] font-medium mt-0.5">Checking this box will include your uploaded preparation document into the AI model's context to craft customized interview questions based on your prep material.</span>
                      </div>
                    </label>

                    {form.hasPurchasedPrep && (
                      <div className="pt-2 pl-7 animate-fadeIn space-y-2.5">
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
                </div>

                {/* Submit button */}
                <div className="pt-4 flex items-center justify-between gap-4 border-t border-slate-100">
                  <div className="text-left">
                    <p className="text-xs text-slate-400">Total Price:</p>
                    <p className="text-lg font-bold text-[#252e3d]">
                      {displayCurrency} {totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#5a58ab] hover:bg-[#4a489b] active:scale-95 text-white font-semibold text-sm px-6 py-3.5 shadow-md flex items-center gap-2 transition cursor-pointer"
                  >
                    <span>Generate & Proceed</span>
                    <IoArrowForwardOutline className="w-4.5 h-4.5" />
                  </button>
                </div>
              </form>
            ) : (
              // Checkout stage
              clientSecret && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2
                        className="text-2xl font-semibold text-[#252e3d]"
                        style={{ fontFamily: "Crimson Text, serif" }}
                      >
                        Secure Payment
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Tailored AI Mock Interview for:{" "}
                        <strong>{form.jobRole}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Amount
                      </p>
                      <p className="text-xl font-bold text-[#5a58ab]">
                        {displayCurrency} {totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: "stripe" as const,
                        variables: {
                          colorPrimary: "#5a58ab",
                          colorBackground: "#ffffff",
                          colorText: "#252e3d",
                          colorDanger: "#df1b41",
                          fontFamily: "Raleway, sans-serif",
                          spacingUnit: "4px",
                          borderRadius: "12px",
                        },
                      },
                    }}
                  >
                    <CheckoutForm
                      totalAmount={totalAmount}
                      currency={displayCurrency}
                      clientSecret={clientSecret}
                      onCancel={handleCancelCheckout}
                    />
                  </Elements>
                </div>
              )
            )}
          </div>
        </div>

        {resumePreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-sm">
            <div className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Resume Preview
                  </p>
                  <h3 className="text-lg font-semibold text-[#252e3d]">
                    {resumeFile?.name || "Uploaded resume"}
                  </h3>
                </div>

                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (resumePreviewUrl) {
                        window.open(
                          resumePreviewUrl,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      }
                    }}
                    disabled={!resumePreviewUrl}
                    className="rounded-full border border-[#5a58ab]/20 bg-[#f4f3ff] px-4 py-2 text-xs font-semibold text-[#5a58ab] transition hover:bg-[#ebe9ff] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Open in new tab
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumePreviewOpen(false)}
                    className="ml-3 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-[#252e3d]"
                    aria-label="Close resume preview"
                  >
                    <IoCloseOutline className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-slate-50 min-h-0">
                {resumeFile?.type === "application/pdf" ? (
                  <iframe
                    src={resumePreviewUrl ?? undefined}
                    title="Resume preview"
                    className="h-full w-full border-0"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-8 text-center">
                    <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <p className="text-base font-semibold text-[#252e3d]">
                        Preview available for PDF files only
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Please upload a PDF resume to preview it in the popup.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
