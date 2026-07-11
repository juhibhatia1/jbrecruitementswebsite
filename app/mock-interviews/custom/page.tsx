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
  IoArrowForwardOutline,
} from "react-icons/io5";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

// ─── Stripe inner checkout form ─────────────────────────────────────────────
interface CheckoutFormProps {
  totalAmount: number;
  currency: string;
  clientSecret: string;
  onCancel: () => void;
}

function CheckoutForm({ totalAmount, currency, clientSecret, onCancel }: CheckoutFormProps) {
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
      process.env.NEXT_PUBLIC_APP_URL ||
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
          : "An unexpected error occurred."
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
    experienceLevel: "Mid-level",
    difficultyLevel: "Medium",
    jobDescription: "",
  });

  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "AED" | "INR" | "">("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStage, setPaymentStage] = useState<"form" | "checkout">("form");
  const [generatedTemplateId, setGeneratedTemplateId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Price calculations
  const totalAmount = currency === "AED" ? 150 : currency === "INR" ? 3500 : 40;
  const displayCurrency = currency || "USD";

  // Location currency detection
  useEffect(() => {
    const GEO_CACHE_KEY = "jb_currency_v3";
    const cached = sessionStorage.getItem(GEO_CACHE_KEY) as "USD" | "AED" | "INR" | null;
    if (cached && ["USD", "AED", "INR"].includes(cached)) {
      setCurrency(cached);
      return;
    }

    const AED_COUNTRIES = new Set(["AE"]);
    const INR_COUNTRIES = new Set(["IN", "PK", "LK"]);

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
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.candidateName.trim() || !form.candidateEmail.trim() || !form.jobRole.trim() || !form.jobDescription.trim()) {
      toast.error("Validation Error", { description: "Please fill out all required fields." });
      return;
    }

    setGenerating(true);

    try {
      // 1. Generate custom template via public API endpoint
      const genRes = await fetch("/api/interviews/custom-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: form.jobRole,
          experienceLevel: form.experienceLevel,
          difficultyLevel: form.difficultyLevel,
          jobDescription: form.jobDescription,
        }),
      });

      const genData = await genRes.json();
      if (!genRes.ok || !genData.templateId) {
        toast.error("Interview Generation Failed", {
          description: genData.error || "Could not design custom interview template.",
        });
        setGenerating(false);
        return;
      }

      setGeneratedTemplateId(genData.templateId);

      // 2. Initialize Stripe payment details using the generated template ID
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
        containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (err) {
      toast.error("Connection Error", { description: "Check your internet connection and try again." });
    } finally {
      setGenerating(false);
      setSubmitting(false);
    }
  };

  const handleCancelCheckout = () => {
    setPaymentStage("form");
    setClientSecret(null);
    setTimeout(() => {
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <div
      className="min-h-screen bg-[#F9F9FB] text-[#252E3D]"
      style={{ fontFamily: "Raleway, sans-serif" }}
      ref={containerRef}
    >
      <main className="mx-auto max-w-4xl px-4 md:px-6 pt-28 sm:pt-36 md:pt-32 pb-16 md:pb-24">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <a
            href="/mock-interviews"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#5a58ab] transition"
          >
            <IoChevronBackOutline className="w-3.5 h-3.5" />
            Back to Sessions
          </a>
        </div>

        {/* Heading */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-[#252e3d] mb-4">
            Practice with your own Job Description
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed">
            Enter your target job details and paste the Job Description. Our AI will analyze the JD
            and build a completely customized, interactive voice mock interview matching the skills,
            responsibilities, and tech stack of that specific role.
          </p>
        </div>

        {/* Loader Overlay */}
        {(generating || submitting) && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl border border-slate-100 flex flex-col items-center">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-[#5a58ab]/10 border-t-[#5a58ab]" />
                <IoSparkles className="w-6 h-6 text-[#5a58ab] absolute top-4 left-4 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-[#252e3d] mb-2">Analyzing Job Description</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our AI is designing custom interview modules, extracting keywords, and assembling voice
                instructions. This takes about 10-15 seconds...
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Form vs Checkout Layout */}
        <div className="bg-white border border-slate-150 rounded-2xl shadow-3xs overflow-hidden transition-all duration-300">
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
                      Phone Number (optional)
                    </label>
                    <input
                      type="tel"
                      name="candidatePhone"
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

                {/* Job Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                      Job Title / Target Role <span className="text-[#5a58ab]">*</span>
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
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                      Experience Level
                    </label>
                    <select
                      name="experienceLevel"
                      value={form.experienceLevel}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm px-4 py-3.5 outline-none transition"
                    >
                      <option value="Junior">Junior (0-2 years)</option>
                      <option value="Mid-level">Mid-level (2-5 years)</option>
                      <option value="Senior">Senior (5+ years)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                      Difficulty Level
                    </label>
                    <select
                      name="difficultyLevel"
                      value={form.difficultyLevel}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 focus:border-[#5a58ab] focus:ring-1 focus:ring-[#5a58ab] bg-slate-50/50 text-sm px-4 py-3.5 outline-none transition"
                    >
                      <option value="Easy">Easy (Conversational)</option>
                      <option value="Medium">Medium (Standard recruiter)</option>
                      <option value="Hard">Hard (Deep dive & code issues)</option>
                    </select>
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
                        Tailored AI Mock Interview for: <strong>{form.jobRole}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Amount</p>
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
      </main>
    </div>
  );
}
