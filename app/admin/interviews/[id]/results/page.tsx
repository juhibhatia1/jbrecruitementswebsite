import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import type { InterviewFinalReport } from "@/lib/interview/types";
import ResultsTable, { ResultRowItem } from "./results-table";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminInterviewResultsPage({ params }: Props) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSessionToken(token)) redirect("/admin");

  const { id } = await params;

  const template = await prisma.interviewTemplate.findUnique({
    where: { id, ownerRole: "ADMIN" },
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

  const tableItems: ResultRowItem[] = applications.map((app) => ({
    id: app.id,
    candidateName: app.candidateName,
    candidateEmail: app.candidateEmail,
    interviewPreference: app.interviewPreference,
    status: app.status,
    score: scoreOf(app),
    dateStr: app.session?.completedAt
      ? new Date(app.session.completedAt).toLocaleDateString()
      : new Date(app.createdAt).toLocaleDateString(),
    templateId: id,
  }));

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
            <NavLink href="/admin/dashboard" label="Analytics" />
            <NavLink href="/admin/submissions" label="Submissions" />
            <NavLink href="/admin/directory" label="User Directory" />
            <NavLink href="/admin/knowledge" label="Chatbot & KB" />
            <NavLink href="/admin/interviews" label="Interviews" active />
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/admin/interviews" className="hover:text-[#252e3d] transition">Templates</Link>
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

        {/* Paginated Results Table */}
        <ResultsTable items={tableItems} templateId={id} />
      </div>
    </div>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-xl bg-[#252e3d] px-4 py-2 text-sm font-semibold text-white"
          : "rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      }
    >
      {label}
    </Link>
  );
}
