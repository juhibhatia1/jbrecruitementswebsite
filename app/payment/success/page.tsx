"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IoCheckmarkCircle, IoArrowBack, IoCalendarOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import Cal, { getCalApi } from "@calcom/embed-react";

interface CoachDetails {
  candidateName: string;
  candidateEmail: string;
  applicationId: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent");

  const [loading, setLoading] = useState(true);
  const [coachDetails, setCoachDetails] = useState<CoachDetails | null>(null);
  const [aiDetails, setAiDetails] = useState<{ candidateName: string; candidateEmail: string; interviewLink: string } | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);

  // Fetch payment details on mount
  useEffect(() => {
    if (!paymentIntent) {
      setLoading(false);
      return;
    }

    fetch(`/api/payment/details?payment_intent=${paymentIntent}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.isCoach) {
          setCoachDetails({
            candidateName: data.candidateName,
            candidateEmail: data.candidateEmail,
            applicationId: data.applicationId,
          });
        } else if (data.isAi) {
          setAiDetails({
            candidateName: data.candidateName,
            candidateEmail: data.candidateEmail,
            interviewLink: data.interviewLink || "",
          });
        }
      })
      .catch((err) => console.error("Error fetching details:", err))
      .finally(() => setLoading(false));
  }, [paymentIntent]);

  // Wire up Cal.com widget configuration
  useEffect(() => {
    if (coachDetails && !bookingComplete) {
      (async () => {
        try {
          const cal = await getCalApi();
          cal("ui", {
            theme: "light",
            styles: { branding: { brandColor: "#5a58ab" } },
            hideEventTypeDetails: false,
            layout: "month_view",
          });
          cal("on", {
            action: "bookingSuccessful",
            callback: () => setBookingComplete(true),
          });
        } catch (err) {
          console.error("Failed to initialize Cal.com widget", err);
        }
      })();
    }
  }, [coachDetails, bookingComplete]);

  if (loading) {
    return (
      <div className="max-w-md w-full mx-4 bg-white rounded-3xl border border-[#e6eefc] p-6 sm:p-8 shadow-[0_12px_40px_rgba(37,55,77,0.06)] text-center relative overflow-hidden animate-pulse">
        {/* Success Icon Badge Placeholder */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center shadow-inner">
            <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
          </div>
        </div>

        {/* Title Placeholder */}
        <div className="h-7 w-48 bg-slate-200 rounded-md mx-auto mb-4"></div>

        {/* Description Paragraph Placeholder */}
        <div className="space-y-2.5 mb-8">
          <div className="h-3 w-5/6 bg-slate-200/70 rounded-md mx-auto"></div>
          <div className="h-3 w-11/12 bg-slate-200/70 rounded-md mx-auto"></div>
          <div className="h-3 w-3/4 bg-slate-200/70 rounded-md mx-auto"></div>
        </div>

        {/* Action Blocks Placeholder */}
        <div className="space-y-3 mb-2">
          {/* Primary Action Button Placeholder */}
          <div className="h-12 w-full bg-slate-200 rounded-xl"></div>
          {/* Secondary Action Button Placeholder */}
          <div className="h-10 w-full bg-slate-200/70 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // ── Render: AI Mock Interview Success Card ──────────────────────────────
  if (aiDetails) {
    return (
      <div className="max-w-md w-full mx-4 bg-white rounded-3xl border border-[#e6eefc] p-6 sm:p-8 shadow-[0_12px_40px_rgba(37,55,77,0.06)] text-center relative overflow-hidden">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 shadow-inner">
            <IoCheckmarkCircle className="w-12 h-12" />
          </div>
        </div>
        <h1
          className="text-2xl sm:text-3xl font-bold text-[#252e3d] mb-3 leading-tight"
          style={{ fontFamily: "Crimson Text, serif" }}
        >
          Payment Verified!
        </h1>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          Hi <strong>{aiDetails.candidateName}</strong>, your AI Mock Interview is now ready. We have also sent the access details and PDF receipt to <strong>{aiDetails.candidateEmail}</strong>.
        </p>

        <div className="space-y-3 mb-6">
          {aiDetails.interviewLink ? (
            <Link
              href={aiDetails.interviewLink}
              className="w-full flex items-center justify-center gap-2 bg-[#5a58ab] hover:bg-[#4a489b] text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base cursor-pointer"
            >
              Start AI Interview Now
            </Link>
          ) : (
            <div className="bg-[#f8fafc] border border-gray-100 rounded-xl p-4 text-xs text-slate-500 leading-normal">
              Please check your inbox (including spam) for your single-use interview link to start your session.
            </div>
          )}
          
          <Link
            href="/job-seekers"
            className="w-full flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 px-4 rounded-xl font-semibold transition-all duration-300 text-sm cursor-pointer"
          >
            Go back to Job Seekers
          </Link>
        </div>
      </div>
    );
  }

  // ── Render: Coach Session Booking Calendar ───────────────────────────────
  if (coachDetails) {
    const calLink = process.env.NEXT_PUBLIC_CAL_LINK || "jbrecruitments/mock-interview";

    if (!bookingComplete) {
      return (
        <div className="max-w-4xl w-full mx-4 bg-white rounded-3xl border border-[#e6eefc] p-6 sm:p-8 shadow-[0_12px_40px_rgba(37,55,77,0.06)] relative overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-gray-100 pb-5 mb-6">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-500 shrink-0 shadow-inner">
              <IoCheckmarkCircle className="w-8 h-8" />
            </div>
            <div className="text-center sm:text-left">
              <h1
                className="text-xl sm:text-2xl font-bold text-[#252e3d]"
                style={{ fontFamily: "Crimson Text, serif" }}
              >
                Payment Verified! Schedule Your Session
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Hi {coachDetails.candidateName}, please pick a date on the left, then select a time slot on the right.
              </p>
            </div>
          </div>

          {/* Cal.com embed */}
          <div className="w-full rounded-2xl border border-slate-100 overflow-hidden" style={{ height: "600px" }}>
            <Cal
              calLink={calLink}
              style={{ width: "100%", height: "100%", overflow: "scroll" }}
              config={{
                name: coachDetails.candidateName,
                email: coachDetails.candidateEmail,
                "metadata[applicationId]": coachDetails.applicationId,
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-md w-full mx-4 bg-white rounded-3xl border border-[#e6eefc] p-6 sm:p-8 shadow-[0_12px_40px_rgba(37,55,77,0.06)] text-center relative overflow-hidden">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 shadow-inner">
            <IoCheckmarkCircle className="w-12 h-12" />
          </div>
        </div>
        <h1
          className="text-2xl sm:text-3xl font-bold text-[#252e3d] mb-3 leading-tight"
          style={{ fontFamily: "Crimson Text, serif" }}
        >
          Session Scheduled!
        </h1>
        <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
          Your coach-led mock interview practice session has been confirmed. A calendar invitation and Google Meet details have been sent to <strong>{coachDetails.candidateEmail}</strong>.
        </p>
        <Link
          href="/job-seekers"
          className="group w-full flex items-center justify-center gap-2 bg-[#5a58ab] hover:bg-[#4a489b] text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
        >
          <IoArrowBack className="w-5 h-5 transform transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Career Guidance
        </Link>
      </div>
    );
  }


  // ── Render: Default Payment Success Card ─────────────────────────────────
  return (
    <div className="max-w-md w-full mx-4 bg-white rounded-3xl border border-[#e6eefc] p-6 sm:p-8 shadow-[0_12px_40px_rgba(37,55,77,0.06)] text-center relative overflow-hidden">
      {/* Decorative background blur */}
      <div
        className="absolute inset-0 -z-10 blur-2xl bg-gradient-to-r from-[#e6eefc]/40 via-[#dfe8fb]/30 to-[#f8fafc]/20"
        aria-hidden="true"
      />

      <div className="flex justify-center mb-6 animate-bounce">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 shadow-inner">
          <IoCheckmarkCircle className="w-12 h-12" />
        </div>
      </div>

      <h1
        className="text-2xl sm:text-3xl font-bold text-[#252e3d] mb-3 leading-tight"
        style={{ fontFamily: "Crimson Text, serif" }}
      >
        Payment Successful!
      </h1>
      <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
        Thank you for your purchase. Your payment has been verified. We've sent
        a PDF receipt and details to your email. Our team will contact you
        shortly to coordinate the next steps.
      </p>

      {paymentIntent && (
        <div className="bg-[#f8fafc] border border-gray-100 rounded-xl p-3 mb-6 text-left">
          <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-1 tracking-wider">
            Transaction Reference:
          </span>
          <code className="text-xs font-mono break-all text-gray-700">
            {paymentIntent}
          </code>
        </div>
      )}

      <div className="space-y-3 mb-8">
        <Link
          href="/job-seekers"
          className="group w-full flex items-center justify-center gap-2 bg-[#5a58ab] hover:bg-[#4a489b] text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
        >
          <IoArrowBack className="w-5 h-5 transform transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Career Guidance Page
        </Link>
      </div>

      <div className="border-t border-gray-100 pt-5 text-xs text-gray-400">
        Have questions? Reply to your confirmation email or contact us at
        juhi@jbrecruitments.com.
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div
      className="min-h-screen bg-[#F9F9FB] text-[#252E3D] flex items-center justify-center pt-24 pb-16"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <Suspense
        fallback={
          <div className="text-[#252e3d] text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5a58ab] mx-auto mb-4"></div>
            <p>Loading payment details...</p>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
