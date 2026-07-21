"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import Cal, { getCalApi } from "@calcom/embed-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { IoAlertCircle, IoLockClosed, IoCheckmarkCircle, IoClose, IoCalendarOutline } from "react-icons/io5";
import { useLenis } from "@/app/providers/lenis-provider";
import { detectCurrencyFromBrowser } from "@/lib/geo-utils";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

type Props = {
  templateId: string;
  jobRole: string;
  defaultPreference?: "AI" | "MANUAL";
  hidePreferenceSelection?: boolean;
};

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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Stripe PaymentElement */}
      <PaymentElement />

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm flex items-start gap-2">
          <IoAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 rounded-xl border border-[#e0e0e0] px-4 py-3 text-sm font-semibold text-[#252e3d] transition hover:bg-gray-50 disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={processing || !stripe || !elements}
          className="flex-[2] rounded-xl bg-[#5a58ab] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4a489b] disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
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

// ─── Main Apply Form ─────────────────────────────────────────────────────────
export default function ApplyForm({
  templateId,
  jobRole,
  defaultPreference = "AI",
  hidePreferenceSelection = false,
}: Props) {
  const { lenis } = useLenis();
  const [form, setForm] = useState({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    linkedInUrl: "",
    interviewPreference: defaultPreference as "AI" | "MANUAL" | "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  // Payment state — shared by both AI and MANUAL flows
  const [currency, setCurrency] = useState<"USD" | "AED" | "INR">("USD");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStage, setPaymentStage] = useState<"form" | "checkout">("form");

  // Derive prices directly from currency
  const aiPrice = currency === "AED" ? 99 : currency === "INR" ? 499 : 39;
  const coachPrice = currency === "AED" ? 99 : currency === "INR" ? 499 : 39;

  // Detect currency using local /api/geo first, then ipapi.co
  useEffect(() => {
    const GEO_CACHE_KEY = "jb_currency_v3";
    const browserCurrency = detectCurrencyFromBrowser();

    // Clean up stale keys from older versions
    sessionStorage.removeItem("jb_currency");
    sessionStorage.removeItem("jb_currency_v2");

    const cached = sessionStorage.getItem(GEO_CACHE_KEY) as "USD" | "AED" | "INR" | null;
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
        console.warn("[geo-apply] Local geo API lookup failed, falling back to ipapi.co:", err);
        // Fallback to client-side ipapi.co (might be blocked by adblockers)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        fetch("https://ipapi.co/json/", {
          headers: { "Accept": "application/json" },
          signal: controller.signal,
        })
          .then((r) => {
            if (!r.ok) throw new Error(`ipapi.co status: ${r.status}`);
            return r.json();
          })
          .then((data: { country_code?: string; error?: boolean }) => {
            if (data.error) throw new Error("ipapi.co returned an error response");
            const code = (data.country_code || "").toUpperCase();
            let detected: "USD" | "AED" | "INR" = "USD";
            if (AED_COUNTRIES.has(code)) detected = "AED";
            else if (INR_COUNTRIES.has(code)) detected = "INR";
            console.log(`[geo-apply] Detected country: ${code} → currency: ${detected}`);
            setCurrency(detected);
            sessionStorage.setItem(GEO_CACHE_KEY, detected);
          })
          .catch((fallbackErr) => {
            console.warn("[geo-apply] Could not detect location, defaulting to USD:", fallbackErr.message);
          })
          .finally(() => clearTimeout(timeout));
      });
  }, []);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const containerRef = useRef<HTMLDivElement | null>(null);

  // ── Shared payment init — used by both AI and MANUAL ────────────────────
  const handlePaymentInit = async (pref: "AI" | "MANUAL") => {
    setSubmitting(true);
    setResumeError(null);
    let resumeUrl: string | null = null;
    let resumeText: string | null = null;

    try {
      // Upload resume if file is present
      if (resumeFile) {
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
          setSubmitting(false);
          return;
        }

        resumeUrl = uploadData.resumeUrl;
        resumeText = uploadData.resumeText;
      } else if (pref === "AI") {
        toast.error("Resume Required", {
          description: "Please upload your resume to personalize your AI Mock Interview.",
        });
        setSubmitting(false);
        return;
      }

      const serviceName = pref === "AI" ? "AI Mock Interview" : "Coach Mock Interview";
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceNames: [serviceName],
          candidateName: form.candidateName,
          candidateEmail: form.candidateEmail,
          candidatePhone: form.candidatePhone,
          currency,
          interviewMetadata: {
            templateId,
            linkedInUrl: form.linkedInUrl,
            interviewPreference: pref,
            resumeUrl,
            resumeText,
          },
        }),
      });
      const data = (await res.json()) as { clientSecret?: string; error?: string };
      if (!res.ok || !data.clientSecret) {
        toast.error("Payment Setup Failed", {
          description: data.error ?? "Could not initialise payment. Please try again.",
        });
        return;
      }
      setClientSecret(data.clientSecret);
      setPaymentStage("checkout");
      setTimeout(() => {
        const element = containerRef.current;
        if (element) {
          if (lenis) {
            lenis.scrollTo(element, { offset: -120, duration: 1.2 });
          } else {
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
              top: elementPosition - 120,
              behavior: "smooth",
            });
          }
        }
      }, 50);
    } catch (prevError) {
      toast.error("Network Error", { description: "Check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.interviewPreference) {
      toast.error("Please select a session preference.", {
        description: "Choose AI Mock Interview or Coach Session to continue.",
      });
      return;
    }
    if (form.interviewPreference === "AI" && !resumeFile) {
      toast.error("Resume Required", {
        description: "Please upload your resume to personalize your AI Mock Interview.",
      });
      return;
    }
    await handlePaymentInit(form.interviewPreference as "AI" | "MANUAL");
  };


  // ─── Render: Stripe checkout (AI flow — after form submit) ────────────────
  if (paymentStage === "checkout" && clientSecret) {
    const stripeAppearance = {
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
    };

    return (
      <div ref={containerRef}>
        <div
          className="rounded-2xl border border-[#e0e0e0] bg-white p-6"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          {/* Header */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#5a58ab]">
                <IoLockClosed className="w-4 h-4" />
              </span>
              <h3
                className="text-lg font-semibold text-[#252e3d]"
                style={{ fontFamily: "Crimson Text, serif" }}
              >
                Secure Checkout
              </h3>
            </div>
            <p className="text-xs text-gray-500">
              Complete payment to receive your AI mock interview link by email.
            </p>
          </div>

          {/* Order summary */}
          <div className="bg-[#f8f7ff] border border-[#e8e7f8] rounded-xl p-4 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#5a58ab] uppercase tracking-wide mb-0.5">
                  {form.interviewPreference === "AI" ? "AI Mock Interview" : "Coach Mock Interview"}
                </p>
                <p className="text-xs text-gray-500">{jobRole}</p>
              </div>
              <span className="text-lg font-bold text-[#252e3d]">
                {currency} {(form.interviewPreference === "AI" ? aiPrice : coachPrice).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stripe form */}
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
            <CheckoutForm
              totalAmount={form.interviewPreference === "AI" ? aiPrice : coachPrice}
              currency={currency}
              clientSecret={clientSecret}
              onCancel={() => {
                setPaymentStage("form");
                setClientSecret(null);
                setTimeout(() => {
                  const element = containerRef.current;
                  if (element) {
                    if (lenis) {
                      lenis.scrollTo(element, { offset: -120, duration: 1.2 });
                    } else {
                      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                      window.scrollTo({
                        top: elementPosition - 120,
                        behavior: "smooth",
                      });
                    }
                  }
                }, 50);
              }}
            />
          </Elements>
        </div>
      </div>
    );
  }

  // ─── Render: Main booking form ────────────────────────────────────────────
  const inputClass =
    "w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-2.5 text-sm text-[#252e3d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5a58ab]/40 focus:border-[#5a58ab]";
  const labelClass =
    "block text-xs font-semibold text-[#252e3d] mb-1.5 uppercase tracking-wide";

  const isAI = form.interviewPreference === "AI";

  return (
    <div ref={containerRef}>
      <div
        className="rounded-2xl border border-[#e0e0e0] bg-white p-6"
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        <h2
          className="text-xl font-semibold text-[#252e3d] mb-1"
          style={{ fontFamily: "Crimson Text, serif" }}
        >
          Book Mock Interview: {jobRole}
        </h2>
        <p className="text-xs text-gray-500 mb-5">All fields marked * are required.</p>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="candidateName">Full Name *</label>
            <input
              id="candidateName"
              name="candidateName"
              type="text"
              required
              value={form.candidateName}
              onChange={handleChange}
              placeholder="Jane Smith"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="candidateEmail">Email Address *</label>
            <input
              id="candidateEmail"
              name="candidateEmail"
              type="email"
              required
              value={form.candidateEmail}
              onChange={handleChange}
              placeholder="jane@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="candidatePhone">Phone Number</label>
            <input
              id="candidatePhone"
              name="candidatePhone"
              type="tel"
              value={form.candidatePhone}
              onChange={handleChange}
              placeholder="+1 555 000 0000"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="linkedInUrl">LinkedIn URL</label>
            <input
              id="linkedInUrl"
              name="linkedInUrl"
              type="url"
              value={form.linkedInUrl}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="resume">Resume (PDF, Word, or Text) {form.interviewPreference === "AI" ? "*" : ""}</label>
            <input
              id="resume"
              name="resume"
              type="file"
              required={form.interviewPreference === "AI"}
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={(e) => {
                setResumeError(null);
                setResumeFile(e.target.files?.[0] || null);
              }}
              className={`${inputClass} file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#5a58ab]/10 file:text-[#5a58ab] hover:file:bg-[#5a58ab]/20`}
            />
            {resumeError && (
              <p className="text-red-500 text-xs mt-1 font-semibold">{resumeError}</p>
            )}
          </div>

          {/* Session Preference Cards */}
          {!hidePreferenceSelection && (
            <div>
              <p className={labelClass}>Session Preference *</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(["AI", "MANUAL"] as const).map((pref) => (
                  <label
                    key={pref}
                    className={`flex cursor-pointer flex-col rounded-xl border-2 p-3 transition ${
                      form.interviewPreference === pref
                        ? "border-[#5a58ab] bg-[#f0efff]"
                        : "border-[#e0e0e0] bg-[#fafafa] hover:border-[#5a58ab]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="interviewPreference"
                      value={pref}
                      checked={form.interviewPreference === pref}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-sm font-semibold text-[#252e3d]">
                      {pref === "AI" ? "AI Mock Interview" : "Coach Session"}
                    </span>
                    <span className="mt-1 text-xs text-gray-500">
                      {pref === "AI"
                        ? `Instant voice interview · ${currency} ${aiPrice.toLocaleString()}`
                        : `Coach-led session · ${currency} ${coachPrice.toLocaleString()}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Payment notice — shown for both AI and MANUAL once selected */}
          {form.interviewPreference !== "" && (
            <div className="rounded-xl bg-[#f8f7ff] border border-[#e0dfff] px-4 py-3 flex items-start gap-2.5">
              <IoLockClosed className="w-4 h-4 text-[#5a58ab] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">
                {form.interviewPreference === "AI" ? (
                  <>
                    A secure Stripe payment of{" "}
                    <strong>{currency} {aiPrice.toLocaleString()}</strong>{" "}
                    is required. Your unique interview link will be emailed to you immediately after
                    payment — valid for 7 days and usable only once.
                  </>
                ) : (
                  <>
                    A secure Stripe payment of{" "}
                    <strong>{currency} {coachPrice.toLocaleString()}</strong>{" "}
                    is required. A Cal.com scheduling link will be emailed to you immediately after
                    payment so you can pick your preferred date and time.
                  </>
                )}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#252e3d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2d3645] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                {uploadingResume ? "Processing Resume…" : "Initialising Payment…"}
              </>
            ) : (
              <>
                <IoLockClosed className="w-4 h-4" />
                {form.interviewPreference === "AI"
                  ? "Pay & Book AI Interview"
                  : form.interviewPreference === "MANUAL"
                  ? "Pay & Book Coach Session"
                  : "Select a Session to Continue"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Shared success card ─────────────────────────────────────────────────────
function SuccessCard({ message }: { message: string }) {
  return (
    <div
      className="rounded-2xl border border-[#e0e0e0] bg-white p-6 text-center"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <IoCheckmarkCircle className="w-10 h-10 text-[#5a58ab] mx-auto mb-3" />
      <h3
        className="text-lg font-semibold text-[#252e3d] mb-2"
        style={{ fontFamily: "Crimson Text, serif" }}
      >
        All Done!
      </h3>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
}

// ─── Full-screen Cal.com Overlay ───────────────────────────────────────────────
interface CalOverlayProps {
  calLink: string;
  candidateName: string;
  candidateEmail: string;
  applicationId: string;
  onSuccess: () => void;
}

function CalOverlay({
  calLink,
  candidateName,
  candidateEmail,
  applicationId,
  onSuccess,
}: CalOverlayProps) {
  // Lock body scroll while overlay is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Wire up Cal.com API and listen for booking success
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cal = await getCalApi();
        if (!mounted) return;
        cal("ui", {
          theme: "light",
          styles: { branding: { brandColor: "#5a58ab" } },
          hideEventTypeDetails: false,
          layout: "month_view",
        });
        cal("on", {
          action: "bookingSuccessful",
          callback: () => { if (mounted) onSuccess(); },
        });
      } catch (err) {
        console.error("Cal.com init error", err);
      }
    })();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-[#f5f5f8]/95 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative flex flex-col h-full max-h-full">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e0e0] bg-white shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f0efff] flex items-center justify-center">
              <IoCalendarOutline className="w-5 h-5 text-[#5a58ab]" />
            </div>
            <div>
              <h2
                className="text-base font-semibold text-[#252e3d] leading-tight"
                style={{ fontFamily: "Crimson Text, serif" }}
              >
                Select Your Interview Slot
              </h2>
              <p className="text-xs text-gray-400">
                Choose a date on the left, then pick a time on the right
              </p>
            </div>
          </div>

          {/* JB branding pill */}
          <div className="hidden sm:flex items-center gap-2 bg-[#f0efff] rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-[#5a58ab] animate-pulse" />
            <span className="text-xs font-semibold text-[#5a58ab]">JB Recruitment</span>
          </div>
        </div>

        {/* Cal.com embed — fills remaining height */}
        <div className="flex-1 overflow-hidden">
          <Cal
            calLink={calLink}
            style={{ width: "100%", height: "100%" }}
            config={{
              name: candidateName,
              email: candidateEmail,
              "metadata[applicationId]": applicationId,
            }}
          />
        </div>
      </div>
    </div>
  );
}
