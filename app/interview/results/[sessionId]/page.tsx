import { prisma } from "@/lib/prisma";
import type {
  InterviewEvaluationEvent,
  InterviewFinalReport,
  InterviewReferenceCard,
  InterviewTranscriptEntry,
} from "@/lib/interview/types";
import { TranscriptTimeline } from "@/app/components/interviews/transcript-timeline";
import { buildTimeline } from "@/app/components/interviews/timeline-utils";
import type { Metadata } from "next";
import Link from "next/link";
import { IoArrowBack, IoCheckmarkCircle, IoDocumentTextOutline, IoFlashOutline, IoStarOutline } from "react-icons/io5";

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
  const referenceCards = (session.referenceCards ?? []) as unknown as InterviewReferenceCard[];
  const timelineItems = buildTimeline(transcript, referenceCards);
  const averageScore =
    events.length > 0
      ? Math.round(events.reduce((sum, event) => sum + Number(event.score), 0) / events.length)
      : null;
  const finalScore = report.finalScore ?? averageScore;
  const { candidateName } = session.application;
  const { jobRole } = session.application.template;
  const completedAt = session.completedAt ? new Date(session.completedAt) : null;
  const dateLabel = completedAt
    ? completedAt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "In progress";

  const grade = scoreToGrade(finalScore);

  const stats = [
    { label: "Overall grade", value: finalScore !== null ? grade.label : "Pending" },
    { label: "Questions", value: events.length.toString() },
    { label: "Strengths", value: report.strengths.length.toString() },
    { label: "Improvements", value: report.improvements.length.toString() },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9FB] text-[#252E3D]" style={{ fontFamily: "Raleway, sans-serif" }}>
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-24 md:px-6">

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(37,46,61,0.05)] md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5a58ab]">Interview Report</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#252e3d] sm:text-4xl" style={{ fontFamily: "Crimson Text, serif" }}>
                {jobRole}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {candidateName} · {dateLabel}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-100 bg-[#fbfbfd] px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-[#252e3d]">{item.value}</p>
                  </div>
                ))}
              </div>

              {finalScore !== null && (
                <div className="mt-6 rounded-3xl border border-slate-100 bg-[#fbfbfd] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Overall assessment</p>
                      <h2 className="mt-1 text-2xl font-bold" style={{ fontFamily: "Crimson Text, serif", color: grade.color }}>
                        {grade.label}
                      </h2>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${grade.ring}`}>
                        {finalScore}/10
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(0, Math.min(100, (finalScore / 10) * 100))}%`, backgroundColor: grade.color }}
                    />
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-slate-600">{report.summary}</p>

                  {report.encouragementLine && (
                    <div className="mt-3 flex items-start gap-3 rounded-2xl border border-[#5a58ab]/20 bg-[#f0efff] px-4 py-3">
                      <span className="mt-0.5 text-base">✨</span>
                      <p className="text-sm italic leading-relaxed text-[#4a489b]">{report.encouragementLine}</p>
                    </div>
                  )}
                </div>
              )}

              {report.sectionScores && report.sectionScores.length > 0 && (
                <SectionScoresCard sectionScores={report.sectionScores} />
              )}

              {events.length > 0 && (
                <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_10px_35px_rgba(37,46,61,0.04)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5a58ab]">Performance trend</p>
                      <h2 className="mt-1 text-xl font-semibold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
                        Question-by-question score chart
                      </h2>
                    </div>
                    <p className="text-xs text-slate-400">Higher is better</p>
                  </div>
                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-[#fbfbfd] p-4">
                    <ScoreTrendChart scores={events.map((event) => Number(event.score || 0))} />
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-4 lg:sticky lg:top-28">
              <div className="rounded-3xl border border-slate-100 bg-[#fbfbfd] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Quick read</p>
                <div className="mt-4 space-y-3 text-sm">
                  <Row label="Candidate" value={candidateName} />
                  <Row label="Email" value={session.application.candidateEmail} />
                  <Row label="Role" value={jobRole} />
                  <Row label="Completed" value={dateLabel} />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">What to focus on</p>
                <div className="mt-4 space-y-3">
                  {report.improvements.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex gap-3 rounded-2xl bg-[#fbfbfd] p-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f0efff] text-xs font-bold text-[#5a58ab]">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed text-slate-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <InfoCard
            title="Strengths"
            tone="green"
            icon={<IoCheckmarkCircle className="h-4 w-4" />}
            items={report.strengths}
            emptyText="No strengths were recorded."
          />
          <InfoCard
            title="Weaknesses"
            tone="red"
            icon={<IoFlashOutline className="h-4 w-4" />}
            items={report.weaknesses}
            emptyText="No weaknesses were recorded."
          />
          <InfoCard
            title="Improvement plan"
            tone="amber"
            icon={<IoStarOutline className="h-4 w-4" />}
            items={report.improvements}
            emptyText="No action items were recorded."
          />
        </section>

        {events.length > 0 && (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(37,46,61,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5a58ab]">Question review</p>
                <h2 className="mt-1 text-2xl font-semibold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
                  Question-by-question feedback
                </h2>
              </div>
              <p className="text-sm text-slate-500">Scores and feedback for each answer</p>
            </div>

            <div className="mt-5 space-y-4">
              {events.map((event, index) => {
                const score = Number(event.score);
                const qGrade = scoreToGrade(score);

                return (
                  <article key={index} className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="max-w-4xl">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                          Question {index + 1}{event.sectionName ? ` · ${event.sectionName}` : ""}
                        </p>
                        <h3 className="mt-2 text-base font-semibold text-[#252e3d]">{event.question}</h3>
                      </div>

                      <div className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-bold ${qGrade.ring}`}>
                        {qGrade.label}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-white bg-white p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Answer summary</p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {event.answerSummary || "No answer summary available."}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white bg-white p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Feedback</p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-700">{event.feedback}</p>
                        {event.improvementTip && (
                          <div className="mt-3 rounded-xl border-l-4 border-[#5a58ab] bg-[#f0efff] p-3">
                            <p className="text-xs leading-relaxed text-[#4a489b]">
                              <span className="font-bold">Tip:</span> {event.improvementTip}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {timelineItems.length > 0 && (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(37,46,61,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5a58ab]">Transcript</p>
                <h2 className="mt-1 text-2xl font-semibold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
                  Full conversation timeline
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-[#fbfbfd] px-3 py-1 text-xs font-semibold text-slate-500">
                <IoDocumentTextOutline className="h-4 w-4" />
                {transcript.length} messages
              </div>
            </div>

            <div data-lenis-prevent className="mt-5 max-h-[32rem] overflow-y-auto rounded-2xl border border-slate-100 bg-[#fbfbfd] p-5 scrollbar-thin-styled">
              <TranscriptTimeline items={timelineItems} />
            </div>
          </section>
        )}

        <div className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} JB Recruitment Solutions — Auto-generated report
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <span className="max-w-[65%] text-right text-sm font-medium text-slate-700">{value}</span>
    </div>
  );
}

function ScoreTrendChart({ scores }: { scores: number[] }) {
  if (scores.length === 0) return null;

  const width = 640;
  const height = 220;
  const paddingX = 28;
  const paddingY = 24;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  const maxScore = 10;
  const usableScores = scores.length === 1 ? [scores[0], scores[0]] : scores;

  const points = usableScores.map((score, index) => {
    const x = paddingX + (index / (usableScores.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - (Math.max(0, Math.min(maxScore, score)) / maxScore) * chartHeight;
    return { x, y, score };
  });

  const pathD = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingY + chartHeight} L ${points[0].x} ${paddingY + chartHeight} Z`;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
        <span>Score</span>
        <span>10</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
        <defs>
          <linearGradient id="resultTrendArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5a58ab" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#5a58ab" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 2.5, 5, 7.5, 10].map((tick) => {
          const y = paddingY + chartHeight - (tick / maxScore) * chartHeight;
          return (
            <g key={tick}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#e5e7eb" strokeWidth={1} />
              <text x={10} y={y + 4} className="fill-slate-400 text-[10px] font-semibold">
                {tick}
              </text>
            </g>
          );
        })}

        <path d={areaD} fill="url(#resultTrendArea)" />
        <path d={pathD} fill="none" stroke="#5a58ab" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

        {points.map((point, index) => (
          <g key={index}>
            <circle cx={point.x} cy={point.y} r={4.5} fill="#fff" stroke="#5a58ab" strokeWidth={2.5} />
            <text x={point.x} y={height - 8} textAnchor="middle" className="fill-slate-400 text-[10px] font-semibold">
              Q{index + 1}
            </text>
            <text x={point.x} y={point.y - 10} textAnchor="middle" className="fill-[#252e3d] text-[10px] font-bold">
              {point.score}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function InfoCard({
  title,
  tone,
  icon,
  items,
  emptyText,
}: {
  title: string;
  tone: "green" | "red" | "amber";
  icon: React.ReactNode;
  items: string[];
  emptyText: string;
}) {
  const toneStyles =
    tone === "green"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "red"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(37,46,61,0.05)]">
      <div className="flex items-center gap-2">
        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${toneStyles}`}>{icon}</span>
        <h3 className="text-lg font-semibold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
          {title}
        </h3>
      </div>

      <div className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-4">
              <p className="text-sm leading-relaxed text-slate-600">{item}</p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-[#fbfbfd] p-4 text-sm text-slate-500">
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );
}

function scoreToGrade(score: number | null, outOf: 10 | 5 = 10): {
  label: string;
  color: string;
  ring: string;
} {
  const n = score === null ? -1 : outOf === 5 ? score * 2 : score;
  if (n >= 9) return { label: "Excellent",       color: "#15803d", ring: "border-emerald-300 bg-emerald-50 text-emerald-700" };
  if (n >= 7) return { label: "Good",            color: "#16a34a", ring: "border-green-200 bg-green-50 text-green-700" };
  if (n >= 5) return { label: "Average",         color: "#d97706", ring: "border-amber-200 bg-amber-50 text-amber-700" };
  if (n >= 3) return { label: "Below Average",   color: "#dc2626", ring: "border-red-200 bg-red-50 text-red-700" };
  if (n >= 1) return { label: "Needs Improvement", color: "#991b1b", ring: "border-red-300 bg-red-100 text-red-800" };
  return              { label: "Pending",        color: "#5a58ab", ring: "border-[#5a58ab]/30 bg-[#f0efff] text-[#5a58ab]" };
}

function SectionScoresCard({ sectionScores }: { sectionScores: Array<{ section: string; score: number; maxScore: number }> }) {
  return (
    <div className="mt-6 rounded-3xl border border-slate-100 bg-[#fbfbfd] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Section breakdown</p>
      <h2 className="mt-1 text-xl font-semibold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
        Category-wise performance
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {sectionScores.map((s) => {
          const g = scoreToGrade(s.score, 5);
          const pct = Math.max(0, Math.min(100, (s.score / s.maxScore) * 100));
          return (
            <div key={s.section} className="rounded-2xl border border-white bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#252e3d]">{s.section}</p>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${g.ring}`}>
                  {g.label}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: g.color }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400">{s.score}/{s.maxScore}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F9FB] px-4" style={{ fontFamily: "Raleway, sans-serif" }}>
      <div className="max-w-sm text-center">
        <p className="mb-3 text-xl font-semibold text-[#252e3d]" style={{ fontFamily: "Crimson Text, serif" }}>
          Report Unavailable
        </p>
        <p className="mb-6 text-sm text-gray-600">{message}</p>
        <Link
          href="/mock-interview"
          className="inline-block rounded-xl border border-[#e0e0e0] bg-white px-5 py-2.5 text-sm font-semibold text-[#252e3d] transition hover:bg-gray-50"
        >
          Back to Mock Interview
        </Link>
      </div>
    </div>
  );
}

function ResultsSkeleton({ jobRole, candidateName }: { jobRole: string; candidateName: string }) {
  return (
    <div className="min-h-screen bg-[#F9F9FB] text-[#252E3D] animate-pulse" style={{ fontFamily: "Raleway, sans-serif" }}>
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-24 md:px-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="h-10 w-48 rounded-xl bg-slate-200" />
          <div className="h-10 w-44 rounded-full bg-slate-200" />
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
            <div>
              <div className="h-3 w-40 rounded-full bg-slate-200" />
              <div className="mt-3 h-10 w-80 rounded-md bg-slate-200" />
              <div className="mt-3 h-4 w-56 rounded-full bg-slate-200/80" />

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="rounded-2xl border border-slate-100 bg-[#fbfbfd] px-4 py-4">
                    <div className="h-2.5 w-20 rounded-full bg-slate-200" />
                    <div className="mt-3 h-7 w-14 rounded-md bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-100 bg-[#fbfbfd] p-5">
                <div className="h-3 w-24 rounded-full bg-slate-200" />
                <div className="mt-4 space-y-3">
                  <div className="h-4 w-full rounded-full bg-slate-200/80" />
                  <div className="h-4 w-11/12 rounded-full bg-slate-200/80" />
                  <div className="h-4 w-10/12 rounded-full bg-slate-200/80" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-100 bg-[#fbfbfd] p-5">
            <div className="h-3 w-36 rounded-full bg-slate-200" />
            <div className="mt-3 h-24 rounded-2xl bg-slate-200/70" />
          </div>
        </section>
      </main>
    </div>
  );
}
