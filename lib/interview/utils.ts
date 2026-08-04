import type {
  InterviewEvaluationEvent,
  InterviewFinalReport,
  InterviewSectionScore,
} from "./types";

export function mergeTranscriptChunk(
  currentText: string,
  chunkText: string,
): string {
  const next = String(chunkText || "").trim();
  if (!next) {
    return currentText || "";
  }
  if (!currentText) {
    return next;
  }
  const needsSpace = !/[ \n]$/.test(currentText) && !/^[,.;:!?]/.test(next);
  return `${currentText}${needsSpace ? " " : ""}${next}`;
}

export function buildFallbackReport(
  events: InterviewEvaluationEvent[],
  jobRole: string,
): InterviewFinalReport {
  const scoreAvg =
    events.length > 0
      ? Math.round(
          events.reduce((acc, event) => acc + Number(event.score || 0), 0) /
            events.length,
        )
      : 0;

  const weakEvents = events.filter((event) => Number(event.score) < 7);
  const strongEvents = events.filter((event) => Number(event.score) >= 7);

  // Derive per-section scores by grouping events that have a sectionName
  const sectionMap = new Map<string, number[]>();
  for (const event of events) {
    if (event.sectionName) {
      const existing = sectionMap.get(event.sectionName) ?? [];
      existing.push(Number(event.score || 0));
      sectionMap.set(event.sectionName, existing);
    }
  }
  const sectionScores: InterviewSectionScore[] = [...sectionMap.entries()].map(
    ([section, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      // scale 1–10 → 1–5
      return { section, score: Math.max(1, Math.min(5, Math.round(avg / 2))), maxScore: 5 };
    },
  );

  const encouragementLine =
    strongEvents.length > 0
      ? `You demonstrated solid understanding in ${strongEvents.length} question${strongEvents.length > 1 ? "s" : ""} — keep building on those strengths.`
      : "Every interview is a learning opportunity — use this feedback to focus your preparation and come back stronger.";

  return {
    summary:
      events.length > 0
        ? `Interview completed for ${jobRole} with ${events.length} evaluated responses. Keep up the effort and focus on the improvement areas below to strengthen your profile.`
        : "Interview ended before enough evaluable responses were captured.",
    strengths: strongEvents.slice(0, 3).map((event) => event.feedback),
    weaknesses: weakEvents.slice(0, 4).map((event) => `Needs improvement: ${event.question}`),
    improvements: weakEvents.slice(0, 5).map((event) => event.improvementTip ?? event.feedback),
    finalScore: scoreAvg,
    sectionScores: sectionScores.length > 0 ? sectionScores : undefined,
    encouragementLine,
  };
}
