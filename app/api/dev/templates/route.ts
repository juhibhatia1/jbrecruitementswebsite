import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DEV ONLY — returns active interview templates without auth
// Remove or protect before production deployment
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const dbTemplates = await prisma.interviewTemplate.findMany({
    where: { isActive: true },
    select: {
      id: true,
      jobRole: true,
      ownerRole: true,
      interviewDescription: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const hardcodedDevTemplates = [
    {
      id: "__dev_dsa__",
      jobRole: "DSA & System Design",
      ownerRole: "ADMIN" as const,
      interviewDescription: "Heavy reference-card test — Big-O table, Two Sum problem, URL shortener design. Best template for testing show_reference_card.",
    },
  ];

  return NextResponse.json({ templates: [...hardcodedDevTemplates, ...dbTemplates] });
}
