import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin-auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const template = await prisma.interviewTemplate.findUnique({
      where: { id, ownerRole: "ADMIN" },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch {
    return NextResponse.json({ error: "Failed to fetch template." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json() as Record<string, unknown>;

    const existing = await prisma.interviewTemplate.findUnique({
      where: { id, ownerRole: "ADMIN" },
    });

    if (!existing) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.jobRole !== undefined) updateData.jobRole = String(body.jobRole).trim();
    if (body.experienceLevel !== undefined) updateData.experienceLevel = String(body.experienceLevel).trim();
    if (body.techStack !== undefined) updateData.techStack = Array.isArray(body.techStack) ? body.techStack.map(String) : [];
    if (body.requiredSkills !== undefined) updateData.requiredSkills = Array.isArray(body.requiredSkills) ? body.requiredSkills.map(String) : [];
    if (body.durationMinutes !== undefined) updateData.durationMinutes = Number(body.durationMinutes);
    if (body.difficultyLevel !== undefined) updateData.difficultyLevel = String(body.difficultyLevel).trim();
    if (body.advancedConfig !== undefined) updateData.advancedConfig = body.advancedConfig;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const template = await prisma.interviewTemplate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ template });
  } catch {
    return NextResponse.json({ error: "Failed to update template." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const existing = await prisma.interviewTemplate.findUnique({
      where: { id, ownerRole: "ADMIN" },
    });

    if (!existing) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    await prisma.interviewTemplate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete template." }, { status: 500 });
  }
}
