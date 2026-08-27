"use client";

import React, { Suspense, useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Cal, { getCalApi } from "@calcom/embed-react";
import { IoArrowBack, IoCalendarOutline, IoCheckmarkCircle } from "react-icons/io5";
import { AiSetupForm } from "./ai-setup-form";

interface AiDetails {
  candidateName: string;
  candidateEmail: string;
  interviewLink: string;
}

interface ManualDetails {
  candidateName: string;
  candidateEmail: string;
  purchaseId: string;
  jobRole: string;
  yearsOfExperience?: string;
  applicationLink?: string;
  interviewBrief?: string;
  bookingLink?: string;
  mockInterviewStatus?: string;
  mockInterviewDate?: string | null;
}

interface PaymentDetailsResponse {
  isCoach?: boolean;
  isAi?: boolean;
  candidateName?: string;
  candidateEmail?: string;
  purchaseId?: string;
  jobRole?: string;
  yearsOfExperience?: string;
  applicationLink?: string;
  interviewBrief?: string;
  bookingLink?: string;
  mockInterviewStatus?: string;
  mockInterviewDate?: string | null;
  applicationId?: string;
  interviewLink?: string;
  status?: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent");
  const calLink = process.env.NEXT_PUBLIC_CAL_LINK || "jbrecruitments/mock-interview";
  const [loading, setLoading] = useState(true);
  const [coachDetails, setCoachDetails] = useState<ManualDetails | null>(null);
  const [aiDetails, setAiDetails] = useState<AiDetails | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingUrl, setBookingUrl] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<string>("succeeded");
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [needsAiSetup, setNeedsAiSetup] = useState(false);
  const [purchaseId, setPurchaseId] = useState("");
  const [candidateName, setCandidateName] = useState("");

  useEffect(() => {
    if (!paymentIntent) {
      setLoading(false);
      return;
    }

    fetch(`/api/payment/details?payment_intent=${paymentIntent}`)
      .then((response) => response.json())
      .then((data: PaymentDetailsResponse) => {
        if (data.candidateEmail) {
          setCustomerEmail(data.candidateEmail);
        }
        if (data.status && data.status !== "succeeded") {
          setPaymentStatus(data.status);
        } else if (data.isCoach && data.jobRole) {
          setCoachDetails({
            candidateName: data.candidateName || "Candidate",
            candidateEmail: data.candidateEmail || "",
            purchaseId: data.purchaseId || "",
            jobRole: data.jobRole,
            yearsOfExperience: data.yearsOfExperience,
            applicationLink: data.applicationLink,
            interviewBrief: data.interviewBrief,
            bookingLink: data.bookingLink,
            mockInterviewStatus: data.mockInterviewStatus,
            mockInterviewDate: data.mockInterviewDate,
          });
          if (data.mockInterviewStatus === "SCHEDULED") {
            setBookingComplete(true);
          }
        } else if (data.isAi) {
          if (data.interviewLink === null) {
            setNeedsAiSetup(true);
            setPurchaseId(data.purchaseId || "");
            setCandidateName(data.candidateName || "");
          } else {
            setAiDetails({
              candidateName: data.candidateName || "Candidate",
              candidateEmail: data.candidateEmail || "",
              interviewLink: data.interviewLink || "",
            });
          }
        }
      })
      .catch((err) => console.error("Error fetching details:", err))
      .finally(() => setLoading(false));
  }, [paymentIntent]);

  useEffect(() => {
    if (typeof window !== "undefined" && paymentIntent) {
      setBookingUrl(`${window.location.origin}/payment/success?payment_intent=${paymentIntent}`);
    }
  }, [paymentIntent]);

  useEffect(() => {
    if (coachDetails && !bookingComplete) {
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
            callback: () => {
              if (mounted) {
                setBookingComplete(true);
              }
            },
          });
        } catch (err) {
          console.error("Failed to initialize Cal.com widget", err);
        }
      })();

      return () => {
        mounted = false;
      };
    }

    return undefined;
  }, [coachDetails, bookingComplete]);

  if (loading) {
    return (
      <div className="max-w-md w-full mx-4 overflow-hidden rounded-3xl border border-[#e6eefc] bg-white p-6 text-center shadow-[0_12px_40px_rgba(37,55,77,0.06)] sm:p-8 animate-pulse">
        <div className="mb-6 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-slate-200" />
        </div>
        <div className="mx-auto mb-3 h-8 w-3/4 rounded-xl bg-slate-200" />
        <div className="mx-auto h-4 w-full rounded-full bg-slate-100 mb-2" />
        <div className="mx-auto h-4 w-5/6 rounded-full bg-slate-100 mb-6" />
        <div className="mx-auto h-12 w-48 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (needsAiSetup) {
    return (
      <AiSetupForm
        purchaseId={purchaseId}
        candidateName={candidateName}
        candidateEmail={customerEmail || ""}
        onComplete={(link) => {
          setNeedsAiSetup(false);
          setAiDetails({
            candidateName: candidateName || "Candidate",
            candidateEmail: customerEmail || "",
            interviewLink: link,
          });
        }}
      />
    );
  }

  if (aiDetails) {
    return (
      <div className="max-w-md w-full mx-4 overflow-hidden rounded-3xl border border-[#e6eefc] bg-white p-6 text-center shadow-[0_12px_40px_rgba(37,55,77,0.06)] sm:p-8">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-500 shadow-inner">
            <IoCheckmarkCircle className="w-12 h-12" />
          </div>
        </div>
        <h1 className="mb-3 text-2xl font-bold leading-tight text-[#252e3d] sm:text-3xl" style={{ fontFamily: "Crimson Text, serif" }}>
          Payment Verified!
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-gray-600">
          Hi <strong>{aiDetails.candidateName}</strong>, your AI Mock Interview is now ready. All your interview details, instructions, and payment invoice confirmation have been sent to your email: <strong>{aiDetails.candidateEmail}</strong>.
        </p>

        <div className="mb-6 space-y-3">
          {aiDetails.interviewLink ? (
            <Link
              href={aiDetails.interviewLink}
              className="w-full flex items-center justify-center gap-2 bg-[#5a58ab] hover:bg-[#4a489b] text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base cursor-pointer"
            >
              Start AI Interview Now
            </Link>
          ) : (
            <div className="rounded-xl border border-gray-100 bg-[#f8fafc] p-4 text-xs leading-normal text-slate-500">
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

  if (coachDetails) {
    const scheduledDate = coachDetails.mockInterviewDate ? new Date(coachDetails.mockInterviewDate) : null;
    const calSchedulingLink = calLink;

    return (
      <div className="w-full max-w-7xl space-y-6 rounded-3xl border border-[#e6eefc] bg-white p-6 shadow-[0_12px_40px_rgba(37,55,77,0.06)] sm:p-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <IoCheckmarkCircle className="w-6 h-6 text-green-500" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5a58ab]">Payment Verified</p>
            </div>
            <h1 className="text-2xl font-bold text-[#252e3d] sm:text-3xl" style={{ fontFamily: "Crimson Text, serif" }}>
              Book your human interview slot
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Hi {coachDetails.candidateName}, choose a date and time in the calendar below. It shows later dates too. A confirmation email regarding the service (including your payment invoice and booking link) has been sent to <strong>{coachDetails.candidateEmail}</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <div className="font-semibold text-[#252e3d]">{coachDetails.jobRole}</div>
            <div className="text-slate-500">Years of experience: {coachDetails.yearsOfExperience || "Not provided"}</div>
          </div>
        </div>

        {bookingComplete ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <IoCheckmarkCircle className="w-5 h-5" />
                Slot booked successfully
              </div>
              <p className="mt-3 text-sm text-green-900">
                Your session has been scheduled. We’ve sent a confirmation email regarding the service (including your payment invoice and slot details) to <strong>{coachDetails.candidateEmail}</strong>.
              </p>
              {scheduledDate && (
                <div className="mt-5 rounded-2xl border border-green-200 bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Scheduled time</p>
                  <p className="mt-2 text-sm font-semibold text-[#252e3d]">{scheduledDate.toLocaleString()}</p>
                </div>
              )}
            </div>

            <DetailsPanel coachDetails={coachDetails} bookingUrl={bookingUrl || calSchedulingLink} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-[#fbfbfd]">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-white px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0efff]">
                  <IoCalendarOutline className="h-5 w-5 text-[#5a58ab]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
                    Select your preferred date & time
                  </h2>
                  <p className="text-xs text-slate-500">Use the calendar widget to see later dates and time slots.</p>
                </div>
              </div>

              <div className="w-full" style={{ height: "700px" }}>
                <Cal
                  calLink={calSchedulingLink}
                  style={{ width: "100%", height: "100%" }}
                  config={{
                    name: coachDetails.candidateName,
                    email: coachDetails.candidateEmail,
                    "metadata[purchaseId]": coachDetails.purchaseId,
                    "metadata[jobRole]": coachDetails.jobRole,
                    "metadata[yearsOfExperience]": coachDetails.yearsOfExperience || "",
                    "metadata[applicationLink]": coachDetails.applicationLink || "",
                    "metadata[interviewBrief]": coachDetails.interviewBrief || "",
                  }}
                />
              </div>
            </div>
            <DetailsPanel coachDetails={coachDetails} bookingUrl={bookingUrl || calSchedulingLink} />
          </div>
        )}

        <div className="mt-6 border-t border-gray-100 pt-5 text-xs text-gray-400">
          Have questions? Reply to your confirmation email or contact us at contact@jbrecruitments.com.
        </div>
      </div>
    );
  }

  if (paymentStatus !== "succeeded") {
    return (
      <div className="max-w-md w-full mx-4 overflow-hidden rounded-3xl border border-red-100 bg-white p-6 text-center shadow-[0_12px_40px_rgba(223,27,65,0.08)] sm:p-8">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-inner">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        <h1 className="mb-3 text-2xl font-bold leading-tight text-[#252e3d] sm:text-3xl" style={{ fontFamily: "Crimson Text, serif" }}>
          Payment Failed or Canceled
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-gray-600 sm:text-base">
          Unfortunately, your payment could not be completed. If you provided a card that is not supported, please try again with a different card or contact your bank. No charges were made.
        </p>

        <div className="mb-8 space-y-3">
          <Link
            href="/job-seekers"
            className="group w-full flex items-center justify-center gap-2 rounded-xl bg-[#5a58ab] px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#4a489b] hover:shadow-lg sm:text-base"
          >
            <IoArrowBack className="h-5 w-5 transform transition-transform duration-300 group-hover:-translate-x-1" />
            Go Back and Try Again
          </Link>
        </div>
        <div className="border-t border-gray-100 pt-5 text-xs text-gray-400">
          If the issue persists, please contact our support team at juhi@jbrecruitments.com or via WhatsApp at +971 58 581 9271.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-4 overflow-hidden rounded-3xl border border-[#e6eefc] bg-white p-6 text-center shadow-[0_12px_40px_rgba(37,55,77,0.06)] sm:p-8">
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#e6eefc]/40 via-[#dfe8fb]/30 to-[#f8fafc]/20 blur-2xl" aria-hidden="true" />

      <div className="mb-6 flex justify-center animate-bounce">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-500 shadow-inner">
          <IoCheckmarkCircle className="w-12 h-12" />
        </div>
      </div>

      <h1 className="mb-3 text-2xl font-bold leading-tight text-[#252e3d] sm:text-3xl" style={{ fontFamily: "Crimson Text, serif" }}>
        Payment Successful!
      </h1>
      <p className="mb-6 text-sm leading-relaxed text-gray-600 sm:text-base">
        Thank you for your purchase. Your payment has been verified. You will receive a confirmation email regarding the service (including your payment invoice and next steps) shortly{customerEmail ? <> at <strong className="text-[#252e3d] font-semibold">{customerEmail}</strong></> : ""}.
      </p>

      {paymentIntent && (
        <div className="mb-6 rounded-xl border border-gray-100 bg-[#f8fafc] p-3 text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Transaction Reference:
          </span>
          <code className="break-all font-mono text-xs text-gray-700">{paymentIntent}</code>
        </div>
      )}

      <div className="mb-8 space-y-3">
        <Link
          href="/job-seekers"
          className="group w-full flex items-center justify-center gap-2 rounded-xl bg-[#5a58ab] px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#4a489b] hover:shadow-lg sm:text-base"
        >
          <IoArrowBack className="h-5 w-5 transform transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Job Seekers Page
        </Link>
      </div>

      <div className="border-t border-gray-100 pt-5 text-xs text-gray-400">
        Have questions? Reply to your confirmation email or contact us at contact@jbrecruitments.com.
      </div>
    </div>
  );
}

function DetailsPanel({
  coachDetails,
  bookingUrl,
}: {
  coachDetails: ManualDetails;
  bookingUrl: string;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
          Interview brief
        </h3>
        <dl className="mt-4 space-y-3 text-sm">
          <Row label="Role" value={coachDetails.jobRole} />
          <Row label="Experience" value={coachDetails.yearsOfExperience || "Not provided"} />
          {coachDetails.applicationLink && (
            <Row
              label="Application link"
              value={
                <a
                  href={coachDetails.applicationLink}
                  target="_blank"
                  rel="noreferrer"
                  title={coachDetails.applicationLink}
                  className="block truncate text-[#5a58ab] hover:underline"
                >
                  {coachDetails.applicationLink}
                </a>
              }
            />
          )}
          {coachDetails.interviewBrief && <Row label="Brief" value={coachDetails.interviewBrief} />}
        </dl>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-[#fbfbfd] p-5 text-sm text-slate-600">
        You can also save this booking link and return later if needed:
        <a
          href={bookingUrl}
          target="_blank"
          rel="noreferrer"
          title={bookingUrl}
          className="mt-2 block truncate rounded-xl border border-slate-200 bg-white p-3 text-xs text-[#5a58ab] transition hover:bg-slate-50"
        >
          {bookingUrl}
        </a>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <span className="min-w-0 max-w-[65%] truncate text-right text-sm font-medium text-slate-700">{value}</span>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div
      className="min-h-screen bg-[#F9F9FB] text-[#252E3D] flex items-center justify-center px-4 pt-24 pb-16"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <Suspense
        fallback={
          <div className="text-center text-[#252e3d]">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#5a58ab]" />
            <p>Loading payment details...</p>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
