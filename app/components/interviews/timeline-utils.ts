import type { InterviewTranscriptEntry, InterviewReferenceCard } from "@/lib/interview/types";

export type TimelineItem =
  | { kind: "speech"; entry: InterviewTranscriptEntry }
  | { kind: "card"; card: InterviewReferenceCard };

export function buildTimeline(
  transcript: InterviewTranscriptEntry[],
  referenceCards: InterviewReferenceCard[],
): TimelineItem[] {
  const items: TimelineItem[] = [];
  const buckets = new Map<number, InterviewReferenceCard[]>();

  for (const card of referenceCards) {
    const index = Math.max(0, Math.floor(card.afterTranscriptIndex ?? transcript.length));
    const bucket = buckets.get(index);
    if (bucket) {
      bucket.push(card);
    } else {
      buckets.set(index, [card]);
    }
  }

  const pushCards = (index: number) => {
    const cards = buckets.get(index);
    if (!cards) return;
    for (const card of cards) {
      items.push({ kind: "card", card });
    }
  };

  pushCards(0);
  for (let i = 0; i < transcript.length; i++) {
    items.push({ kind: "speech", entry: transcript[i] });
    pushCards(i + 1);
  }

  for (const [index, cards] of [...buckets.entries()].sort((a, b) => a[0] - b[0])) {
    if (index > transcript.length) {
      for (const card of cards) {
        items.push({ kind: "card", card });
      }
    }
  }

  return items;
}
