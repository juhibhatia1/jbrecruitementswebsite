import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashInterviewToken,
  buildWebRtcOpeningPrompt,
  buildWebRtcSystemInstructions,
  createOpenAIRealtimeClientSecret,
  createInterviewSessionBlueprint,
  resolveRealtimeVoice,
} from "@/lib/interview/webrtc-session";
import type { InterviewReferenceCard } from "@/lib/interview/types";

type StartRequestBody = {
  token?: string;
  sessionIdHint?: string;
};

function buildSessionInstructions(payload: {
  role: string;
  experienceLevel: string;
  difficultyLevel?: string;
  techStack: string[];
  durationMinutes: number;
  baseInstructions: string;
  sessionBlueprint?: Parameters<typeof buildWebRtcSystemInstructions>[0]["sessionBlueprint"];
  transcript?: Array<{ role: "candidate" | "interviewer"; text: string }>;
  referenceCards?: InterviewReferenceCard[];
  isResuming?: boolean;
  resumeText?: string;
  jobDescription?: string;
  careerGoal?: string;
  focusAreas?: string;
  selfIntroNotes?: string;
}) {
  return buildWebRtcSystemInstructions(payload);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as StartRequestBody;
    const token = body.token?.trim();
    const sessionIdHint = body.sessionIdHint?.trim() || null;

    if (!token) {
      return NextResponse.json({ error: "Missing interview token." }, { status: 400 });
    }

    const tokenHash = hashInterviewToken(token);
    const application = await prisma.candidateApplication.findUnique({
      where: { accessTokenHash: tokenHash },
      include: {
        template: true,
        session: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Invalid interview token." }, { status: 404 });
    }

    if (application.accessTokenExpiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "Interview link has expired." }, { status: 410 });
    }

    if (application.interviewPreference !== "AI") {
      return NextResponse.json({ error: "This interview is not configured for AI." }, { status: 400 });
    }

    if (!application.template.systemInstructions) {
      return NextResponse.json(
        { error: "Interview template is not ready yet. Please contact support." },
        { status: 409 },
      );
    }

    const voice = resolveRealtimeVoice((application.template.advancedConfig as Record<string, unknown> | null)?.voiceOption as string | undefined);
    const model = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2";

    let session = application.session;
    let isResuming = false;
    let previousTranscript: Array<{ role: "candidate" | "interviewer"; text: string }> = [];
    let previousEvents: Array<Record<string, unknown>> = [];
    let previousReferenceCards: Array<Record<string, unknown>> = [];

    if (session) {
      const isSessionHintMatch = sessionIdHint && session.id === sessionIdHint;
      const previousTranscriptRaw = Array.isArray(session.transcript) ? session.transcript : [];
      const previousEventsRaw = Array.isArray(session.evaluationEvents) ? session.evaluationEvents : [];
      const previousCardsRaw = Array.isArray(session.referenceCards) ? session.referenceCards : [];

      // Hard block: interview already done — no re-entry regardless of session hint
      if (session.status === "COMPLETED") {
        return NextResponse.json({ 
          error: "Interview already completed. Each link is single-use.",
          sessionId: session.id
        }, { status: 409 });
      }

      if (session.status === "ACTIVE" && !isSessionHintMatch) {
        return NextResponse.json({ error: "Interview session already in progress." }, { status: 409 });
      }

      if (previousTranscriptRaw.length > 0) {
        previousTranscript = previousTranscriptRaw as Array<{ role: "candidate" | "interviewer"; text: string }>;
        previousEvents = previousEventsRaw as Array<Record<string, unknown>>;
        previousReferenceCards = previousCardsRaw as Array<Record<string, unknown>>;
        isResuming = true;
      }

      await prisma.interviewSession.update({
        where: { id: session.id },
        data: { status: "CONNECTING" },
      });
    } else {
      session = await prisma.interviewSession.create({
        data: {
          applicationId: application.id,
          provider: "openai-webrtc",
          modelUsed: model,
          status: "CONNECTING",
          transcript: [],
          evaluationEvents: [],
          referenceCards: [],
        },
      });

      await prisma.candidateApplication.update({
        where: { id: application.id },
        data: { status: "INTERVIEW_STARTED" },
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured." }, { status: 500 });
    }

    const baseInstructions = application.template.systemInstructions;
    let sessionBlueprint: Awaited<ReturnType<typeof createInterviewSessionBlueprint>> = null;
    if (!isResuming) {
      try {
        sessionBlueprint = await createInterviewSessionBlueprint({
          apiKey,
          role: application.template.jobRole,
          experienceLevel: application.template.experienceLevel,
          techStack: application.template.techStack,
          requiredSkills: application.template.requiredSkills,
          durationMinutes: application.template.durationMinutes,
          difficultyLevel: application.template.difficultyLevel,
          baseInstructions,
          resumeText: application.resumeText || undefined,
          jobDescription:
            ((application.template.advancedConfig as Record<string, unknown> | null)?.jobDescription as string | undefined) ||
            undefined,
          careerGoal: application.careerGoal || undefined,
          focusAreas: application.focusAreas || undefined,
          selfIntroNotes: application.selfIntroNotes || undefined,
        });
      } catch (error) {
        console.warn("Blueprint generation failed, continuing without blueprint:", error);
      }
    }

    const normalizedReferenceCards: InterviewReferenceCard[] = previousReferenceCards
      .map((card, index) => ({
        id: typeof card.id === "string" && card.id.trim() ? card.id : `card-${index + 1}`,
        title: typeof card.title === "string" ? card.title : "",
        question: typeof card.question === "string" && card.question.trim() ? card.question : undefined,
        options: Array.isArray(card.options)
          ? card.options.map((option) => String(option)).filter((option) => option.trim().length > 0)
          : undefined,
        content: typeof card.content === "string" ? card.content : "",
        afterTranscriptIndex: typeof card.afterTranscriptIndex === "number" ? card.afterTranscriptIndex : undefined,
      }))
      .filter((card) => card.title.length > 0 && card.content.length > 0);

    const systemInstructions = buildSessionInstructions({
      role: application.template.jobRole,
      experienceLevel: application.template.experienceLevel,
      difficultyLevel: application.template.difficultyLevel,
      techStack: application.template.techStack,
      durationMinutes: application.template.durationMinutes,
      baseInstructions,
      sessionBlueprint,
      transcript: previousTranscript.length > 0 ? previousTranscript : undefined,
      referenceCards: normalizedReferenceCards.length > 0 ? normalizedReferenceCards : undefined,
      isResuming,
      resumeText: application.resumeText || undefined,
      jobDescription:
        ((application.template.advancedConfig as Record<string, unknown> | null)?.jobDescription as string | undefined) ||
        undefined,
      careerGoal: application.careerGoal || undefined,
      focusAreas: application.focusAreas || undefined,
      selfIntroNotes: application.selfIntroNotes || undefined,
    });

    const openingPrompt = buildWebRtcOpeningPrompt({
      role: application.template.jobRole,
      isResuming,
    });

    const safetyIdentifier = tokenHash;
    const clientSecret = await createOpenAIRealtimeClientSecret({
      apiKey,
      safetyIdentifier,
      voice,
    });

    return NextResponse.json({
      sessionId: session.id,
      applicationId: application.id,
      candidateName: application.candidateName,
      role: application.template.jobRole,
      experienceLevel: application.template.experienceLevel,
      techStack: application.template.techStack,
      durationMinutes: application.template.durationMinutes,
      sessionStartedAt: session.createdAt.toISOString(),
      voice,
      model,
      openingPrompt,
      systemInstructions,
      sessionBlueprint,
      clientSecret: clientSecret.value,
      existingTranscript: previousTranscript,
      existingEvents: previousEvents,
      existingReferenceCards: previousReferenceCards,
      isResuming,
      expiresAt: clientSecret.expiresAt,
    });
  } catch (error) {
    console.error("WebRTC interview start error:", error);
    return NextResponse.json({ error: "Failed to initialize WebRTC interview." }, { status: 500 });
  }
}
