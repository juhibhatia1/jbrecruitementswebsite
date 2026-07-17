import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const template = await prisma.interviewTemplate.findUnique({
      where: { id, isActive: true },
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
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Opportunity not found." }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch {
    return NextResponse.json({ error: "Failed to fetch opportunity." }, { status: 500 });
  }
}
