import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { finalizeWebRtcInterviewSession, hashInterviewToken } from "@/lib/interview/webrtc-session";
import type { InterviewEvaluationEvent, InterviewFinalReport, InterviewReferenceCard, InterviewTranscriptEntry } from "@/lib/interview/types";

type RouteContext = { params: Promise<{ sessionId: string }> };

type FinalizeBody = {
  token?: string;
  transcript?: InterviewTranscriptEntry[];
  events?: InterviewEvaluationEvent[];
  referenceCards?: InterviewReferenceCard[];
  finalReport?: InterviewFinalReport | null;
  status?: "COMPLETED" | "TERMINATED" | "FAILED";
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { sessionId } = await params;
    const body = (await request.json()) as FinalizeBody;
    const token = body.token?.trim();

    if (!token) {
      return NextResponse.json({ error: "Missing interview token." }, { status: 400 });
    }

    const tokenHash = hashInterviewToken(token);
    const application = await prisma.candidateApplication.findUnique({
      where: { accessTokenHash: tokenHash },
      include: { session: true, template: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Invalid interview token." }, { status: 404 });
    }

    if (!application.session || application.session.id !== sessionId) {
      return NextResponse.json({ error: "Interview session not found." }, { status: 404 });
    }

    const finalReport = await finalizeWebRtcInterviewSession({
      sessionId,
      applicationId: application.id,
      candidateName: application.candidateName,
      candidateEmail: application.candidateEmail,
      role: application.template.jobRole,
      transcript: body.transcript ?? [],
      events: body.events ?? [],
      referenceCards: body.referenceCards ?? [],
      finalReport: body.finalReport ?? null,
      status: body.status ?? "COMPLETED",
    });

    return NextResponse.json({ ok: true, finalReport });
  } catch (error) {
    console.error("WebRTC interview finalize error:", error);
    return NextResponse.json({ error: "Failed to finalize interview session." }, { status: 500 });
  }
}
