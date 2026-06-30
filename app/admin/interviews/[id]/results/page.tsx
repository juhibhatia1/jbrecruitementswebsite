import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import type { InterviewFinalReport } from "@/lib/interview/types";

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
          startedAt: true,
          completedAt: true,
          evaluationEvents: true,
        },
      },
    },
  });

  return (
    <div
      className="min-h-screen bg-[#f4f6fb]"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/admin/interviews"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#252e3d] transition"
          >
            ← Templates
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm text-slate-600">{template.jobRole}</span>
        </div>

        <h1 className="text-2xl font-bold text-[#252e3d] mb-2">Interview Results</h1>
        <p className="text-sm text-slate-500 mb-8">
          {applications.length} application{applications.length !== 1 ? "s" : ""} for{" "}
          <strong>{template.jobRole}</strong>
        </p>

        {applications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-base font-semibold text-slate-600 mb-1">No applications yet</p>
            <p className="text-sm text-slate-400">
              Candidates who apply to this role will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const report = app.session?.finalReport as InterviewFinalReport | null;
              const events = (app.session?.evaluationEvents ?? []) as Array<{ score: number }>;
              const avgScore =
                events.length > 0
                  ? Math.round(events.reduce((a, e) => a + Number(e.score), 0) / events.length)
                  : null;

              return (
                <div
                  key={app.id}
                  className="rounded-2xl border border-slate-100 bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#252e3d]">{app.candidateName}</p>
                      <p className="text-sm text-slate-500">{app.candidateEmail}</p>
                      {app.candidatePhone && (
                        <p className="text-xs text-slate-400">{app.candidatePhone}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          app.status === "INTERVIEW_COMPLETED"
                            ? "bg-emerald-50 text-emerald-700"
                            : app.status === "INTERVIEW_STARTED"
                            ? "bg-blue-50 text-blue-700"
                            : app.status === "TOKEN_EXPIRED"
                            ? "bg-red-50 text-red-600"
                            : "bg-slate-50 text-slate-600"
                        }`}
                      >
                        {app.status.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          app.interviewPreference === "AI"
                            ? "bg-[#f0efff] text-[#5a58ab]"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {app.interviewPreference}
                      </span>
                    </div>
                  </div>

                  {app.session && report && (
                    <div className="mt-4 rounded-xl border border-slate-100 bg-[#f9fafc] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Interview Report
                        </p>
                        {(report.finalScore ?? avgScore) !== null && (
                          <span className="text-sm font-semibold text-[#5a58ab]">
                            Score: {report.finalScore ?? avgScore} / 10
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed mb-3">
                        {report.summary}
                      </p>
                      {report.strengths?.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-semibold text-emerald-700 mb-1">Strengths</p>
                          <ul className="space-y-0.5">
                            {report.strengths.map((s, i) => (
                              <li key={i} className="text-xs text-slate-600 flex gap-1.5">
                                <span className="text-emerald-500">+</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {report.improvements?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-amber-700 mb-1">Improvements</p>
                          <ul className="space-y-0.5">
                            {report.improvements.map((s, i) => (
                              <li key={i} className="text-xs text-slate-600 flex gap-1.5">
                                <span className="text-amber-500">△</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {app.linkedInUrl && (
                    <div className="mt-3">
                      <a
                        href={app.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#5a58ab] underline underline-offset-2"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}

                  <div className="mt-2 text-xs text-slate-400">
                    Applied {new Date(app.createdAt).toLocaleDateString()}
                    {app.session?.completedAt &&
                      ` · Completed ${new Date(app.session.completedAt).toLocaleDateString()}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
