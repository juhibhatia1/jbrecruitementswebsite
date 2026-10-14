"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { IoClose, IoAlertCircle, IoShieldCheckmark } from "react-icons/io5";
import { FaLinkedin, FaArrowRight, FaTag, FaCheckCircle, FaStar } from "react-icons/fa";
import { useDetectCurrency } from "@/lib/hooks/useDetectCurrency";
import { useLenis } from "@/app/providers/lenis-provider";
import { PayUCheckout } from "../payments/payu-checkout";
import { clearCachedCurrency } from "@/lib/geo-utils";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

export type PackageSelection = "consultation" | "3-month" | "6-month" | "general";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage?: PackageSelection;
}

interface CreditInfo {
  hasCredit: boolean;
  creditAmountUSD?: number;
  creditAmountINR?: number;
  consultationId?: string;
  alreadyRedeemed?: boolean;
}

export default function InquiryModal({
  isOpen,
  onClose,
  selectedPackage = "general",
}: InquiryModalProps) {
  const currency = useDetectCurrency();
  const isIndianUser = currency === "INR";
  const { lenis } = useLenis();

  // Determine which service was directly selected
  const is3Month = selectedPackage === "3-month";
  const is6Month = selectedPackage === "6-month";
  const isRetainer = is3Month || is6Month;

  const serviceName = is3Month
    ? "LinkedIn Brand Launch"
    : is6Month
    ? "LinkedIn Brand Authority"
    : "Personal Branding Consultation";

  const serviceTitle = is3Month
    ? "LinkedIn Brand Launch (3 Months)"
    : is6Month
    ? "LinkedIn Brand Authority (6 Months)"
    : "Personal Branding Strategy Consultation";

  const badgeText = is3Month
    ? "3-Month Retainer · Foundation Tier"
    : is6Month
    ? "6-Month Retainer · Authority Tier"
    : "Executive Strategy Consultation · Juhi Bhatia";

  const rawBasePrice = is3Month
    ? (isIndianUser ? 265000 : 3000)
    : is6Month
    ? (isIndianUser ? 485000 : 5000)
    : (isIndianUser ? 25000 : 300);

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [notes, setNotes] = useState("");

  // Credit lookup states (for 3-month and 6-month retainers)
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [isCheckingCredit, setIsCheckingCredit] = useState(false);

  // Checkout states
  const [step, setStep] = useState<"details" | "payment">("details");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [payuData, setPayuData] = useState<{
    paymentUrl: string;
    metadata: Record<string, string>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronize when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("details");
      setClientSecret(null);
      setPayuData(null);
      setError(null);
      setCreditInfo(null);
    }
  }, [isOpen, selectedPackage]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (lenis) lenis.stop();
    } else {
      document.body.style.overflow = "";
      if (lenis) lenis.start();
    }
    return () => {
      document.body.style.overflow = "";
      if (lenis) lenis.start();
    };
  }, [isOpen, lenis]);

  // Debounced credit check for retainer packages when email changes
  useEffect(() => {
    if (!isRetainer) {
      setCreditInfo(null);
      return;
    }

    const emailClean = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailClean || !emailRegex.test(emailClean)) {
      setCreditInfo(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsCheckingCredit(true);
        const res = await fetch("/api/personal-branding/check-credit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailClean }),
        });
        if (res.ok) {
          const data: CreditInfo = await res.json();
          setCreditInfo(data);
        } else {
          setCreditInfo(null);
        }
      } catch {
        setCreditInfo(null);
      } finally {
        setIsCheckingCredit(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [email, isRetainer]);

  if (!isOpen) return null;

  const consultationCreditDeduction =
    isRetainer && creditInfo?.hasCredit ? (isIndianUser ? 25000 : 300) : 0;
  const finalPrice = Math.max(0, rawBasePrice - consultationCreditDeduction);

  const formatMoney = (amount: number) => {
    return isIndianUser
      ? `₹${amount.toLocaleString("en-IN")}`
      : `$${amount.toLocaleString("en-US")}`;
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    const candidateName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const emailClean = email.trim();
    const phoneClean = phone.trim();
    const phoneDigits = phoneClean.replace(/\D/g, "");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s\-\(\)\.]{6,20}$/;

    if (!firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }
    if (!lastName.trim()) {
      setError("Please enter your last name.");
      return;
    }
    if (candidateName.length < 3) {
      setError("Please enter your full name.");
      return;
    }
    if (!emailClean || !emailRegex.test(emailClean)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!phoneClean || !phoneRegex.test(phoneClean) || phoneDigits.length < 6 || phoneDigits.length > 15) {
      setError("Please enter a valid WhatsApp phone number with country code (e.g. +1 555 123 4567 or +91 93811 50341).");
      return;
    }

    setLoading(true);
    setError(null);

    const selectedGateway = isIndianUser ? "PAYU" : "STRIPE";

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceNames: [serviceName],
          candidateName,
          candidateEmail: emailClean,
          candidatePhone: phoneClean,
          currency: isIndianUser ? "INR" : "USD",
          paymentGateway: selectedGateway,
          interviewMetadata: {
            serviceType: serviceTitle,
            role: currentRole || "Not specified",
            linkedInUrl: linkedInUrl || "Not specified",
            notes: notes || "None",
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "CURRENCY_MISMATCH") {
          clearCachedCurrency();
          setError(
            data.error || "Currency mismatch detected. Refreshing updated pricing..."
          );
          setTimeout(() => {
            window.location.reload();
          }, 1800);
          return;
        }
        throw new Error(data.error || "Failed to initialize payment session.");
      }

      if (selectedGateway === "PAYU") {
        setPayuData({
          paymentUrl: data.paymentUrl,
          metadata: data.gatewayMetadata,
        });
        setStep("payment");
      } else {
        setClientSecret(data.clientSecret);
        setStep("payment");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const appearance = {
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

  const modalTitle =
    step === "payment"
      ? "Complete Your Payment"
      : is3Month
      ? "Enroll in LinkedIn Brand Launch"
      : is6Month
      ? "Enroll in LinkedIn Brand Authority"
      : "Request Strategy Consultation";

  const modalSubtitle =
    step === "payment"
      ? "Secure encrypted checkout powered by Stripe / PayU."
      : is3Month
      ? "3-Month fully managed personal branding foundation."
      : is6Month
      ? "6-Month comprehensive authority & audience development."
      : "1-on-1 strategic positioning session directly with Juhi Bhatia.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        data-lenis-prevent
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        {/* Header Band */}
        <div className="bg-[#1a1f2b] p-6 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10 cursor-pointer"
            aria-label="Close modal"
          >
            <IoClose className="text-2xl" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5a58ab]/30 border border-[#5a58ab]/40 text-xs font-semibold text-[#a5a3ff] mb-2">
            <IoShieldCheckmark className="text-sm" />
            <span>{badgeText}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
            {modalTitle}
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            {modalSubtitle}
          </p>
        </div>

        {/* Scrollable Modal Content */}
        <div
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          className="p-5 sm:p-7 overflow-y-auto flex-1 min-h-0 space-y-5 scrollbar-thin-styled overscroll-contain"
        >
          {step === "details" ? (
            <>
              {/* Service Overview Card (Locked directly to what the user selected) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#5a58ab]/5 via-white to-emerald-50/40 border border-[#5a58ab]/20 shadow-xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#5a58ab] bg-[#5a58ab]/10 px-2.5 py-0.5 rounded-full">
                      {is6Month ? (
                        <>
                          <FaStar className="text-[10px] text-yellow-500" />
                          6-Month Authority Tier
                        </>
                      ) : is3Month ? (
                        <>
                          <FaCheckCircle className="text-[10px]" />
                          3-Month Foundation Tier
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="text-[10px]" />
                          1-on-1 Strategy Session
                        </>
                      )}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-[#252E3D] mt-1.5">
                      {serviceTitle}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {is3Month
                        ? "Build a strong foundation for your personal brand with a clear strategy, profile optimisation, consistent ghostwritten content, and managed LinkedIn presence."
                        : is6Month
                        ? "Go beyond establishing your presence. Build a recognisable personal brand through a longer-term strategy focused on consistency, authority, and audience development."
                        : "A dedicated strategy call with Juhi Bhatia to review your LinkedIn profile, define your unique positioning, and plan your executive branding roadmap."}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {currency === null ? (
                      <div className="space-y-1 animate-pulse flex flex-col items-end">
                        <div className="h-6 w-24 bg-gray-200 rounded-lg" />
                        <div className="h-3 w-16 bg-gray-100 rounded" />
                      </div>
                    ) : consultationCreditDeduction > 0 ? (
                      <div>
                        <span className="line-through text-gray-400 text-xs block">
                          {formatMoney(rawBasePrice)}
                        </span>
                        <div className="text-xl sm:text-2xl font-extrabold text-[#5a58ab]">
                          {formatMoney(finalPrice)}
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600 block mt-0.5">
                          -{formatMoney(consultationCreditDeduction)} Credit Applied
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xl sm:text-2xl font-extrabold text-[#252E3D]">
                          {formatMoney(finalPrice)}
                        </div>
                        <span className="text-[10px] text-gray-500 block mt-0.5">
                          {isRetainer ? "Full Retainer" : "100% Deductible"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Credit Notice / Guarantee Banner */}
                {!isRetainer ? (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2 text-xs text-emerald-900 bg-emerald-50/80 -mx-1 p-2.5 rounded-xl border border-emerald-200/80">
                    <FaTag className="text-emerald-600 text-xs mt-0.5 flex-shrink-0" />
                    <span className="leading-snug">
                      <strong className="font-bold text-emerald-950">100% Credit Guarantee:</strong> Your entire consultation fee of{" "}
                      {currency === null ? (
                        <span className="inline-block h-3.5 w-14 bg-emerald-200/60 rounded animate-pulse align-middle" />
                      ) : (
                        <strong>{formatMoney(rawBasePrice)}</strong>
                      )}{" "}
                      will be credited and deducted directly from your package invoice if you decide to proceed with our 3-Month or 6-Month retainer.
                    </span>
                  </div>
                ) : creditInfo?.hasCredit ? (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2 text-xs text-emerald-900 bg-emerald-50/90 -mx-1 p-2.5 rounded-xl border border-emerald-300">
                    <FaCheckCircle className="text-emerald-600 text-sm mt-0.5 flex-shrink-0" />
                    <span className="leading-snug">
                      <strong className="font-bold text-emerald-950">🎉 Consultation Credit Applied!</strong> Your previous consultation fee of{" "}
                      {currency === null ? (
                        <span className="inline-block h-3.5 w-14 bg-emerald-200/60 rounded animate-pulse align-middle" />
                      ) : (
                        <strong>{formatMoney(isIndianUser ? 25000 : 300)}</strong>
                      )}{" "}
                      has been verified and deducted directly from this invoice.
                    </span>
                  </div>
                ) : isCheckingCredit ? (
                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                    <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent" />
                    <span>Checking consultation credit for your email...</span>
                  </div>
                ) : (
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-start gap-2 text-xs text-gray-600">
                    <FaTag className="text-[#5a58ab] text-xs mt-0.5 flex-shrink-0" />
                    <span>
                      Previously booked a strategy consultation? Enter the same email below to automatically apply your{" "}
                      {currency === null ? (
                        <span className="inline-block h-3.5 w-14 bg-gray-200 rounded animate-pulse align-middle" />
                      ) : (
                        <strong>{formatMoney(isIndianUser ? 25000 : 300)} deduction</strong>
                      )}
                      .
                    </span>
                  </div>
                )}
              </div>

              {/* Form Input Fields */}
              <form onSubmit={handleProceedToPayment} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5a58ab] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jayakumar"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5a58ab] bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. anand@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5a58ab] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      WhatsApp Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 93811 50341"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5a58ab] bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Current Role / Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Founder, CEO, VP, Consultant"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5a58ab] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      LinkedIn Profile URL
                    </label>
                    <div className="relative">
                      <FaLinkedin className="absolute left-3 top-3 text-[#0077b5] text-sm" />
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        value={linkedInUrl}
                        onChange={(e) => setLinkedInUrl(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5a58ab] bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    {isRetainer
                      ? "Primary Brand Objectives / Focus Areas (Optional)"
                      : "What are your primary goals or questions for this consultation? (Optional)"}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Tell us what you want to achieve or specific branding milestones..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5a58ab] bg-white"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-xs flex items-start gap-2">
                    <IoAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Investment Summary & Checkout CTA */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-600 font-semibold block">Total Investment:</span>
                      <span className="text-[11px] text-gray-400">
                        {isRetainer
                          ? "Direct Retainer Enrollment"
                          : "100% credited toward your retainer package"}
                      </span>
                    </div>
                    <div className="text-right">
                      {currency === null ? (
                        <div className="h-6 w-24 bg-gray-200 rounded-lg animate-pulse inline-block" />
                      ) : consultationCreditDeduction > 0 ? (
                        <div>
                          <span className="line-through text-gray-400 mr-2 text-xs">
                            {formatMoney(rawBasePrice)}
                          </span>
                          <span className="font-extrabold text-[#5a58ab] text-lg sm:text-xl">
                            {formatMoney(finalPrice)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-extrabold text-[#252E3D] text-lg sm:text-xl">
                          {formatMoney(finalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || currency === null}
                    className="w-full py-3.5 px-5 rounded-2xl bg-[#5a58ab] hover:bg-[#4d4a99] text-white font-bold text-sm transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Initializing Secure Payment...</span>
                      </>
                    ) : currency === null ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Detecting Location...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed to Secure Payment ({formatMoney(finalPrice)})</span>
                        <FaArrowRight className="text-xs" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Step 2: Payment Gateway Screen */
            <div className="space-y-5">
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex justify-between items-center text-xs sm:text-sm">
                <div>
                  <div className="font-bold text-[#252E3D]">{serviceTitle}</div>
                  <div className="text-gray-500 text-xs">
                    Client: {firstName} {lastName} ({email})
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-[#5a58ab] text-base">
                    {formatMoney(finalPrice)}
                  </div>
                  <button
                    onClick={() => {
                      setStep("details");
                      setClientSecret(null);
                      setPayuData(null);
                    }}
                    className="text-[11px] text-[#5a58ab] hover:underline cursor-pointer"
                  >
                    Change details
                  </button>
                </div>
              </div>

              {payuData ? (
                <PayUCheckout
                  paymentUrl={payuData.paymentUrl}
                  metadata={payuData.metadata}
                  onCancel={() => {
                    setStep("details");
                    setPayuData(null);
                  }}
                />
              ) : clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance,
                  }}
                >
                  <CheckoutForm
                    onBack={() => {
                      setStep("details");
                      setClientSecret(null);
                    }}
                    totalAmount={finalPrice}
                    currency={isIndianUser ? "INR" : "USD"}
                  />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#5a58ab] border-t-transparent mx-auto"></div>
                  <p className="text-gray-600 mt-4 text-xs">Setting up payment gateway...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckoutForm({
  onBack,
  totalAmount,
  currency,
}: {
  onBack: () => void;
  totalAmount: number;
  currency: "INR" | "USD";
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setErrorMessage(null);

    const siteUrl = window.location.origin;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${siteUrl}/payment/success`,
      },
    });

    if (error) {
      if (error.type === "card_error") {
        let msg = error.message || "Your card was declined or could not be processed.";
        msg += " Please try using a different card or contact your bank.";
        setErrorMessage(msg);
      } else if (error.type === "validation_error") {
        setErrorMessage(error.message || "Please check the payment details provided.");
      } else {
        setErrorMessage("Payment failed or was canceled. Please try again with a different payment method.");
      }
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />

      {errorMessage && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-xs flex items-start gap-2">
          <IoAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="w-1/3 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={processing || !stripe || !elements}
          className="w-2/3 bg-[#5a58ab] hover:bg-[#4a489b] text-white py-3.5 px-4 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Processing...</span>
            </>
          ) : (
            `Pay ${currency === "INR" ? `₹${totalAmount.toLocaleString("en-IN")}` : `$${totalAmount.toLocaleString("en-US")}`}`
          )}
        </button>
      </div>
    </form>
  );
}
