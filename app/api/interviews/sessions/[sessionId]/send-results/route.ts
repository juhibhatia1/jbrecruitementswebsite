import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isValidAdminSessionToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { isValidEmployeeSessionToken, EMPLOYEE_SESSION_COOKIE } from "@/lib/employee-auth";
import { sendInterviewResultsToCandidate } from "@/lib/emailService";
import type { InterviewFinalReport, InterviewEvaluationEvent } from "@/lib/interview/types";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function POST(request: NextRequest, { params }: RouteContext) {
  const cookieStore = await cookies();
  const adminToken    = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const employeeToken = cookieStore.get(EMPLOYEE_SESSION_COOKIE)?.value;

  if (!isValidAdminSessionToken(adminToken) && !isValidEmployeeSessionToken(employeeToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;

  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      application: {
        select: {
          candidateName: true,
          candidateEmail: true,
          template: { select: { jobRole: true } },
        },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const report = session.finalReport as InterviewFinalReport | null;
  const events = (session.evaluationEvents ?? []) as InterviewEvaluationEvent[];

  if (!report) {
    return NextResponse.json({ error: "No final report available to send." }, { status: 400 });
  }

  const avgScore = events.length > 0
    ? Math.round(events.reduce((a, e) => a + Number(e.score), 0) / events.length)
    : null;

  const result = await sendInterviewResultsToCandidate({
    candidateName:    session.application.candidateName,
    candidateEmail:   session.application.candidateEmail,
    jobRole:          session.application.template.jobRole,
    completedAt:      session.completedAt,
    finalScore:       report.finalScore ?? avgScore,
    summary:          report.summary,
    strengths:        report.strengths,
    weaknesses:       report.weaknesses ?? [],
    improvements:     report.improvements,
    evaluationEvents: events.map((e) => ({
      question:       e.question,
      answerSummary:  e.answerSummary,
      score:          e.score,
      feedback:       e.feedback,
      improvementTip: e.improvementTip,
    })),
    resultsPageUrl: process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/interview/results/${sessionId}`
      : undefined,
  });

  if (!result.success) {
    return NextResponse.json({ error: "Failed to send results email." }, { status: 500 });
  }

  return NextResponse.json({ message: `Results sent to ${session.application.candidateEmail}` });
}
