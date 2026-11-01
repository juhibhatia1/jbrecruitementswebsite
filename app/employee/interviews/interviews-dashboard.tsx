"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  IoArrowForwardOutline,
  IoChevronDownOutline,
  IoAddCircleOutline,
  IoArrowBackOutline,
  IoMailOutline,
  IoCallOutline,
  IoGlobeOutline,
  IoSparklesOutline,
  IoCloseOutline,
} from "react-icons/io5";
import type { CandidateInterviewRecord, CandidateInterviewBooking } from "./page";
import { PiXCircleDuotone } from "react-icons/pi";
import { updatePurchaseStatus } from "./actions";
import CreateCandidateInterviewModal from "@/app/components/admin/create-candidate-interview-modal";
import InfoTooltip from "@/app/components/ui/info-tooltip";
import { InterviewLinkCard } from "@/app/components/admin/regenerate-link-modal";
import { useLenis } from "@/app/providers/lenis-provider";

const OPENAI_REALTIME_VOICES = ["alloy","ash","ballad","cedar","coral","echo","marin","sage","shimmer","verse"] as const;
type Voice = typeof OPENAI_REALTIME_VOICES[number];

const VOICE_DESCRIPTIONS: Record<string, string> = {
  alloy: "Balanced · Neutral",
  ash: "Warm · Measured",
  ballad: "Smooth · Expressive",
  cedar: "Calm · Confident",
  coral: "Clear · Friendly",
  echo: "Strong · Direct",
  marin: "Natural · Professional",
  sage: "Warm · Supportive",
  shimmer: "Bright · Energetic",
  verse: "Rich · Authoritative",
};

const RECOMMENDED_VOICES: Voice[] = ["marin", "cedar"];
const CONFIG_STORAGE_KEY = "employee_interview_config";

type InterviewConfig = {
  defaultDurationMinutes: number;
  defaultVoice: Voice;
};

const DEFAULT_CONFIG: InterviewConfig = {
  defaultDurationMinutes: 30,
  defaultVoice: "marin",
};

type DashboardStats = {
  totalCandidates: number;
  totalPaidBookings: number;
  aiCount: number;
  humanCount: number;
  completedCount: number;
};

