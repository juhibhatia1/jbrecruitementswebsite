import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const templates = await prisma.interviewTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        jobRole: true,
        experienceLevel: true,
        techStack: true,
        requiredSkills: true,
        durationMinutes: true,
        difficultyLevel: true,
        interviewDescription: true,
        createdAt: true,
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json({ templates });
  } catch {
    return NextResponse.json({ error: "Failed to fetch opportunities." }, { status: 500 });
  }
}
