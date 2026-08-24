import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { serviceName, eventType } = await request.json();

    if (!serviceName || !eventType) {
      return NextResponse.json({ error: "Missing serviceName or eventType" }, { status: 400 });
    }

    if (!["VIEW", "CLICK_BUY"].includes(eventType)) {
      return NextResponse.json({ error: "Invalid eventType" }, { status: 400 });
    }

    await prisma.funnelEvent.create({
      data: {
        serviceName,
        eventType,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error logging funnel event:", err);
    // Return 200 to the client even if DB logging fails, to prevent client-side impact
    return NextResponse.json({ error: "Failed to record event" }, { status: 200 });
  }
}
