"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { IoSearch, IoClose } from "react-icons/io5";
import { RegenerateLinkModal } from "@/app/components/admin/regenerate-link-modal";

export interface ResultRowItem {
  id: string;
  candidateName: string;
  candidateEmail: string;
  interviewPreference: "AI" | "MANUAL";
  status: string;
  score: number | null;
  dateStr: string;
  templateId: string;
}

const STATUS_STYLES: Record<string, string> = {
  INTERVIEW_COMPLETED: "bg-emerald-50 text-emerald-700",
  INTERVIEW_STARTED:   "bg-blue-50 text-blue-700",
  TOKEN_EXPIRED:       "bg-red-50 text-red-600",
  AI_INVITED:          "bg-[#f0efff] text-[#5a58ab]",
};

export default function ResultsTable({
  items,
  templateId,
}: {
  items: ResultRowItem[];
  templateId: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedAppForLink, setSelectedAppForLink] = useState<ResultRowItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.candidateName.toLowerCase().includes(q) ||
        item.candidateEmail.toLowerCase().includes(q)
      );
    });
  }, [items, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, safeCurrentPage, itemsPerPage]);

  const statusOptions = [
    { label: "All Statuses", value: "ALL" },
    { label: "Completed", value: "INTERVIEW_COMPLETED" },
    { label: "In Progress", value: "INTERVIEW_STARTED" },
    { label: "Invited", value: "AI_INVITED" },
    { label: "Expired", value: "TOKEN_EXPIRED" },
  ];

  return (
    <div className="space-y-4">
      {/* Search and filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-100 p-4 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-72">
          <IoSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search candidate or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-8 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm text-slate-700 outline-none rounded-xl border border-slate-200 transition focus:border-[#5a58ab]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <IoClose className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500 shrink-0">Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-[#5a58ab] cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-xs">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-semibold text-slate-600 mb-1">No candidate bookings found</p>
            <p className="text-xs text-slate-400">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-semibold">Candidate</th>
                  <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Type</th>
                  <th className="px-5 py-3 text-left font-semibold hidden sm:table-cell">Status</th>
                  <th className="px-5 py-3 text-center font-semibold">Score</th>
                  <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Date</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedItems.map((app) => {
                  const score = app.score;
                  const scoreColor =
                    score === null
                      ? "text-slate-400"
                      : score >= 7
                      ? "text-emerald-600"
                      : score >= 5
                      ? "text-amber-600"
                      : "text-red-500";

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-[#252e3d]">{app.candidateName}</p>
                        <p className="text-xs text-slate-400">{app.candidateEmail}</p>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            app.interviewPreference === "AI"
                              ? "bg-[#f0efff] text-[#5a58ab]"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {app.interviewPreference === "AI" ? "AI Interview" : "Coach Session"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            STATUS_STYLES[app.status] ?? "bg-slate-50 text-slate-600"
                          }`}
                        >
                          {app.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`text-base font-bold ${scoreColor}`}>
                          {score !== null ? `${score}/10` : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 hidden md:table-cell">
                        {app.dateStr}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {app.interviewPreference === "AI" && (
                            <button
                              type="button"
                              onClick={() => setSelectedAppForLink(app)}
                              className="rounded-lg border border-[#5a58ab]/30 bg-[#f0efff] hover:bg-[#e8e7ff] text-[#5a58ab] px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer"
                              title="Regenerate & share interview link"
                            >
                              ↻ Link
                            </button>
                          )}
                          <Link
                            href={`/admin/interviews/${templateId}/results/${app.id}`}
                            className="rounded-lg bg-[#252e3d] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2d3645] transition"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination controls footer */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/50 text-xs sm:text-sm">
                <span className="text-slate-500 font-medium">
                  Showing {(safeCurrentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(safeCurrentPage * itemsPerPage, filteredItems.length)} of{" "}
                  {filteredItems.length} entries
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeCurrentPage === 1}
                    className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold text-slate-700 rounded-xl cursor-pointer shadow-2xs"
                  >
                    Previous
                  </button>
                  <span className="font-semibold text-slate-700 px-2 text-xs">
                    Page {safeCurrentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safeCurrentPage === totalPages}
                    className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold text-slate-700 rounded-xl cursor-pointer shadow-2xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedAppForLink && (
        <RegenerateLinkModal
          isOpen={true}
          onClose={() => setSelectedAppForLink(null)}
          applicationId={selectedAppForLink.id}
          candidateEmail={selectedAppForLink.candidateEmail}
          candidateName={selectedAppForLink.candidateName}
        />
      )}
    </div>
  );
}
