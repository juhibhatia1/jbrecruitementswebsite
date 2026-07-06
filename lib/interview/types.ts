export type InterviewTranscriptRole = "candidate" | "interviewer";

export interface InterviewTranscriptEntry {
  role: InterviewTranscriptRole;
  text: string;
}

export interface InterviewEvaluationEvent {
  at: string;
  question: string;
  answerSummary: string;
  /** 1–10 */
  score: number;
  feedback: string;
}

export interface InterviewFinalReport {
  summary: string;
  strengths: string[];
  improvements: string[];
  /** 1–10, average of individual scores */
  finalScore: number;
}

export interface InterviewReferenceCard {
  id: string;
  title: string;
  /** Markdown content */
  content: string;
  /** Index into transcript[] at which this card was shown — used to reconstruct positional timeline */
  afterTranscriptIndex?: number;
}

export interface InterviewSessionAccumulator {
  transcript: InterviewTranscriptEntry[];
  events: InterviewEvaluationEvent[];
  finalReport: InterviewFinalReport | null;
  referenceCards: InterviewReferenceCard[];
}
