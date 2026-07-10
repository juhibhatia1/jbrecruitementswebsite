import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashInterviewToken, persistWebRtcInterviewSnapshot } from "@/lib/interview/webrtc-session";
import type { InterviewEvaluationEvent, InterviewFinalReport, InterviewReferenceCard, InterviewTranscriptEntry } from "@/lib/interview/types";

type RouteContext = { params: Promise<{ sessionId: string }> };

type SyncBody = {
  token?: string;
  transcript?: InterviewTranscriptEntry[];
  events?: InterviewEvaluationEvent[];
  referenceCards?: InterviewReferenceCard[];
  finalReport?: InterviewFinalReport | null;
  status?: "CONNECTING" | "ACTIVE" | "COMPLETED" | "TERMINATED" | "FAILED";
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { sessionId } = await params;
    const body = (await request.json()) as SyncBody;
    const token = body.token?.trim();

    if (!token) {
      return NextResponse.json({ error: "Missing interview token." }, { status: 400 });
    }

    const tokenHash = hashInterviewToken(token);
    const application = await prisma.candidateApplication.findUnique({
      where: { accessTokenHash: tokenHash },
      include: { session: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Invalid interview token." }, { status: 404 });
    }

    if (!application.session || application.session.id !== sessionId) {
      return NextResponse.json({ error: "Interview session not found." }, { status: 404 });
    }

    await persistWebRtcInterviewSnapshot({
      sessionId,
      transcript: body.transcript ?? [],
      events: body.events ?? [],
      referenceCards: body.referenceCards ?? [],
      finalReport: body.finalReport ?? null,
    });

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: body.status ?? "ACTIVE",
        completedAt: body.status === "COMPLETED" ? new Date() : undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("WebRTC interview sync error:", error);
    return NextResponse.json({ error: "Failed to sync interview progress." }, { status: 500 });
  }
}
