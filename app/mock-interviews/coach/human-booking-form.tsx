"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { IoCheckmarkCircle, IoLockClosed } from "react-icons/io5";
import { detectCurrencyFromBrowser } from "@/lib/geo-utils";
import { MULTI_CURRENCY_PRICING, type Currency } from "@/lib/rag/system-context";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");
const SERVICE_NAME = "Coach Mock Interview";

type BookingFormState = {
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  jobRole: string;
  yearsOfExperience: string;
  interviewBrief: string;
  applicationLink: string;
};

function formatCurrency(amount: number, currency: Currency) {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return `${currency} ${amount.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function CheckoutButton({
  currency,
  price,
  jobRole,
  onCancel,
}: {
  currency: Currency;
  price: number;
  jobRole: string;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
    });

    if (result.error) {
      setError(result.error.message || "Payment could not be completed.");
      setLoading(false);
      return;
    }

    const paymentIntent = (result as any).paymentIntent;
    if (paymentIntent?.status === "succeeded") {
      window.location.assign(`/payment/success?payment_intent=${paymentIntent.id}`);
      return;
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-[#f8f7ff] border border-[#e8e7f8] rounded-xl p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#5a58ab] uppercase tracking-wide mb-1">
              Human Based Interview
            </p>
            <p className="text-xs text-gray-500">{jobRole}</p>
          </div>
          <span className="text-lg font-bold text-[#252e3d]">{formatCurrency(price, currency)}</span>
        </div>
      </div>

      <PaymentElement />

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={!stripe || !elements || loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#252e3d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2d3645] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Processing…
            </>
          ) : (
            <>
              <IoLockClosed className="h-4 w-4" />
              Pay & Continue to Slot Booking
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back
        </button>
      </div>
    </form>
  );
}

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#252e3d]">
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-2.5 text-sm text-[#252e3d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5a58ab]/40 focus:border-[#5a58ab]"
      />
    </div>
  );
}

export default function HumanInterviewBookingForm() {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [paymentStage, setPaymentStage] = useState<"form" | "checkout">("form");
  const [clientSecret, setClientSecret] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<BookingFormState>({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    jobRole: "",
    yearsOfExperience: "",
    interviewBrief: "",
    applicationLink: "",
  });

  useEffect(() => {
    setCurrency(detectCurrencyFromBrowser());
  }, []);

  const coachPrice = useMemo(
    () => MULTI_CURRENCY_PRICING[SERVICE_NAME]?.[currency] ?? 499,
    [currency],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  };

  const handleStartPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName: SERVICE_NAME,
          candidateName: form.candidateName,
          candidateEmail: form.candidateEmail,
          candidatePhone: form.candidatePhone,
          currency,
          interviewMetadata: {
            interviewPreference: "MANUAL",
            jobRole: form.jobRole,
            yearsOfExperience: form.yearsOfExperience,
            interviewBrief: form.interviewBrief,
            applicationLink: form.applicationLink,
          },
        }),
      });

      const data = (await response.json()) as { clientSecret?: string; error?: string };
      if (!response.ok || !data.clientSecret) {
        throw new Error(data.error || "Could not initialise payment.");
      }

      setClientSecret(data.clientSecret);
      setPaymentStage("checkout");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const checkoutAppearance = {
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
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(37,46,61,0.05)]">
      {paymentStage === "form" ? (
        <>
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5a58ab]">Human Based Interview</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
              Tell us who the interview is for
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Share the role, years of experience, and any job link so we can match the right interviewer.
            </p>
          </div>

          <form onSubmit={handleStartPayment} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full Name *"
                name="candidateName"
                value={form.candidateName}
                onChange={handleChange}
                placeholder="Jane Smith"
                required
              />
              <Input
                label="Email Address *"
                name="candidateEmail"
                type="email"
                value={form.candidateEmail}
                onChange={handleChange}
                placeholder="jane@example.com"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Phone Number"
                name="candidatePhone"
                value={form.candidatePhone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
              />
              <Input
                label="Years of Experience *"
                name="yearsOfExperience"
                value={form.yearsOfExperience}
                onChange={handleChange}
                placeholder="5"
                required
              />
            </div>

            <Input
              label="Target Role *"
              name="jobRole"
              value={form.jobRole}
              onChange={handleChange}
              placeholder="React Developer"
              required
            />

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#252e3d]">
                Interview Brief *
              </label>
              <textarea
                name="interviewBrief"
                required
                rows={4}
                value={form.interviewBrief}
                onChange={handleChange}
                placeholder="What should the interviewer focus on? Any specific companies, seniority, or topics?"
                className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-3 text-sm text-[#252e3d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5a58ab]/40 focus:border-[#5a58ab]"
              />
            </div>

            <Input
              label="Job Application Link"
              name="applicationLink"
              type="url"
              value={form.applicationLink}
              onChange={handleChange}
              placeholder="https://company.com/jobs/..."
            />

            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

            <div className="rounded-xl bg-[#f8f7ff] border border-[#e0dfff] px-4 py-3 flex items-start gap-2.5">
              <IoLockClosed className="mt-0.5 h-4 w-4 shrink-0 text-[#5a58ab]" />
              <p className="text-xs leading-relaxed text-gray-600">
                Pay securely in {currency}. After payment, we’ll open the in-app slot booking page so you can choose a time.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#252e3d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2d3645] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Initialising Payment…
                </>
              ) : (
                <>
                  <IoCheckmarkCircle className="h-4 w-4" />
                  Pay {formatCurrency(coachPrice, currency)} &amp; Continue
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5a58ab]">Secure Checkout</p>
            <h3 className="mt-2 text-xl font-semibold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
              Complete payment to unlock slot booking
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Your human interviewer will be briefed with the role details you shared.
            </p>
          </div>

          <Elements stripe={stripePromise} options={{ clientSecret, appearance: checkoutAppearance }}>
            <CheckoutButton
              currency={currency}
              price={coachPrice}
              jobRole={form.jobRole}
              onCancel={() => {
                setPaymentStage("form");
                setClientSecret("");
              }}
            />
          </Elements>
        </div>
      )}
    </div>
  );
}
