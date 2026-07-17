import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isValidAdminSessionToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { isValidEmployeeSessionToken, EMPLOYEE_SESSION_COOKIE } from "@/lib/employee-auth";
import { generateInterviewReportPdf } from "@/lib/pdfGenerator";
import type { InterviewFinalReport, InterviewEvaluationEvent } from "@/lib/interview/types";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
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

  const report   = session.finalReport as unknown as InterviewFinalReport | null;
  const events   = (session.evaluationEvents ?? []) as unknown as InterviewEvaluationEvent[];
  const avgScore = events.length > 0
    ? Math.round(events.reduce((a, e) => a + Number(e.score), 0) / events.length)
    : null;

  if (!report) {
    return NextResponse.json({ error: "No final report available for this session." }, { status: 404 });
  }

  const pdfBuffer = await generateInterviewReportPdf({
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
    transcript: (session.transcript as unknown as Array<{ role: string; text: string }> | null) ?? [],
  });

  const safeName = session.application.template.jobRole.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `Interview-Report-${safeName}-${session.application.candidateName.split(" ")[0]}.pdf`;

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
