import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  EMPLOYEE_SESSION_COOKIE,
  isValidEmployeeSessionToken,
} from "@/lib/employee-auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(EMPLOYEE_SESSION_COOKIE)?.value;
  if (!isValidEmployeeSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const templates = await prisma.interviewTemplate.findMany({
      where: { ownerRole: "EMPLOYEE" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json({ templates });
  } catch {
    return NextResponse.json({ error: "Failed to fetch templates." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(EMPLOYEE_SESSION_COOKIE)?.value;
  if (!isValidEmployeeSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    { error: "Template creation is temporarily disabled for employee accounts." },
    { status: 403 },
  );
}
