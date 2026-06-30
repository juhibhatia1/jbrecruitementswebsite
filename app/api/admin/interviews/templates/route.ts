import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const templates = await prisma.interviewTemplate.findMany({
      where: { ownerRole: "ADMIN" },
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
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      jobRole?: string;
      experienceLevel?: string;
      techStack?: string[];
      requiredSkills?: string[];
      durationMinutes?: number;
      difficultyLevel?: string;
      advancedConfig?: Record<string, unknown>;
    };

    const { jobRole, experienceLevel, techStack, requiredSkills, durationMinutes, difficultyLevel } = body;

    if (!jobRole || !experienceLevel || !durationMinutes || !difficultyLevel) {
      return NextResponse.json(
        { error: "jobRole, experienceLevel, durationMinutes, and difficultyLevel are required." },
        { status: 400 },
      );
    }

    const template = await prisma.interviewTemplate.create({
      data: {
        ownerRole: "ADMIN",
        jobRole: String(jobRole).trim(),
        experienceLevel: String(experienceLevel).trim(),
        techStack: Array.isArray(techStack) ? techStack.map(String) : [],
        requiredSkills: Array.isArray(requiredSkills) ? requiredSkills.map(String) : [],
        durationMinutes: Number(durationMinutes),
        difficultyLevel: String(difficultyLevel).trim(),
        advancedConfig: body.advancedConfig ?? undefined,
        isActive: false,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create template." }, { status: 500 });
  }
}