export function EmployeeInterviewsDashboard({
  candidateBookings,
  stats,
}: {
  candidateBookings: CandidateInterviewRecord[];
  stats: DashboardStats;
}) {
  const router = useRouter();
  const pageSize = 10;
  const bookingPageSize = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isCreateCandidateModalOpen, setIsCreateCandidateModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(candidateBookings[0]?.email ?? null);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(
    candidateBookings[0]?.bookings[0]?.purchase.id ?? null,
  );

  const { lenis } = useLenis();

  useEffect(() => {
    if (isInterviewModalOpen) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [isInterviewModalOpen, lenis]);

  const totalPages = Math.max(1, Math.ceil(candidateBookings.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const pageCandidates = useMemo(
    () => candidateBookings.slice(pageStart, pageStart + pageSize),
    [candidateBookings, pageStart],
  );

  useEffect(() => {
    if (!pageCandidates.length) return;
    const selectedOnPage = pageCandidates.some((candidate) => candidate.email === selectedEmail);
    if (!selectedOnPage) {
      const firstCandidate = pageCandidates[0];
      setSelectedEmail(firstCandidate.email);
      setSelectedInterviewId(firstCandidate.bookings[0]?.purchase.id ?? null);
      setBookingPage(1);
    }
  }, [pageCandidates, selectedEmail]);

  const selectedCandidate = candidateBookings.find((candidate) => candidate.email === selectedEmail) ?? pageCandidates[0] ?? null;
  const selectedCandidateBookingPages = selectedCandidate
    ? Math.max(1, Math.ceil(selectedCandidate.bookings.length / bookingPageSize))
    : 1;
  const bookingPageStart = (bookingPage - 1) * bookingPageSize;
  const selectedCandidateBookingsPage = selectedCandidate?.bookings.slice(
    bookingPageStart,
    bookingPageStart + bookingPageSize,
  ) ?? [];
  const selectedInterview =
    selectedCandidateBookingsPage.find((booking) => booking.purchase.id === selectedInterviewId) ??
    selectedCandidateBookingsPage[0] ??
    selectedCandidate?.bookings[0] ??
    null;

  const selectedSession = selectedInterview?.relatedApplication?.session ?? null;
  const selectedReport = selectedSession?.finalReport ?? null;

  const selectCandidate = (candidate: CandidateInterviewRecord) => {
    setSelectedEmail(candidate.email);
    setSelectedInterviewId(candidate.bookings[0]?.purchase.id ?? null);
    setBookingPage(1);
    setIsInterviewModalOpen(false);
  };

  const changePage = (nextPage: number) => {
    const clamped = Math.min(Math.max(1, nextPage), totalPages);
    setCurrentPage(clamped);
  };

  const changeBookingPage = (nextPage: number) => {
    const clamped = Math.min(Math.max(1, nextPage), selectedCandidateBookingPages);
    setBookingPage(clamped);
    const nextStart = (clamped - 1) * bookingPageSize;
    const nextBooking = selectedCandidate?.bookings[nextStart];
    if (nextBooking) {
      setSelectedInterviewId(nextBooking.purchase.id);
    }
  };

  useEffect(() => {
    if (!selectedInterview) {
      setIsInterviewModalOpen(false);
    }
  }, [selectedInterview]);

  useEffect(() => {
    if (!isInterviewModalOpen) return undefined;

    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
    };
  }, [isInterviewModalOpen]);

  return (
    <div className="min-h-screen bg-[#f4f6fb]" style={{ fontFamily: "Raleway, sans-serif" }}>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <header className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Link
                  href="/employee/directory"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#5a58ab] transition-colors mb-3 group"
                >
                  <IoArrowBackOutline className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  Back to Directory
                </Link>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5a58ab]">Employee Interview Tracker</p>
                <h1 className="mt-2 text-3xl font-semibold text-[#252e3d] sm:text-4xl" style={{ fontFamily: "Crimson Text, serif" }}>
                  Paid interview bookings
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  Quickly scan hundreds of customers, drill into one customer's interviews, and open the full AI report when needed.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsCreateCandidateModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#5a58ab] hover:bg-[#4a489b] text-white rounded-2xl text-sm font-bold transition cursor-pointer shadow-md shadow-[#5a58ab]/20 hover:shadow-lg"
                >
                  <IoAddCircleOutline className="w-5 h-5" />
                  <span>Create Candidate Interview</span>
                </button>
                <InfoTooltip text="Generate a unique candidate interview invitation link." title="Create Interview" position="bottom" align="end" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
              <StatCard label="Candidates" value={stats.totalCandidates} info="Total unique candidates with recorded mock interview bookings." />
              <StatCard label="Paid" value={stats.totalPaidBookings} info="Total verified paid interview sessions across all candidates." />
              <StatCard label="AI" value={stats.aiCount} info="Mock interviews conducted with the AI Realtime Voice interviewer." />
              <StatCard label="Human" value={stats.humanCount} info="Mock interviews conducted with senior expert recruiters." />
              <StatCard label="Done" value={stats.completedCount} info="Completed interview sessions with candidate performance reports filed." />
            </div>
          </div>
        </header>

        <InterviewConfigSection />

        {!candidateBookings.length ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-[#252e3d]">No interview bookings yet</p>
            <p className="mt-2 text-sm text-slate-500">Once candidates pay for an AI or human interview, their details will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] xl:items-start">
            <section className="w-full min-w-0 rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
                    Customers
                  </h2>
                  <p className="text-sm text-slate-500">Select a row to inspect all interviews for that person.</p>
                </div>
                <div className="text-sm text-slate-500">
                  Page <span className="font-semibold text-[#252e3d]">{currentPage}</span> of{" "}
                  <span className="font-semibold text-[#252e3d]">{totalPages}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-[#fbfbfd] text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    <tr>
                      <th className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <span>Customer</span>
                          <InfoTooltip text="Candidate full name, contact email, and registered country." title="Candidate" position="top" />
                        </div>
                      </th>
                      <th className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <span>Bookings</span>
                          <InfoTooltip text="Number of mock interview sessions booked by this candidate." title="Bookings" position="top" />
                        </div>
                      </th>
                      <th className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <span>Latest type</span>
                          <InfoTooltip text="The format of the most recent interview (AI or Human Recruiter)." title="Latest Type" position="top" />
                        </div>
                      </th>
                      <th className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <span>Latest status</span>
                          <InfoTooltip text="Current scheduling and evaluation report status for the latest booking." title="Status" position="top" />
                        </div>
                      </th>
                      <th className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <span>Last activity</span>
                          <InfoTooltip text="Date of the most recent purchase or interview session update." title="Last Activity" position="top" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {pageCandidates.map((candidate) => {
                      const latestBooking = candidate.bookings[0];
                      const isSelected = candidate.email === selectedCandidate?.email;
                      return (
                        <tr
                          key={candidate.email}
                          tabIndex={0}
                          onClick={() => selectCandidate(candidate)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              selectCandidate(candidate);
                            }
                          }}
                          className={`cursor-pointer transition hover:bg-slate-50 ${isSelected ? "bg-[#f8f7ff]" : ""}`}
                        >
                          <td className="px-5 py-4">
                            <div className="min-w-0">
                              <p className="font-semibold text-[#252e3d]">{candidate.name}</p>
                              <p className="truncate text-sm text-slate-500">{candidate.email}</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {candidate.phone && <Badge>{candidate.phone}</Badge>}
                                {candidate.country && <Badge>{candidate.country}</Badge>}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            <span className="font-semibold text-[#252e3d]">{candidate.bookings.length}</span> interviews
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {latestBooking ? (latestBooking.preference === "AI" ? "AI interview" : "Human interview") : "—"}
                          </td>
                          <td className="px-5 py-4">
                            {latestBooking ? (
                              <div className="flex flex-wrap gap-2">
                                <StatusBadge tone={statusTone(getInterviewStatus(latestBooking))}>
                                  {getInterviewStatus(latestBooking)}
                                </StatusBadge>
                                <StatusBadge tone={statusTone(getAuditStatus(latestBooking))}>{getAuditStatus(latestBooking)}</StatusBadge>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {latestBooking ? formatDate(latestBooking.purchase.createdAt) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
                <p className="text-sm text-slate-500">
                  Showing {pageStart + 1}–{Math.min(pageStart + pageSize, candidateBookings.length)} of {candidateBookings.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <div className="hidden items-center gap-2 sm:flex">
                    {buildPageNumbers(currentPage, totalPages).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => changePage(pageNumber)}
                        className={`h-10 w-10 rounded-xl border text-sm font-semibold transition ${
                          pageNumber === currentPage
                            ? "border-[#5a58ab] bg-[#5a58ab] text-white"
                            : "border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>

            <aside className="w-full min-w-0 space-y-6">
              {selectedCandidate ? (
                <>
                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5a58ab]">Interviews</p>
                        <h3 className="mt-1 text-xl font-semibold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
                          All bookings for this customer
                        </h3>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {selectedCandidateBookingsPage.map((booking) => {
                        const active = booking.purchase.id === selectedInterview?.purchase.id;
                        return (
                          <button
                            key={booking.purchase.id}
                            type="button"
                            onClick={() => {
                              setSelectedInterviewId(booking.purchase.id);
                              setIsInterviewModalOpen(true);
                            }}
                            className={`w-full rounded-2xl border p-4 text-left transition ${
                              active ? "border-[#5a58ab] bg-[#f8f7ff]" : "border-slate-200 bg-[#fbfbfd] hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <StatusBadge tone={booking.preference === "AI" ? "bg-[#f0efff] text-[#5a58ab]" : "bg-slate-100 text-slate-600"}>
                                    {booking.preference === "AI" ? "AI interview" : "Human interview"}
                                  </StatusBadge>
                                  <StatusBadge tone={statusTone(getInterviewStatus(booking))}>
                                    {getInterviewStatus(booking)}
                                  </StatusBadge>
                                </div>
                                <p className="mt-2 font-semibold text-[#252e3d]">{booking.purchase.serviceName}</p>
                                <p className="text-sm text-slate-500">Booked on {formatDate(booking.purchase.createdAt)}</p>
                              </div>
                              <p className="text-sm font-semibold text-[#252e3d]">
                                {booking.purchase.currency.toUpperCase()} {booking.purchase.amount.toLocaleString()}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <p className="text-sm text-slate-500">
                        Showing {selectedCandidateBookingsPage.length === 0 ? 0 : bookingPageStart + 1}–
                        {Math.min(bookingPageStart + bookingPageSize, selectedCandidate.bookings.length)} of{" "}
                        {selectedCandidate.bookings.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => changeBookingPage(bookingPage - 1)}
                          disabled={bookingPage === 1}
                          className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <div className="hidden items-center gap-2 sm:flex">
                          {buildPageNumbers(bookingPage, selectedCandidateBookingPages).map((pageNumber) => (
                            <button
                              key={pageNumber}
                              type="button"
                              onClick={() => changeBookingPage(pageNumber)}
                              className={`h-9 w-9 rounded-xl border text-sm font-semibold transition ${
                                pageNumber === bookingPage
                                  ? "border-[#5a58ab] bg-[#5a58ab] text-white"
                                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => changeBookingPage(bookingPage + 1)}
                          disabled={bookingPage === selectedCandidateBookingPages}
                          className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </section>
                </>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
                  Select a customer to see their interviews.
                </div>
              )}
            </aside>
          </div>
        )}
      </div>

      {isInterviewModalOpen && selectedInterview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden"
          data-lenis-prevent
        >
          <div
            className="fixed inset-0 bg-[#252e3d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsInterviewModalOpen(false)}
          />

          <div
            className="relative w-full max-w-5xl my-auto overflow-hidden rounded-3xl border border-slate-200/80 bg-[#f4f6fb] shadow-2xl z-10 flex flex-col max-h-[90vh]"
            role="dialog"
            aria-modal="true"
            aria-label="Selected interview details"
            data-lenis-prevent
          >
            {/* Header */}
            <header className="shrink-0 border-b border-slate-200/80 bg-white px-6 py-4 pr-16 relative">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5a58ab]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5a58ab]">
                    {selectedInterview.preference === "AI" ? "AI Mock Interview" : "Human Interview"}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    ID #{selectedInterview.purchase.id.slice(-6).toUpperCase()}
                  </span>
                  {selectedInterview.purchase.gatewayTransactionId && (
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline truncate max-w-[220px]" title={selectedInterview.purchase.gatewayTransactionId}>
                      · Ref: {selectedInterview.purchase.gatewayTransactionId}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-[#252e3d] sm:text-3xl" style={{ fontFamily: "Crimson Text, serif" }}>
                  {selectedInterview.purchase.candidateName}
                </h1>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <a
                    href={`mailto:${selectedInterview.purchase.candidateEmail}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-slate-700 transition"
                    title="Send direct email"
                  >
                    <IoMailOutline className="h-3.5 w-3.5 text-slate-500" />
                    {selectedInterview.purchase.candidateEmail}
                  </a>
                  {selectedInterview.purchase.candidatePhone && (
                    <a
                      href={`tel:${selectedInterview.purchase.candidatePhone}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-slate-700 transition"
                      title="Call candidate"
                    >
                      <IoCallOutline className="h-3.5 w-3.5 text-slate-500" />
                      {selectedInterview.purchase.candidatePhone}
                    </a>
                  )}
                  {selectedInterview.purchase.country && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-slate-600">
                      <IoGlobeOutline className="h-3.5 w-3.5 text-slate-500" />
                      {selectedInterview.purchase.country}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsInterviewModalOpen(false)}
                className="absolute right-5 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 cursor-pointer"
                title="Close"
              >
                <IoCloseOutline className="h-5 w-5" />
              </button>
            </header>

            {/* Content Body with visible vertical scrollbar */}
            <div
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
              className="flex-1 p-4 sm:p-5 space-y-3.5 overflow-x-hidden overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#94a3b8_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-track]:bg-slate-100/50"
            >
              {/* Top Status Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 min-w-0">
                <EditableMiniStat
                  label="Payment"
                  value={selectedInterview.purchase.status}
                  options={["PENDING", "COMPLETED", "FAILED"]}
                  purchaseId={selectedInterview.purchase.id}
                  field="status"
                />
                <EditableMiniStat
                  label="Interview"
                  value={
                    selectedInterview.preference === "AI"
                      ? (selectedInterview.relatedApplication?.status === "INTERVIEW_COMPLETED"
                        ? "COMPLETED"
                        : selectedInterview.relatedApplication?.status === "INTERVIEW_STARTED"
                        ? "IN_PROGRESS"
                        : selectedInterview.relatedApplication?.status === "SCHEDULED"
                        ? "SCHEDULED"
                        : selectedInterview.relatedApplication?.status === "AI_INVITED"
                        ? "INVITED"
                        : selectedInterview.relatedApplication?.status === "CANCELLED"
                        ? "CANCELLED"
                        : (selectedInterview.purchase.mockInterviewStatus || "PENDING_SCHEDULE"))
                      : (selectedInterview.purchase.mockInterviewStatus || "PENDING_SCHEDULE")
                  }
                  options={selectedInterview.preference === "MANUAL" ? ["PENDING_SCHEDULE", "SCHEDULED", "COMPLETED"] : undefined}
                  purchaseId={selectedInterview.purchase.id}
                  field="mockInterviewStatus"
                />
                <EditableMiniStat
                  label="Audit / Report"
                  value={
                    selectedInterview.preference === "AI"
                      ? (selectedInterview.relatedApplication?.session?.finalReport ? "COMPLETED" : "PENDING")
                      : selectedInterview.purchase.deliveryStatus
                  }
                  options={selectedInterview.preference === "MANUAL" ? ["PENDING", "COMPLETED"] : undefined}
                  purchaseId={selectedInterview.purchase.id}
                  field="deliveryStatus"
                />
                <MiniStat
                  label="Format & Schedule"
                  value={
                    selectedInterview.purchase.mockInterviewDate
                      ? formatDate(selectedInterview.purchase.mockInterviewDate)
                      : selectedInterview.relatedApplication?.scheduledAt
                      ? formatDate(selectedInterview.relatedApplication.scheduledAt)
                      : selectedInterview.preference === "AI"
                      ? "Self-Paced (Instant AI Link)"
                      : "Not scheduled"
                  }
                />
              </div>

              {/* Two Column Grid */}
              <div className="grid gap-4 lg:grid-cols-[1.25fr_0.95fr] min-w-0">
                {/* Left Column: Access & Evaluation */}
                <div className="space-y-3.5 min-w-0">
                  {selectedInterview.preference === "AI" && (
                    <InterviewLinkCard
                      key={selectedInterview.purchase.id}
                      applicationId={selectedInterview.relatedApplication?.id}
                      purchaseId={selectedInterview.purchase.id}
                      candidateEmail={selectedInterview.purchase.candidateEmail}
                      candidateName={selectedInterview.purchase.candidateName}
                      initialLink={selectedInterview.details.interviewLink}
                      onLinkUpdated={() => {
                        router.refresh();
                      }}
                    />
                  )}

                  {/* Summary / Report Card */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <IoSparklesOutline className="h-4 w-4 text-[#5a58ab]" />
                        <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[#252e3d]">
                          {selectedInterview.preference === "AI" ? "AI Evaluation & Report" : "Interview Outcome"}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {selectedReport?.finalScore !== undefined && (
                          <span className="rounded-full bg-[#f0efff] px-2.5 py-0.5 text-xs font-bold text-[#5a58ab] border border-[#5a58ab]/20">
                            Score: {selectedReport.finalScore}/10
                          </span>
                        )}
                        {selectedInterview.relatedApplication?.session?.id && selectedInterview.preference === "AI" && (
                          <Link
                            href={`/interview/results/${selectedInterview.relatedApplication.session.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#5a58ab] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#4a489b] shadow-2xs cursor-pointer"
                          >
                            <span>View Full Report</span>
                            <IoArrowForwardOutline className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <p className="text-sm leading-relaxed text-slate-700">
                        {selectedInterview.preference === "AI"
                          ? selectedReport?.summary || "No AI report summary generated yet. The candidate has not completed their interview."
                          : selectedInterview.details.interviewOutcome || "No human interview outcome logged yet."}
                      </p>

                      {selectedReport?.strengths && selectedReport.strengths.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1.5">Key Strengths</p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedReport.strengths.slice(0, 3).map((s, idx) => (
                              <span key={idx} className="rounded-md bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedInterview.preference === "MANUAL" && selectedInterview.details.applicationLink && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400 mb-2">Application Link</p>
                      <div className="flex items-center gap-2">
                        <a
                          href={selectedInterview.details.applicationLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-[#5a58ab] hover:bg-slate-50 transition"
                        >
                          <span>Open Application</span>
                          <IoArrowForwardOutline className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Specifications & Candidate Info */}
                <div className="space-y-3.5 min-w-0">
                  {/* Specifications Card */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400 mb-2">
                      Session Specifications
                    </p>
                    <div className="divide-y divide-slate-100 text-sm">
                      <Line label="Service" value={selectedInterview.purchase.serviceName} />
                      <Line
                        label="Amount Paid"
                        value={`${selectedInterview.purchase.currency.toUpperCase()} ${selectedInterview.purchase.amount.toLocaleString()}`}
                      />
                      {selectedInterview.preference === "MANUAL" ? (
                        <>
                          <Line label="Target Role" value={selectedInterview.details.jobRole || "Not provided"} />
                          <Line label="Experience" value={selectedInterview.details.yearsOfExperience || "Not provided"} />
                        </>
                      ) : selectedInterview.relatedApplication ? (
                        <>
                          <Line label="Target Role" value={selectedInterview.relatedApplication.template.jobRole} />
                          <Line label="Duration" value={`${selectedInterview.relatedApplication.template.durationMinutes} min`} />
                          <Line label="Level" value={selectedInterview.relatedApplication.template.experienceLevel || "General"} />
                        </>
                      ) : null}
                      <Line label="Booked On" value={formatDate(selectedInterview.purchase.createdAt)} />
                    </div>
                  </div>

                  {/* Candidate Info Card */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400 mb-2">
                      Candidate Details
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Full Name</span>
                        <span className="font-semibold text-slate-800">{selectedInterview.purchase.candidateName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Email</span>
                        <a href={`mailto:${selectedInterview.purchase.candidateEmail}`} className="font-semibold text-[#5a58ab] hover:underline">
                          {selectedInterview.purchase.candidateEmail}
                        </a>
                      </div>
                      {selectedInterview.purchase.candidatePhone && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">Phone</span>
                          <span className="font-medium text-slate-700">{selectedInterview.purchase.candidatePhone}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Country</span>
                        <span className="font-medium text-slate-700">{selectedInterview.purchase.country || "Not specified"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateCandidateInterviewModal
        isOpen={isCreateCandidateModalOpen}
        onClose={() => setIsCreateCandidateModalOpen(false)}
      />
    </div>
  );
}

function InterviewConfigSection() {
  const [config, setConfig] = useState<InterviewConfig>(DEFAULT_CONFIG);
  const [draft, setDraft] = useState<InterviewConfig>(DEFAULT_CONFIG);
  const [mounted, setMounted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<InterviewConfig>;
        const loaded: InterviewConfig = {
          defaultDurationMinutes: parsed.defaultDurationMinutes ?? DEFAULT_CONFIG.defaultDurationMinutes,
          defaultVoice: (parsed.defaultVoice && OPENAI_REALTIME_VOICES.includes(parsed.defaultVoice as Voice))
            ? parsed.defaultVoice as Voice
            : DEFAULT_CONFIG.defaultVoice,
        };
        setConfig(loaded);
        setDraft(loaded);
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  const persist = (next: InterviewConfig) => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(next));
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaved(true);
    saveTimerRef.current = setTimeout(() => setSaved(false), 2000);
  };

  const handleEdit = () => {
    setDraft({ ...config });
    setEditMode(true);
    setSaved(false);
  };

  const handleSave = () => {
    setConfig(draft);
    persist(draft);
    setEditMode(false);
  };

  const handleCancel = () => {
    setDraft({ ...config });
    setEditMode(false);
  };

  const handleVoicePreview = (voice: string) => {
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (previewingVoice === voice) {
      setPreviewingVoice(null);
      return;
    }
    setPreviewingVoice(voice);
    const audio = new Audio(`/api/voice-preview/${voice}`);
    audioRef.current = audio;
    audio.play().catch(() => {});
    audio.onended = () => setPreviewingVoice(null);
    audio.onerror = () => setPreviewingVoice(null);
  };

  if (!mounted) return null;

  return (
    <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5a58ab]">Configuration</p>
            <InfoTooltip text="Global settings applied to AI mock interviews, including default session duration and voice persona." title="Interview Configuration" position="bottom" />
          </div>
          <h2 className="mt-1 text-2xl font-semibold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
            Interview Configuration
          </h2>
          <p className="mt-1 text-sm text-slate-500">Default settings applied to all new interviews.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && !editMode && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Saved
            </span>
          )}
          {!editMode && (
            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-slate-500">
                <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354l-1.086-1.086ZM11.189 6.25 9.75 4.81l-6.286 6.287a.25.25 0 0 0-.064.108l-.558 1.953 1.953-.558a.249.249 0 0 0 .108-.064l6.286-6.286Z" />
              </svg>
              Edit
            </button>
          )}
        </div>
      </div>

      {/* View mode */}
      {!editMode && (
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">Default Duration</p>
            <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-5 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Interview length</span>
              <span className="rounded-xl bg-[#f0efff] px-4 py-2 text-base font-bold text-[#5a58ab]">
                {config.defaultDurationMinutes} min
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">Default Voice</p>
            <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-5">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#5a58ab] bg-[#f0efff] px-4 py-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold capitalize text-[#252e3d]">{config.defaultVoice}</span>
                    {RECOMMENDED_VOICES.includes(config.defaultVoice) && (
                      <span className="rounded-full bg-[#5a58ab]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#5a58ab]">Best</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500">{VOICE_DESCRIPTIONS[config.defaultVoice]}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleVoicePreview(config.defaultVoice)}
                  title={previewingVoice === config.defaultVoice ? "Stop preview" : "Preview voice"}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
                    previewingVoice === config.defaultVoice
                      ? "border-[#5a58ab] bg-[#5a58ab] text-white"
                      : "border-[#5a58ab]/40 bg-white text-[#5a58ab] hover:bg-[#5a58ab] hover:text-white"
                  }`}
                >
                  {previewingVoice === config.defaultVoice ? (
                    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                      <rect x="3" y="3" width="4" height="10" rx="1" />
                      <rect x="9" y="3" width="4" height="10" rx="1" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                      <path d="M4 3l9 5-9 5V3z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit mode */}
      {editMode && (
        <>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Duration */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">Default Duration</p>
              <div className="rounded-2xl border border-[#5a58ab]/30 bg-[#fbfbfd] p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-600">Interview length</span>
                  <span className="rounded-xl bg-[#f0efff] px-3 py-1 text-sm font-bold text-[#5a58ab]">
                    {draft.defaultDurationMinutes} min
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={120}
                  step={5}
                  value={draft.defaultDurationMinutes}
                  onChange={(e) => setDraft((prev) => ({ ...prev, defaultDurationMinutes: Number(e.target.value) }))}
                  className="w-full accent-[#5a58ab]"
                />
                <div className="flex justify-between mt-1 text-[10px] font-semibold text-slate-400">
                  <span>10 min</span>
                  <span>60 min</span>
                  <span>120 min</span>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, defaultDurationMinutes: preset }))}
                      className={`rounded-xl border py-2 text-xs font-semibold transition ${
                        draft.defaultDurationMinutes === preset
                          ? "border-[#5a58ab] bg-[#5a58ab] text-white"
                          : "border-slate-200 text-slate-600 hover:border-[#5a58ab] hover:text-[#5a58ab]"
                      }`}
                    >
                      {preset}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Voice */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">Default Voice</p>
              <div className="rounded-2xl border border-[#5a58ab]/30 bg-[#fbfbfd] p-5">
                <div className="grid grid-cols-2 gap-2">
                  {OPENAI_REALTIME_VOICES.map((voice) => {
                    const isSelected = draft.defaultVoice === voice;
                    const isPreviewing = previewingVoice === voice;
                    const isRecommended = RECOMMENDED_VOICES.includes(voice);
                    return (
                      <div
                        key={voice}
                        className={`flex items-center justify-between gap-2 rounded-xl border p-3 transition cursor-pointer ${
                          isSelected
                            ? "border-[#5a58ab] bg-[#f0efff]"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                        onClick={() => setDraft((prev) => ({ ...prev, defaultVoice: voice }))}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold capitalize text-[#252e3d]">{voice}</span>
                            {isRecommended && (
                              <span className="rounded-full bg-[#5a58ab]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#5a58ab]">
                                Best
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[10px] text-slate-500 truncate">{VOICE_DESCRIPTIONS[voice]}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleVoicePreview(voice); }}
                          title={isPreviewing ? "Stop preview" : "Preview voice"}
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
                            isPreviewing
                              ? "border-[#5a58ab] bg-[#5a58ab] text-white"
                              : "border-slate-200 bg-white text-slate-500 hover:border-[#5a58ab] hover:text-[#5a58ab]"
                          }`}
                        >
                          {isPreviewing ? (
                            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                              <rect x="3" y="3" width="4" height="10" rx="1" />
                              <rect x="9" y="3" width="4" height="10" rx="1" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                              <path d="M4 3l9 5-9 5V3z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-[#5a58ab] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4a49a0] transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function buildPageNumbers(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  return Array.from(pages)
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
    .sort((left, right) => left - right);
}

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getInterviewStatus(booking: CandidateInterviewRecord["bookings"][number]) {
  if (booking.preference === "AI") {
    const s = booking.relatedApplication?.status;
    if (s === "INTERVIEW_COMPLETED") return "COMPLETED";
    if (s === "INTERVIEW_STARTED") return "IN_PROGRESS";
    if (s === "AI_INVITED") return "INVITED";
    if (s === "CANCELLED") return "CANCELLED";
    return "PENDING_SCHEDULE";
  }
  return booking.purchase.mockInterviewStatus || "PENDING";
}

function getAuditStatus(booking: CandidateInterviewRecord["bookings"][number]) {
  if (booking.preference === "AI") {
    return booking.relatedApplication?.session?.finalReport ? "COMPLETED" : "PENDING";
  }
  return booking.purchase.deliveryStatus;
}

function isBookingCompleted(booking: CandidateInterviewRecord["bookings"][number]) {
  if (booking.preference === "AI") {
    return (
      booking.relatedApplication?.session?.status === "COMPLETED" ||
      booking.relatedApplication?.status === "INTERVIEW_COMPLETED" ||
      booking.purchase.deliveryStatus === "COMPLETED"
    );
  }

  return (
    booking.purchase.mockInterviewStatus === "COMPLETED" ||
    booking.purchase.deliveryStatus === "COMPLETED" ||
    Boolean(booking.details.interviewOutcome)
  );
}

function StatCard({ label, value, info }: { label: string; value: number; info?: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] px-4 py-3">
      <div className="flex items-center justify-between gap-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        {info && <InfoTooltip text={info} title={label} position="top" />}
      </div>
      <p className="mt-1 text-xl font-semibold text-[#252e3d]">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">{children}</span>;
}

function StatusBadge({ children, tone }: { children: ReactNode; tone: string }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{children}</span>;
}

function getStatusBadge(val: string) {
  const upper = String(val).toUpperCase();
  if (["COMPLETED", "PAID"].includes(upper)) {
    return {
      dot: "bg-emerald-500",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }
  if (["INVITED", "IN_PROGRESS", "SCHEDULED", "AI_INVITED"].includes(upper)) {
    return {
      dot: "bg-[#5a58ab]",
      bg: "bg-indigo-50 text-[#5a58ab] border-indigo-200",
    };
  }
  if (["PENDING", "PENDING_SCHEDULE"].includes(upper)) {
    return {
      dot: "bg-amber-500",
      bg: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }
  if (["FAILED", "CANCELLED"].includes(upper)) {
    return {
      dot: "bg-rose-500",
      bg: "bg-rose-50 text-rose-700 border-rose-200",
    };
  }
  return {
    dot: "bg-slate-400",
    bg: "bg-slate-50 text-slate-700 border-slate-200",
  };
}

function MiniStat({ label, value, info }: { label: string; value: number | string; info?: string }) {
  const isStatus =
    typeof value === "string" &&
    ["COMPLETED", "INVITED", "PENDING", "FAILED", "IN_PROGRESS", "SCHEDULED", "CANCELLED"].includes(
      value.toUpperCase()
    );
  const badge = isStatus ? getStatusBadge(String(value)) : null;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs flex flex-col justify-between">
      <div className="flex items-center justify-between gap-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
        {info && <InfoTooltip text={info} title={label} position="top" />}
      </div>
      <div className="mt-2 min-w-0">
        {badge ? (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${badge.dot}`} />
            <span className="truncate">{value}</span>
          </span>
        ) : (
          <p className="text-xs sm:text-sm font-semibold text-[#252e3d] truncate" title={String(value)}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

function EditableMiniStat({
  label,
  value,
  options,
  purchaseId,
  field,
}: {
  label: string;
  value: string;
  options?: string[];
  purchaseId: string;
  field: "status" | "mockInterviewStatus" | "deliveryStatus";
}) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (newValue: string) => {
    setIsOpen(false);
    if (newValue === value) return;
    startTransition(() => {
      updatePurchaseStatus(purchaseId, field, newValue);
    });
  };

  if (!options) {
    return <MiniStat label={label} value={value} />;
  }

  const badge = getStatusBadge(value);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs flex flex-col justify-between relative" ref={dropdownRef}>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <div className="mt-2 relative">
        <button
          type="button"
          onClick={() => !isPending && setIsOpen(!isOpen)}
          disabled={isPending}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg} w-full justify-between transition hover:border-[#5a58ab]/40 cursor-pointer disabled:opacity-50`}
          title={`Change ${label} status`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${badge.dot}`} />
            <span className="truncate">{value}</span>
          </div>
          <div className="shrink-0 ml-1 text-slate-400">
            {isPending ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#5a58ab] border-t-transparent" />
            ) : (
              <IoChevronDownOutline className={`h-3 w-3 transition-transform duration-150 ${isOpen ? "rotate-180 text-[#5a58ab]" : ""}`} />
            )}
          </div>
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-full min-w-[130px] z-50 rounded-xl bg-white border border-slate-200 shadow-xl p-1">
            <div className="space-y-0.5">
              {options.map((opt) => {
                const optBadge = getStatusBadge(opt);
                const isSelected = opt === value;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                      isSelected
                        ? "bg-slate-100 text-slate-900 font-bold"
                        : "text-slate-800 hover:bg-[#f0efff] hover:text-[#5a58ab]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${optBadge.dot}`} />
                      <span className="truncate">{opt}</span>
                    </div>
                    {isSelected && (
                      <span className="text-[#5a58ab] text-xs font-bold shrink-0">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-slate-100 last:border-b-0 last:pb-0">
      <span className="text-xs font-medium text-slate-500 shrink-0">{label}</span>
      <span className="min-w-0 text-right text-sm font-semibold text-slate-800 break-normal">{value}</span>
    </div>
  );
}

function statusTone(status: string) {
  if (status === "COMPLETED" || status === "INTERVIEW_COMPLETED") return "bg-emerald-50 text-emerald-700";
  if (status === "SCHEDULED" || status === "INTERVIEW_STARTED") return "bg-sky-50 text-sky-700";
  if (status === "MANUAL_REVIEW_PENDING" || status === "PENDING_SCHEDULE") return "bg-amber-50 text-amber-700";
  if (status === "AI_INVITED") return "bg-[#f0efff] text-[#5a58ab]";
  return "bg-slate-100 text-slate-600";
}

