import type {
  InterviewEvaluationEvent,
  InterviewFinalReport,
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

  return {
    summary:
      events.length > 0
        ? `Interview completed for ${jobRole} with ${events.length} evaluated responses.`
        : "Interview ended before enough evaluable responses were captured.",
    strengths: events
      .filter((event) => Number(event.score) >= 7)
      .slice(0, 3)
      .map((event) => event.feedback),
    improvements: events
      .filter((event) => Number(event.score) < 7)
      .slice(0, 3)
      .map((event) => event.feedback),
    finalScore: scoreAvg,
  };
}
