import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import type { InterviewFinalReport, InterviewEvaluationEvent, InterviewTranscriptEntry } from "@/lib/interview/types";
import ResultActions from "./result-actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string; applicationId: string }> };

export default async function AdminResultDetailPage({ params }: Props) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSessionToken(token)) redirect("/admin");

  const { id, applicationId } = await params;

  const app = await prisma.candidateApplication.findUnique({
    where: { id: applicationId, templateId: id },
    include: {
      template: { select: { jobRole: true, ownerRole: true } },
      session: true,
    },
  });

  if (!app || app.template.ownerRole !== "ADMIN") notFound();

  const report  = app.session?.finalReport  as InterviewFinalReport | null;
  const events  = (app.session?.evaluationEvents ?? []) as InterviewEvaluationEvent[];
  const transcript = (app.session?.transcript ?? []) as InterviewTranscriptEntry[];
  const avgScore = events.length > 0
    ? Math.round(events.reduce((a, e) => a + Number(e.score), 0) / events.length)
    : null;
  const finalScore = report?.finalScore ?? avgScore;

  const scoreColor = finalScore === null ? "text-slate-400"
    : finalScore >= 7 ? "text-emerald-600"
    : finalScore >= 5 ? "text-amber-600"
    : "text-red-500";

  return (
    <div className="min-h-screen bg-[#f4f6fb]" style={{ fontFamily: "Raleway, sans-serif" }}>
      <div className="mx-auto max-w-4xl px-4 md:px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <Link href="/admin/interviews" className="hover:text-[#252e3d] transition">Templates</Link>
          <span className="text-slate-300">/</span>
          <Link href={`/admin/interviews/${id}/results`} className="hover:text-[#252e3d] transition">{app.template.jobRole}</Link>
          <span className="text-slate-300">/</span>
          <span className="text-[#252e3d] font-medium">{app.candidateName}</span>
        </div>

        {/* Candidate header card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 mb-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#252e3d]">{app.candidateName}</h1>
              <p className="text-sm text-slate-500">{app.candidateEmail}</p>
              {app.candidatePhone && <p className="text-xs text-slate-400 mt-0.5">{app.candidatePhone}</p>}
              {app.linkedInUrl && (
                <a href={app.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#5a58ab] underline underline-offset-2 mt-1 inline-block">
                  LinkedIn Profile
                </a>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              {finalScore !== null && (
                <div className="rounded-xl bg-[#5a58ab] px-5 py-3 text-center">
                  <p className={`text-3xl font-extrabold leading-none ${scoreColor === "text-emerald-600" ? "text-white" : "text-white"}`}>
                    {finalScore}
                  </p>
                  <p className="text-[10px] text-white/70 font-semibold mt-0.5">/ 10</p>
                </div>
              )}
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                app.status === "INTERVIEW_COMPLETED" ? "bg-emerald-50 text-emerald-700"
                : app.status === "INTERVIEW_STARTED" ? "bg-blue-50 text-blue-700"
                : "bg-slate-50 text-slate-600"
              }`}>
                {app.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
            <span>Booked {new Date(app.createdAt).toLocaleDateString()}</span>
            {app.session?.completedAt && <span>Completed {new Date(app.session.completedAt).toLocaleDateString()}</span>}
            <span>{app.interviewPreference === "AI" ? "AI Interview" : "Coach Session"}</span>
          </div>
        </div>

        {/* Action buttons */}
        {app.session && report && (
          <ResultActions sessionId={app.session.id} candidateEmail={app.candidateEmail} />
        )}

        {/* Report */}
        {report ? (
          <div className="space-y-4 mt-5">
            {/* Summary */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Summary</p>
              <p className="text-sm text-slate-700 leading-relaxed">{report.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              {report.strengths.length > 0 && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3">Strengths</p>
                  <ul className="space-y-2">
                    {report.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-slate-700 flex gap-2">
                        <span className="text-emerald-500 font-bold shrink-0">+</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Improvements */}
              {report.improvements.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-3">Areas to Improve</p>
                  <ul className="space-y-2">
                    {report.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-slate-700 flex gap-2">
                        <span className="text-amber-500 font-bold shrink-0">△</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Evaluation events */}
            {events.length > 0 && (
              <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Question-by-Question Evaluation</p>
                </div>
                <div className="divide-y divide-slate-50">
                  {events.map((ev, i) => (
                    <div key={i} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-sm font-semibold text-[#252e3d]">{ev.question}</p>
                        <span className={`shrink-0 text-sm font-bold ${Number(ev.score) >= 7 ? "text-emerald-600" : Number(ev.score) >= 5 ? "text-amber-600" : "text-red-500"}`}>
                          {ev.score}/10
                        </span>
                      </div>
                      {ev.answerSummary && (
                        <p className="text-xs text-slate-500 mb-1.5"><span className="font-medium">Answer: </span>{ev.answerSummary}</p>
                      )}
                      {ev.feedback && (
                        <p className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">{ev.feedback}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center mt-5">
            <p className="text-sm text-slate-500">No report available for this session.</p>
          </div>
        )}

        {/* Transcript */}
        {transcript.length > 0 && (
          <div className="mt-5 rounded-2xl border border-slate-100 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Transcript</p>
              <span className="text-xs text-slate-400">{transcript.length} messages</span>
            </div>
            <div className="px-5 py-4 max-h-96 overflow-y-auto space-y-3">
              {transcript.map((entry, i) => (
                <div key={i} className={`flex gap-2.5 ${entry.role === "interviewer" ? "" : "flex-row-reverse"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${entry.role === "interviewer" ? "bg-[#5a58ab]" : "bg-slate-200"}`}>
                    <span className="text-[9px] font-bold text-white">{entry.role === "interviewer" ? "AI" : "C"}</span>
                  </div>
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${entry.role === "interviewer" ? "bg-[#f0efff] text-[#252e3d]" : "bg-slate-100 text-slate-700"}`}>
                    {entry.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
