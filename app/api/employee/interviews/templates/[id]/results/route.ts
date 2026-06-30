import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  EMPLOYEE_SESSION_COOKIE,
  isValidEmployeeSessionToken,
} from "@/lib/employee-auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const token = request.cookies.get(EMPLOYEE_SESSION_COOKIE)?.value;
  if (!isValidEmployeeSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const template = await prisma.interviewTemplate.findUnique({
      where: { id, ownerRole: "EMPLOYEE" },
      select: { id: true, jobRole: true },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    const applications = await prisma.candidateApplication.findMany({
      where: { templateId: id },
      orderBy: { createdAt: "desc" },
      include: {
        session: {
          select: {
            id: true,
            status: true,
            transcript: true,
            evaluationEvents: true,
            finalReport: true,
            startedAt: true,
            completedAt: true,
          },
        },
      },
    });

    return NextResponse.json({ template, applications });
  } catch {
    return NextResponse.json({ error: "Failed to fetch results." }, { status: 500 });
  }
}
