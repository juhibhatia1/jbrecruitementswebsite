import type { InterviewTranscriptEntry, InterviewReferenceCard } from "@/lib/interview/types";

export type TimelineItem =
  | { kind: "speech"; entry: InterviewTranscriptEntry }
  | { kind: "card"; card: InterviewReferenceCard };

export function buildTimeline(
  transcript: InterviewTranscriptEntry[],
  referenceCards: InterviewReferenceCard[],
): TimelineItem[] {
  const items: TimelineItem[] = transcript.map((entry) => ({ kind: "speech", entry }));

  const sorted = [...referenceCards].sort(
    (a, b) => (b.afterTranscriptIndex ?? 0) - (a.afterTranscriptIndex ?? 0),
  );

  for (const card of sorted) {
    const insertAt = card.afterTranscriptIndex ?? items.length;
    items.splice(insertAt, 0, { kind: "card", card });
  }

  return items;
}
