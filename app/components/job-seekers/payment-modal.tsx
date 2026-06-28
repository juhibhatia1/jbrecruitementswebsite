"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { IoClose, IoAlertCircle } from "react-icons/io5";
import { useLenis } from "@/app/providers/lenis-provider";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface ServiceItem {
  title: string;
  amount: number;
  description: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Accept an array of services for multi-service checkout */
  services: ServiceItem[];
  /** The currency to display and charge in: USD | AED | INR */
  currency: string;
}

export default function PaymentModal({ isOpen, onClose, services, currency }: PaymentModalProps) {
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { lenis } = useLenis();

  const totalAmount = services.reduce((sum, s) => sum + s.amount, 0);
  const isMulti = services.length > 1;
  const displayTitle =
    services.length === 1
      ? services[0].title
      : `${services.length} Services`;

  // Reset states when modal closes or services change
  useEffect(() => {
    if (!isOpen) {
      setCandidateName("");
      setCandidateEmail("");
      setCandidatePhone("");
      setClientSecret(null);
      setError(null);
      setLoading(false);
    }
  }, [isOpen, services]);

  // Prevent background scrolling when modal is open
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

  if (!isOpen || services.length === 0) return null;

  const handleInitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidateEmail.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceNames: services.map((s) => s.title),
          candidateName,
          candidateEmail,
          candidatePhone,
          currency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment session.");
      }

      setClientSecret(data.clientSecret);
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

  const options = {
    clientSecret: clientSecret || undefined,
    appearance,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-[0_24px_50px_-12px_rgba(37,55,77,0.15)] border border-[#e6eefc] overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-start bg-[#fcfdfe]">
          <div>
            <h3
              className="text-xl font-bold text-[#252e3d] mt-1.5"
              style={{ fontFamily: "Crimson Text, serif" }}
            >
              {displayTitle}
            </h3>
            {isMulti && (
              <p className="text-xs text-gray-400 mt-0.5">
                {services.length} services selected
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div data-lenis-prevent className="p-6 overflow-y-auto flex-grow">
          {error && (
            <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm flex items-start gap-2.5">
              <IoAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!clientSecret ? (
            // Stage 1: Collect Name & Email
            <form onSubmit={handleInitPayment} className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Before proceeding to secure checkout, please provide your billing
                details to associate your payment.
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5a58ab]/20 focus:border-[#5a58ab] transition-all placeholder:text-gray-300 text-sm text-[#252e3d]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="e.g. jane.doe@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5a58ab]/20 focus:border-[#5a58ab] transition-all placeholder:text-gray-300 text-sm text-[#252e3d]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  required
                  value={candidatePhone}
                  onChange={(e) => setCandidatePhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5a58ab]/20 focus:border-[#5a58ab] transition-all placeholder:text-gray-300 text-sm text-[#252e3d]"
                />
              </div>

              {/* Order Summary */}
              <div className="bg-[#fcfdfe] border border-[#e8effd] p-4 rounded-2xl mt-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Order Summary
                </p>

                {/* Line items for multi-service */}
                {isMulti && (
                  <div className="space-y-2 mb-3 pb-3 border-b border-gray-100">
                    {services.map((s) => (
                      <div key={s.title} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 truncate mr-4">{s.title}</span>
                        <span className="text-sm font-semibold text-[#252e3d] shrink-0">
                          {currency} {s.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] sm:text-xs text-gray-400 block whitespace-nowrap">
                      {isMulti ? "Total Amount:" : "Amount:"}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-[#252e3d] whitespace-nowrap">
                      {currency} {totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#5a58ab] hover:bg-[#4a489b] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      "Proceed to Payment"
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            // Stage 2: Render Stripe Checkout Form
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm totalAmount={totalAmount} clientSecret={clientSecret} currency={currency} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}

// Inner checkout form
interface CheckoutFormProps {
  totalAmount: number;
  clientSecret: string;
  currency: string;
}

function CheckoutForm({ totalAmount, clientSecret, currency }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setErrorMessage(null);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${siteUrl}/payment/success`,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setErrorMessage(error.message || "An error occurred.");
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm flex items-start gap-2">
          <IoAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        disabled={processing || !stripe || !elements}
        className="w-full bg-[#5a58ab] hover:bg-[#4a489b] text-white py-3.5 px-4 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            Processing Secure Payment...
          </>
        ) : (
                  `Pay ${currency} ${totalAmount.toLocaleString()}`
        )}
      </button>
    </form>
  );
}
