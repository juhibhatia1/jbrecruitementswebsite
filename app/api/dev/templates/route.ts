import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DEV ONLY — returns active interview templates without auth
// Remove or protect before production deployment
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const templates = await prisma.interviewTemplate.findMany({
    where: { isActive: true },
    select: {
      id: true,
      jobRole: true,
      ownerRole: true,
      interviewDescription: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ templates });
}
