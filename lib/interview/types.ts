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
  /** Section of the interview this question belonged to */
  sectionName?: string;
  /** Actionable improvement tip — present only for scores ≤ 7 */
  improvementTip?: string;
}

export interface InterviewSectionScore {
  section: string;
  /** 1–5 */
  score: number;
  /** Always 5 */
  maxScore: number;
}

export interface InterviewFinalReport {
  summary: string;
  strengths: string[];
  /** Observed shortcomings during the interview */
  weaknesses: string[];
  /** Actionable study/practice recommendations */
  improvements: string[];
  /** 1–10, average of individual scores */
  finalScore: number;
  /** Per-section scores derived from the interview blueprint sections */
  sectionScores?: InterviewSectionScore[];
  /** One genuine, specific positive sentence about the candidate for encouragement */
  encouragementLine?: string;
}

export interface InterviewReferenceCard {
  id: string;
  title: string;
  /** Exact question shown with the card, if the card is a structured question */
  question?: string;
  /** Structured options for MCQ-style cards */
  options?: string[];
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
