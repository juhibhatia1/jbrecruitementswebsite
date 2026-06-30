export type InterviewTranscriptRole = "candidate" | "interviewer";

export interface InterviewTranscriptEntry {
  role: InterviewTranscriptRole;
  text: string;
}

export interface InterviewEvaluationEvent {
  at: string;
  question: string;
  answerSummary: string;
  score: number;
  feedback: string;
}

export interface InterviewFinalReport {
  summary: string;
  strengths: string[];
  improvements: string[];
  finalScore: number;
}

export interface InterviewSessionAccumulator {
  transcript: InterviewTranscriptEntry[];
  events: InterviewEvaluationEvent[];
  finalReport: InterviewFinalReport | null;
}
