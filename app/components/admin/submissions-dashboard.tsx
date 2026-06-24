"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminSubmission } from "@/lib/submission-types";
import { IoAlertCircle } from "react-icons/io5";

type FilterValue = "all" | "contact" | "job-seeker";

interface SubmissionsDashboardProps {
  submissions: AdminSubmission[];
  dbError?: string | null;
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isToday(isoDate: string): boolean {
  const now = new Date();
  const created = new Date(isoDate);

  return (
    now.getFullYear() === created.getFullYear() &&
    now.getMonth() === created.getMonth() &&
    now.getDate() === created.getDate()
  );
}

export default function SubmissionsDashboard({
  submissions,
  dbError,
}: SubmissionsDashboardProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const filteredSubmissions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return submissions.filter((item) => {
      if (filter !== "all" && item.type !== filter) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      const searchField = [
        item.name,
        item.email,
        item.phone,
        item.type === "contact" ? item.company : item.location,
        item.type === "contact" ? item.message : item.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchField.includes(normalized);
    });
  }, [filter, query, submissions]);

  const stats = useMemo(() => {
    const total = submissions.length;
    const contact = submissions.filter(
      (item) => item.type === "contact",
    ).length;
    const jobSeekers = submissions.filter(
      (item) => item.type === "job-seeker",
    ).length;
    const today = submissions.filter((item) => isToday(item.createdAt)).length;

    return { total, contact, jobSeekers, today };
  }, [submissions]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
    } finally {
      router.replace("/admin");
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f6fb] px-4 py-8 text-[#252e3d] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#605dba]">
                Admin Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-[#252e3d] sm:text-4xl">
                Form Submissions
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Review and track contact enquiries and job seeker applications
                in one place.
              </p>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/dashboard"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Analytics
              </Link>
              <Link
                href="/admin/submissions"
                className="rounded-xl bg-[#252e3d] px-4 py-2 text-sm font-semibold text-white"
              >
                Submissions
              </Link>
              <Link
                href="/admin/directory"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                User Directory
              </Link>
              <Link
                href="/admin/knowledge"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Chatbot & KB
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-[#f3f4ff] p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Total
              </p>
              <p className="mt-1 text-2xl font-semibold">{stats.total}</p>
            </div>
            <div className="rounded-2xl bg-[#eefbf5] p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Contact
              </p>
              <p className="mt-1 text-2xl font-semibold">{stats.contact}</p>
            </div>
            <div className="rounded-2xl bg-[#edf6ff] p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Job Seekers
              </p>
              <p className="mt-1 text-2xl font-semibold">{stats.jobSeekers}</p>
            </div>
            <div className="rounded-2xl bg-[#fff7ea] p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Today
              </p>
              <p className="mt-1 text-2xl font-semibold">{stats.today}</p>
            </div>
          </div>
        </header>

        {dbError && (
          <div className="p-5 bg-amber-50 border-l-4 border-amber-500 rounded-3xl text-amber-900 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <IoAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
              <span>{dbError}</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer self-start sm:self-auto"
            >
              Retry Connection
            </button>
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder="Search by name, email, message, company, location..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#605dba] focus:bg-white lg:max-w-xl"
            />

            <div className="flex flex-wrap gap-2">
              <button
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  filter === "all"
                    ? "bg-[#252e3d] text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  filter === "contact"
                    ? "bg-[#252e3d] text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setFilter("contact")}
              >
                Contact
              </button>
              <button
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  filter === "job-seeker"
                    ? "bg-[#252e3d] text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setFilter("job-seeker")}
              >
                Job Seekers
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {filteredSubmissions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No submissions found for the selected filter.
              </div>
            ) : null}

            {filteredSubmissions.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          item.type === "contact"
                            ? "bg-[#eefbf5] text-[#166534]"
                            : "bg-[#edf6ff] text-[#1d4ed8]"
                        }`}
                      >
                        {item.type === "contact"
                          ? "Contact Form"
                          : "Job Seeker"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>

                    <h3 className="mt-2 text-xl font-semibold text-[#252e3d]">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{item.email}</p>
                    {item.phone ? (
                      <p className="text-sm text-slate-500">
                        Phone: {item.phone}
                      </p>
                    ) : null}
                  </div>
                </div>

                {item.type === "contact" ? (
                  <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Company
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {item.company || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Subject
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {item.subject || "General enquiry"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Message
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                        {item.message}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Request Context
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        Source: {item.requestMeta?.sourcePath || "Unknown"} |
                        Browser: {item.requestMeta?.browser || "Unknown"} | OS:{" "}
                        {item.requestMeta?.os || "Unknown"} | Device:{" "}
                        {item.requestMeta?.deviceType || "unknown"}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        Country: {item.requestMeta?.country || "Unknown"} |
                        Referrer: {item.requestMeta?.referrer || "Direct"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Location
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {item.location || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Resume
                      </p>
                      {item.resumeUrl ? (
                        <a
                          href={item.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-block text-sm font-semibold text-[#3055cc] hover:underline"
                        >
                          {item.resumeFileName || "View Resume"}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm text-slate-700">
                          Not uploaded
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Candidate Note
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                        {item.description || "No description provided."}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Request Context
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        Source: {item.requestMeta?.sourcePath || "Unknown"} |
                        Browser: {item.requestMeta?.browser || "Unknown"} | OS:{" "}
                        {item.requestMeta?.os || "Unknown"} | Device:{" "}
                        {item.requestMeta?.deviceType || "unknown"}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        Country: {item.requestMeta?.country || "Unknown"} |
                        Referrer: {item.requestMeta?.referrer || "Direct"}
                      </p>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
