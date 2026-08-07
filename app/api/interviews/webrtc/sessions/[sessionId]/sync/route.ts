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
  // Real interview start time stamped by the client when the AI actually goes live.
  // Persisted so a resumed session continues the countdown from the correct moment.
  startedAt?: string;
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

    // Skip the snapshot write for a start-time-only ping (no transcript/events/cards/report)
    // so the client's initial "stamp real start time" call cannot wipe existing progress.
    const hasSnapshotData =
      body.transcript !== undefined ||
      body.events !== undefined ||
      body.referenceCards !== undefined ||
      body.finalReport != null;

    if (hasSnapshotData) {
      await persistWebRtcInterviewSnapshot({
        sessionId,
        transcript: body.transcript ?? [],
        events: body.events ?? [],
        referenceCards: body.referenceCards ?? [],
        finalReport: body.finalReport ?? null,
      });
    }

    // Parse the optional real start time (client stamps it once when the AI goes live).
    const parsedStartedAt = body.startedAt ? new Date(body.startedAt) : null;
    const validStartedAt =
      parsedStartedAt && !Number.isNaN(parsedStartedAt.getTime()) ? parsedStartedAt : undefined;

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: body.status ?? "ACTIVE",
        startedAt: validStartedAt,
        completedAt: body.status === "COMPLETED" ? new Date() : undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("WebRTC interview sync error:", error);
    return NextResponse.json({ error: "Failed to sync interview progress." }, { status: 500 });
  }
}
