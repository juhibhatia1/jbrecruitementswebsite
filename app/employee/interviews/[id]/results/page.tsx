import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { EMPLOYEE_SESSION_COOKIE, isValidEmployeeSessionToken } from "@/lib/employee-auth";
import { prisma } from "@/lib/prisma";
import type { InterviewFinalReport } from "@/lib/interview/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

const STATUS_STYLES: Record<string, string> = {
  INTERVIEW_COMPLETED: "bg-emerald-50 text-emerald-700",
  INTERVIEW_STARTED:   "bg-blue-50 text-blue-700",
  TOKEN_EXPIRED:       "bg-red-50 text-red-600",
  AI_INVITED:          "bg-[#f0efff] text-[#5a58ab]",
};

export default async function EmployeeInterviewResultsPage({ params }: Props) {
  const cookieStore = await cookies();
  const token = cookieStore.get(EMPLOYEE_SESSION_COOKIE)?.value;
  if (!isValidEmployeeSessionToken(token)) redirect("/employee");

  const { id } = await params;

  const template = await prisma.interviewTemplate.findUnique({
    where: { id, ownerRole: "EMPLOYEE" },
    select: { id: true, jobRole: true },
  });
  if (!template) notFound();

  const applications = await prisma.candidateApplication.findMany({
    where: { templateId: id },
    orderBy: { createdAt: "desc" },
    include: {
      session: {
        select: {
          id: true,
          status: true,
          finalReport: true,
          evaluationEvents: true,
          completedAt: true,
        },
      },
    },
  });

  const completed = applications.filter((a) => a.status === "INTERVIEW_COMPLETED").length;

  const scoreOf = (app: typeof applications[0]) => {
    const report = app.session?.finalReport as InterviewFinalReport | null;
    if (report?.finalScore != null) return report.finalScore;
    const events = (app.session?.evaluationEvents ?? []) as Array<{ score: number }>;
    if (events.length > 0)
      return Math.round(events.reduce((a, e) => a + Number(e.score), 0) / events.length);
    return null;
  };

  return (
    <div
      className="min-h-screen bg-[#f4f6fb]"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-8">
        {/* Header nav */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#252e3d]">Interview Results</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {template.jobRole} — {applications.length} booking{applications.length !== 1 ? "s" : ""} · {completed} completed
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/employee/directory"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Candidate Directory
            </Link>
            <Link
              href="/employee/interviews"
              className="rounded-xl bg-[#252e3d] px-4 py-2 text-sm font-semibold text-white"
            >
              Interviews
            </Link>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/employee/interviews" className="hover:text-[#252e3d] transition">Templates</Link>
          <span className="text-slate-300">/</span>
          <span className="text-[#252e3d] font-medium">{template.jobRole} · Results</span>
        </div>

        {/* Stats */}
        {applications.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Bookings", value: applications.length },
              { label: "Completed", value: completed },
              { label: "In Progress", value: applications.filter((a) => a.status === "INTERVIEW_STARTED").length },
              {
                label: "Avg Score",
                value: (() => {
                  const scores = applications.map(scoreOf).filter((s): s is number => s !== null);
                  return scores.length > 0
                    ? `${(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)} / 10`
                    : "—";
                })(),
              },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white px-5 py-4">
                <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                <p className="text-xl font-bold text-[#252e3d]">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {applications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-base font-semibold text-slate-600 mb-1">No bookings yet</p>
            <p className="text-sm text-slate-400">Candidates who book this session will appear here.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
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
                {applications.map((app) => {
                  const score = scoreOf(app);
                  const scoreColor =
                    score === null ? "text-slate-400"
                    : score >= 7 ? "text-emerald-600"
                    : score >= 5 ? "text-amber-600"
                    : "text-red-500";
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-[#252e3d]">{app.candidateName}</p>
                        <p className="text-xs text-slate-400">{app.candidateEmail}</p>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${app.interviewPreference === "AI" ? "bg-[#f0efff] text-[#5a58ab]" : "bg-gray-100 text-gray-600"}`}>
                          {app.interviewPreference === "AI" ? "AI Interview" : "Coach Session"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[app.status] ?? "bg-slate-50 text-slate-600"}`}>
                          {app.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`text-base font-bold ${scoreColor}`}>
                          {score !== null ? `${score}/10` : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 hidden md:table-cell">
                        {app.session?.completedAt
                          ? new Date(app.session.completedAt).toLocaleDateString()
                          : new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/employee/interviews/${id}/results/${app.id}`}
                          className="rounded-lg bg-[#252e3d] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2d3645] transition"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
