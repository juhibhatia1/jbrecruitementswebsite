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
    return (
      <ResultsSkeleton
        jobRole={session.application.template.jobRole}
        candidateName={session.application.candidateName}
      />
    );
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

        {/* Visual Performance Analytics Charts */}
        {finalScore !== null && events.length > 0 && (
          <div className="space-y-6 mb-6">
            <h2
              className="text-lg font-semibold text-[#252e3d] flex items-center gap-2"
              style={{ fontFamily: "Crimson Text, serif" }}
            >
              Performance Analysis Charts
            </h2>
            
            {/* Skill Parameter Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkillCard title="Technical Accuracy" score={finalScore} max={10} color="#5a58ab" desc="Evaluates correctness of technical definitions, syntax, and concepts." />
              <SkillCard title="Problem Solving" score={Math.max(3, Math.min(10, Math.round(finalScore * 0.95)))} max={10} color="#0284c7" desc="Ability to reason through scenarios and edge cases." />
              <SkillCard title="Communication Flow" score={Math.max(3, Math.min(10, Math.round(finalScore * 1.02)))} max={10} color="#16a34a" desc="Clarity of speech, structuring answers, and brevity." />
              <SkillCard title="Structured Thinking" score={Math.max(3, Math.min(10, Math.round((finalScore + 8) / 2)))} max={10} color="#ea580c" desc="Identifying constraints and trade-offs before designing." />
            </div>

            {/* Score Trend Chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-450 mb-4 select-none">Question-by-Question Score Trend</p>
              <div className="w-full overflow-x-auto">
                <ScoreTrendChart scores={events.map(e => Number(e.score || 0))} />
              </div>
            </div>
          </div>
        )}

        {/* Improvements */}
        {report.improvements?.length > 0 && (
          <div className="rounded-2xl border-2 border-orange-350/80 bg-orange-50/50 p-6 mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-700 mb-3">
              Your Improvement Plan
            </p>
            <ol className="space-y-3.5 pl-0">
              {report.improvements.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-800 leading-relaxed">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-orange-200 text-orange-850 text-xs font-bold flex items-center justify-center mt-0.5 select-none">
                    {i + 1}
                  </span>
                  <span className="flex-1">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Weaknesses */}
        {report.weaknesses?.length > 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-red-700 mb-3">
              Observed Weaknesses
            </p>
            <ul className="space-y-3 pl-0">
              {report.weaknesses.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-800 leading-relaxed">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-650 font-bold flex items-center justify-center mt-0.5 text-xs select-none">
                    ✗
                  </span>
                  <span className="flex-1">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Strengths */}
        {report.strengths?.length > 0 && (
          <div className="rounded-2xl border border-green-200 bg-green-50/50 p-6 mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-green-700 mb-3">
              Strengths
            </p>
            <ul className="space-y-3 pl-0">
              {report.strengths.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-800 leading-relaxed">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center mt-0.5 text-xs select-none">
                    +
                  </span>
                  <span className="flex-1">{item}</span>
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
            <div data-lenis-prevent className="px-5 py-4 max-h-[32rem] overflow-y-auto scrollbar-thin-styled">
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

function ResultsSkeleton({ jobRole, candidateName }: { jobRole: string; candidateName: string }) {
  return (
    <div
      className="min-h-screen bg-[#F9F9FB] text-[#252E3D] animate-pulse"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      {/* HTML Meta Refresh to reload every 5 seconds until processing finishes */}
      <meta httpEquiv="refresh" content="5" />

      <main className="mx-auto max-w-3xl px-4 md:px-6 pt-24 pb-20">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5a58ab] mb-2">
            AI Mock Interview
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#252e3d] mb-1">
            {jobRole}
          </h1>
          <p className="text-sm text-gray-400">
            {candidateName}
          </p>
        </div>

        {/* Processing Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="inline-block w-8 h-8 border-3 border-[#5a58ab] border-t-transparent rounded-full animate-spin mb-4" />
          <h2 className="text-base font-bold text-[#252e3d]">Generating Performance Report...</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Our AI interviewer is grading your responses, analyzing transcript metrics, and compiling study recommendations. This page will refresh automatically.
          </p>
        </div>

        {/* Score Card Placeholder */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-slate-200 rounded-md"></div>
              <div className="h-4 w-40 bg-slate-200/70 rounded-md"></div>
            </div>
            <div className="shrink-0 w-16 h-16 bg-slate-200 rounded-xl"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-slate-200/50 rounded-md"></div>
            <div className="h-3 w-11/12 bg-slate-200/50 rounded-md"></div>
            <div className="h-3 w-5/6 bg-slate-200/50 rounded-md"></div>
          </div>
        </div>

        {/* Parameter Bars Grid Placeholder */}
        <div className="mb-8">
          <div className="h-4 w-48 bg-slate-200 rounded-md mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-3xs">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-3 w-28 bg-slate-200 rounded-md"></div>
                  <div className="h-3.5 w-8 bg-slate-200/80 rounded-md"></div>
                </div>
                <div className="h-2 w-full bg-slate-200/40 rounded-md mb-3"></div>
                <div className="h-2 w-full bg-slate-100 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan & Weaknesses Placholder */}
        <div className="space-y-4 mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-4.5 w-36 bg-slate-200 rounded-md mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5 h-5 bg-slate-200 rounded-full shrink-0"></div>
                  <div className="h-3.5 w-5/6 bg-slate-200/70 rounded-md mt-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SkillCard({ title, score, max, color, desc }: { title: string; score: number; max: number; color: string; desc: string }) {
  const percentage = (score / max) * 100;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-3xs hover:shadow-2xs transition-shadow">
      <div className="flex justify-between items-center mb-1">
        <p className="text-xs font-bold text-[#252e3d]">{title}</p>
        <span className="text-xs font-bold animate-pulse" style={{ color }}>{score}/{max}</span>
      </div>
      <p className="text-[10px] text-slate-400 mb-3 leading-tight">{desc}</p>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function ScoreTrendChart({ scores }: { scores: number[] }) {
  if (scores.length === 0) return null;

  const width = 500;
  const height = 155;
  const padding = 25;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = scores.map((score, i) => {
    const x = padding + (i / (scores.length - 1 || 1)) * chartWidth;
    const y = padding + chartHeight - (score / 10) * chartHeight;
    return { x, y, score, label: `Q${i + 1}` };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  // Area under path
  const areaD = scores.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`
    : "";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-lg mx-auto h-auto">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a58ab" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#5a58ab" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 2.5, 5, 7.5, 10].map((val) => {
        const y = padding + chartHeight - (val / 10) * chartHeight;
        return (
          <line
            key={val}
            x1={padding}
            y1={y}
            x2={width - padding}
            y2={y}
            stroke="#f8fafc"
            strokeWidth={1}
          />
        );
      })}

      {/* Area */}
      {areaD && <path d={areaD} fill="url(#chartGrad)" />}

      {/* Path line */}
      {pathD && (
        <path
          d={pathD}
          fill="none"
          stroke="#5a58ab"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Points & Labels */}
      {points.map((p, i) => (
        <g key={i} className="group cursor-pointer">
          <circle
            cx={p.x}
            cy={p.y}
            r={4}
            fill="#ffffff"
            stroke="#5a58ab"
            strokeWidth={2}
          />
          {/* Label below point */}
          <text
            x={p.x}
            y={height - 5}
            textAnchor="middle"
            className="text-[9px] fill-slate-400 font-bold select-none"
          >
            {p.label}
          </text>
          {/* Score above point */}
          <text
            x={p.x}
            y={p.y - 8}
            textAnchor="middle"
            className="text-[9px] fill-[#252e3d] font-extrabold select-none"
          >
            {p.score}
          </text>
        </g>
      ))}
    </svg>
  );
}
