import { prisma } from "@/lib/prisma";
import type { InterviewFinalReport, InterviewEvaluationEvent, InterviewTranscriptEntry } from "@/lib/interview/types";
import { TranscriptTimeline } from "@/app/components/interviews/transcript-timeline";
import { buildTimeline } from "@/app/components/interviews/timeline-utils";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

type Props = { params: Promise<{ sessionId: string }> };

export const metadata: Metadata = {
  title: "Interview Results | JB Recruitment Solutions",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function InterviewResultsPage({ params }: Props) {
  const { sessionId } = await params;

  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      application: {
        select: {
          candidateName: true,
          candidateEmail: true,
          template: { select: { jobRole: true } },
        },
      },
    },
  });

  if (!session) {
    return <ErrorView message="Results not found. This link may be invalid or has expired." />;
  }

  const report = session.finalReport as InterviewFinalReport | null;
  if (!report) {
    return <ErrorView message="Your results are being processed. Please check back in a few minutes." />;
  }

  const events = (session.evaluationEvents ?? []) as unknown as InterviewEvaluationEvent[];
  const transcript = (session.transcript ?? []) as unknown as InterviewTranscriptEntry[];
  const timelineItems = buildTimeline(transcript, []);
  const avgScore =
    events.length > 0
      ? Math.round(events.reduce((a, e) => a + Number(e.score), 0) / events.length)
      : null;
  const finalScore = report.finalScore ?? avgScore;
  const { candidateName } = session.application;
  const { jobRole } = session.application.template;

  const scoreColor =
    finalScore === null ? "#5a58ab"
    : finalScore >= 8 ? "#16a34a"
    : finalScore >= 6 ? "#d97706"
    : "#dc2626";

  return (
    <div
      className="min-h-screen bg-[#F9F9FB] text-[#252E3D]"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      {/* Top nav bar */}
      <nav className="fixed top-0 inset-x-0 z-30 border-b border-[#e0e0e0] bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 md:px-6 h-14 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.avif" alt="JB Recruitment Solutions" width={80} height={32} className="h-8 w-auto" />
          </Link>
          <span className="text-xs text-gray-400 font-medium">Performance Report</span>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 md:px-6 pt-24 pb-20">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5a58ab] mb-2">
            AI Mock Interview
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#252e3d] mb-1">
            {jobRole}
          </h1>
          <p className="text-sm text-gray-500">
            {candidateName}
            {session.completedAt && (
              <>
                {" · "}
                {new Date(session.completedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </>
            )}
          </p>
        </div>

        {/* Score card */}
        {finalScore !== null && (
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Overall Score
            </p>
            <div
              className="inline-flex items-end gap-1 font-bold leading-none"
              style={{ color: scoreColor }}
            >
              <span className="text-6xl">{finalScore}</span>
              <span className="text-2xl text-gray-400 mb-1">/10</span>
            </div>
            <p className="mt-3 text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
              {report.summary}
            </p>
          </div>
        )}

        {finalScore === null && (
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Summary</p>
            <p className="text-sm text-gray-700 leading-relaxed">{report.summary}</p>
          </div>
        )}

        {/* Improvements */}
        {report.improvements?.length > 0 && (
          <div className="rounded-2xl border-2 border-orange-300 bg-orange-50 p-6 mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-700 mb-3">
              Your Improvement Plan
            </p>
            <ol className="space-y-2 pl-1">
              {report.improvements.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-800 leading-relaxed">
                  <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-orange-200 text-orange-800 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Weaknesses */}
        {report.weaknesses?.length > 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-red-700 mb-3">
              Observed Weaknesses
            </p>
            <ul className="space-y-2">
              {report.weaknesses.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-800 leading-relaxed">
                  <span className="shrink-0 mt-0.5 text-red-500 font-bold">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Strengths */}
        {report.strengths?.length > 0 && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-green-700 mb-3">
              Strengths
            </p>
            <ul className="space-y-2">
              {report.strengths.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-800 leading-relaxed">
                  <span className="shrink-0 mt-0.5 text-green-600 font-bold">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Q&A breakdown */}
        {events.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-lg font-semibold text-[#252e3d] mb-4"
              style={{ fontFamily: "Crimson Text, serif" }}
            >
              Question-by-Question Evaluation
            </h2>
            <div className="space-y-3">
              {events.map((ev, i) => {
                const sc = Number(ev.score);
                const scColor = sc >= 8 ? "#16a34a" : sc >= 6 ? "#d97706" : "#dc2626";
                const scBg = sc >= 8 ? "bg-green-50 border-green-200" : sc >= 6 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";
                return (
                  <div
                    key={i}
                    className={`rounded-2xl border bg-white p-5`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="text-sm font-semibold text-[#252e3d] flex-1 leading-snug">
                        <span className="text-[#5a58ab] mr-1.5">Q{i + 1}.</span>
                        {ev.question}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold border ${scBg}`}
                        style={{ color: scColor }}
                      >
                        {sc}/10
                      </span>
                    </div>
                    {ev.answerSummary && (
                      <p className="text-xs text-gray-500 mb-2 leading-relaxed">
                        <span className="font-semibold">Your answer:</span> {ev.answerSummary}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">{ev.feedback}</p>
                    {ev.improvementTip && (
                      <div className="rounded-lg border-l-4 border-orange-400 bg-orange-50 px-3 py-2">
                        <p className="text-xs text-orange-800 leading-relaxed">
                          <span className="font-bold">Tip: </span>
                          {ev.improvementTip}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Transcript */}
        {timelineItems.length > 0 && (
          <div className="mt-5 mb-6 rounded-2xl border border-slate-100 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Full Transcript
              </p>
              <span className="text-xs text-slate-400">
                {transcript.length} messages
              </span>
            </div>
            <div className="px-5 py-4 max-h-[32rem] overflow-y-auto">
              <TranscriptTimeline items={timelineItems} />
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-400 mt-10">
          © {new Date().getFullYear()} JB Recruitment Solutions — Auto-generated report
        </div>
      </main>
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#F9F9FB] px-4"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <div className="max-w-sm text-center">
        <p
          className="text-xl font-semibold text-[#252e3d] mb-3"
          style={{ fontFamily: "Crimson Text, serif" }}
        >
          Report Unavailable
        </p>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <Link
          href="/"
          className="inline-block rounded-xl border border-[#e0e0e0] bg-white px-5 py-2.5 text-sm font-semibold text-[#252e3d] transition hover:bg-gray-50"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
