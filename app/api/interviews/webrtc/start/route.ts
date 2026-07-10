import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashInterviewToken, buildWebRtcOpeningPrompt, buildWebRtcSystemInstructions, createOpenAIRealtimeClientSecret, resolveRealtimeVoice } from "@/lib/interview/webrtc-session";

type StartRequestBody = {
  token?: string;
  sessionIdHint?: string;
};

function buildSessionInstructions(payload: {
  role: string;
  experienceLevel: string;
  techStack: string[];
  baseInstructions: string;
  transcript?: Array<{ role: "candidate" | "interviewer"; text: string }>;
  isResuming?: boolean;
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

      if (session.status === "COMPLETED") {
        return NextResponse.json({ error: "Interview already completed." }, { status: 409 });
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

    const baseInstructions = application.template.systemInstructions;
    const systemInstructions = buildSessionInstructions({
      role: application.template.jobRole,
      experienceLevel: application.template.experienceLevel,
      techStack: application.template.techStack,
      baseInstructions,
      transcript: previousTranscript.length > 0 ? previousTranscript : undefined,
      isResuming,
    });

    const openingPrompt = buildWebRtcOpeningPrompt({
      role: application.template.jobRole,
      isResuming,
    });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured." }, { status: 500 });
    }

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
      voice,
      model,
      openingPrompt,
      systemInstructions,
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
