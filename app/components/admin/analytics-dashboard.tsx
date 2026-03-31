"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { AdminSubmission } from "@/lib/submission-types";
import {
  buildSubmissionAnalytics,
  type AnalyticsBucket,
} from "@/lib/admin-analytics";

interface AnalyticsDashboardProps {
  submissions: AdminSubmission[];
}

type RangeFilter = "7d" | "30d" | "all";

function percent(part: number, total: number): string {
  if (total === 0) {
    return "0%";
  }

  return `${Math.round((part / total) * 100)}%`;
}

function BarList({
  title,
  items,
}: {
  title: string;
  items: AnalyticsBucket[];
}) {
  const maxValue = items[0]?.count || 1;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
        {title}
      </h3>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No data yet.</p>
        ) : null}

        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-slate-700">{item.label}</span>
              <span className="font-semibold text-slate-900">{item.count}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-[#605dba]"
                style={{
                  width: `${Math.max((item.count / maxValue) * 100, 8)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AnalyticsDashboard({
  submissions,
}: AnalyticsDashboardProps) {
  const router = useRouter();
  const [range, setRange] = useState<RangeFilter>("30d");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const rangeFiltered = useMemo(() => {
    if (range === "all") {
      return submissions;
    }

    const days = range === "7d" ? 7 : 30;
    const start = Date.now() - days * 24 * 60 * 60 * 1000;

    return submissions.filter((item) => {
      return new Date(item.createdAt).getTime() >= start;
    });
  }, [range, submissions]);

  const analytics = useMemo(() => {
    return buildSubmissionAnalytics(rangeFiltered);
  }, [rangeFiltered]);

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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#605dba]">
                Admin Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-[#252e3d] sm:text-4xl">
                Submission Analytics
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Built from submission records and request headers (source,
                referrer, user-agent, IP/geo headers).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/dashboard"
                className="rounded-xl bg-[#252e3d] px-4 py-2 text-sm font-semibold text-white"
              >
                Analytics
              </Link>
              <Link
                href="/admin/submissions"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Submissions
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { key: "7d", label: "Last 7 Days" },
              { key: "30d", label: "Last 30 Days" },
              { key: "all", label: "All Time" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setRange(item.key as RangeFilter)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  range === item.key
                    ? "bg-[#252e3d] text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Total
            </p>
            <p className="mt-1 text-2xl font-semibold">{analytics.total}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Contact
            </p>
            <p className="mt-1 text-2xl font-semibold">{analytics.contact}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Job Seekers
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {analytics.jobSeekers}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Last 24h
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {analytics.last24Hours}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Unique Emails
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {analytics.uniqueEmails}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Unique IPs
            </p>
            <p className="mt-1 text-2xl font-semibold">{analytics.uniqueIps}</p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Conversion Signals
            </h3>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p>
                With phone: {analytics.conversionSignals.withPhone} (
                {percent(
                  analytics.conversionSignals.withPhone,
                  analytics.total,
                )}
                )
              </p>
              <p>
                Company provided: {analytics.conversionSignals.withCompany} (
                {percent(
                  analytics.conversionSignals.withCompany,
                  analytics.contact,
                )}
                )
              </p>
              <p>
                Candidate note provided:{" "}
                {analytics.conversionSignals.withDescription} (
                {percent(
                  analytics.conversionSignals.withDescription,
                  analytics.jobSeekers,
                )}
                )
              </p>
              <p>
                Resume uploaded: {analytics.withResume} (
                {percent(analytics.withResume, analytics.jobSeekers)})
              </p>
              <p>Repeat submitters: {analytics.repeatSubmitters}</p>
              <p>Submissions in last 7 days: {analytics.last7Days}</p>
            </div>
          </section>

          <BarList title="Daily Trend (14 Days)" items={analytics.dailyTrend} />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <BarList title="Top Source Paths" items={analytics.topSources} />
          <BarList title="Top Referrers" items={analytics.topReferrers} />
          <BarList title="Top Countries" items={analytics.topCountries} />
          <BarList title="Device Breakdown" items={analytics.deviceBreakdown} />
          <BarList
            title="Browser Breakdown"
            items={analytics.browserBreakdown}
          />
          <BarList title="OS Breakdown" items={analytics.osBreakdown} />
        </section>
      </div>
    </main>
  );
}
