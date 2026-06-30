import type {
  InterviewEvaluationEvent,
  InterviewFinalReport,
  InterviewTranscriptEntry,
} from "./types";

export interface RealtimeInterviewCallbacks {
  onReady: () => void;
  onStatus: (message: string) => void;
  onError: (message: string) => void;
  onTranscript: (entry: InterviewTranscriptEntry) => void;
  onAudioChunk: (data: string, mimeType: string) => void;
  onEvaluationEvent: (event: InterviewEvaluationEvent) => void;
  onFinalReport: (report: InterviewFinalReport) => void;
  onComplete: () => void;
}

export interface RealtimeInterviewSetup {
  systemInstructions: string;
  openingPrompt: string;
  candidateName: string;
}

export interface RealtimeInterviewProvider {
  readonly providerName: string;
  readonly selectedModel: string | null;
  connect(setup: RealtimeInterviewSetup): Promise<void>;
  sendAudioChunk(data: string): void;
  endAudio(): void;
  endInterview(): void;
  close(): void;
}
