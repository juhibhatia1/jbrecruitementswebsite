"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { IoArrowForwardOutline, IoChevronDownOutline, IoAddCircleOutline, IoArrowBackOutline } from "react-icons/io5";
import type { CandidateInterviewRecord, CandidateInterviewBooking } from "./page";
import { PiXCircleDuotone } from "react-icons/pi";
import { updatePurchaseStatus } from "./actions";
import CreateCandidateInterviewModal from "@/app/components/admin/create-candidate-interview-modal";
import InfoTooltip from "@/app/components/ui/info-tooltip";

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
      </div>      {isInterviewModalOpen && selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#252e3d]/50 backdrop-blur-xs" onClick={() => setIsInterviewModalOpen(false)} />

          <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-[#f4f6fb] shadow-2xl" role="dialog" aria-modal="true" aria-label="Selected interview details">
            <button
              onClick={() => setIsInterviewModalOpen(false)}
              className="absolute right-5 top-5 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-500 shadow-md transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
              title="Close Popup"
            >
              <PiXCircleDuotone className="h-6 w-6" />
            </button>

            <header className="border-b border-slate-200 bg-white px-6 py-5 pr-16">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Drilldown Analysis</p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold text-[#252e3d] sm:text-2xl" style={{ fontFamily: "Crimson Text, serif" }}>
                  Selected interview
                </h1>
                <p className="text-sm text-slate-500">
                  {selectedInterview.purchase.serviceName} · {selectedInterview.purchase.candidateName}
                </p>
              </div>
            </header>

            <div className="grid gap-4 px-6 py-5 lg:grid-cols-[1.05fr_0.95fr]">
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Snapshot</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                    label="Audit"
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
                    label="Booking"
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

                <div className="mt-4 rounded-2xl border border-slate-100 bg-[#fbfbfd] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">What they paid for</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <Line label="Service" value={selectedInterview.purchase.serviceName} />
                    <Line label="Amount" value={`${selectedInterview.purchase.currency.toUpperCase()} ${selectedInterview.purchase.amount.toLocaleString()}`} />
                    {selectedInterview.preference === "MANUAL" ? (
                      <>
                        <Line label="Role" value={selectedInterview.details.jobRole || "Not provided"} />
                        <Line label="Experience" value={selectedInterview.details.yearsOfExperience || "Not provided"} />
                      </>
                    ) : selectedInterview.relatedApplication ? (
                      <>
                        <Line label="Target role" value={selectedInterview.relatedApplication.template.jobRole} />
                        <Line label="Duration" value={`${selectedInterview.relatedApplication.template.durationMinutes} min`} />
                      </>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Details</p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Candidate</p>
                    <p className="mt-2 text-sm text-slate-700">{selectedInterview.purchase.candidateEmail}</p>
                    {selectedInterview.purchase.candidatePhone && <p className="mt-1 text-sm text-slate-600">{selectedInterview.purchase.candidatePhone}</p>}
                    <p className="mt-1 text-sm text-slate-600">{selectedInterview.purchase.country || "Country not provided"}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Summary</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                      {selectedInterview.preference === "AI"
                        ? selectedReport?.summary || "No report summary yet."
                        : selectedInterview.details.interviewOutcome || "No human interview outcome logged yet."}
                    </p>
                  </div>

                  {selectedInterview.preference === "MANUAL" && selectedInterview.details.applicationLink && (
                    <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Application link</p>
                      <div className="mt-2 flex items-center gap-2">
                        <a
                          href={selectedInterview.details.applicationLink}
                          target="_blank"
                          rel="noreferrer"
                          title={selectedInterview.details.applicationLink}
                          className="inline-flex max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#5a58ab] transition hover:bg-slate-50"
                        >
                          Open application
                          <IoArrowForwardOutline className="h-4 w-4 shrink-0" />
                        </a>
                        <span
                          className="min-w-0 truncate text-[10px] text-slate-400"
                          title={selectedInterview.details.applicationLink}
                        >
                          {new URL(selectedInterview.details.applicationLink).hostname}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
              {selectedInterview.relatedApplication?.session?.id && selectedInterview.preference === "AI" && (
                <Link
                  href={`/interview/results/${selectedInterview.relatedApplication.session.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#5a58ab] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4a489b] whitespace-nowrap"
                >
                  Report
                  <IoArrowForwardOutline className="h-4 w-4" />
                </Link>
              )}
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

function MiniStat({ label, value, info }: { label: string; value: number | string; info?: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] px-3 py-2 text-center">
      <div className="flex items-center justify-center gap-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        {info && <InfoTooltip text={info} title={label} position="top" />}
      </div>
      <p className="mt-1 text-sm font-semibold text-[#252e3d]">{value}</p>
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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    startTransition(() => {
      updatePurchaseStatus(purchaseId, field, newValue);
    });
  };

  if (!options) {
    return <MiniStat label={label} value={value} />;
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] px-3 py-2 text-center relative flex flex-col justify-center items-center group">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <div className="mt-1 relative w-full flex justify-center">
        <select
          value={value}
          onChange={handleChange}
          disabled={isPending}
          className="appearance-none bg-transparent outline-none text-sm font-semibold text-[#252e3d] cursor-pointer text-center group-hover:text-[#5a58ab] transition disabled:opacity-50"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          {/* Include current value if it's not in options, so it displays correctly */}
          {!options.includes(value) && (
            <option value={value}>{value}</option>
          )}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-400 group-hover:text-[#5a58ab] transition">
          {isPending ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#5a58ab] border-t-transparent" />
          ) : (
            <IoChevronDownOutline className="h-3 w-3" />
          )}
        </div>
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <span className="min-w-0 flex-1 text-right text-sm font-medium text-slate-700 break-words">{value}</span>
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

