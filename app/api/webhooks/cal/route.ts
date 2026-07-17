import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-cal-signature-256");
    const secret = process.env.CAL_WEBHOOK_SECRET;

    if (secret) {
      if (!signature) {
        return NextResponse.json({ error: "Missing signature header" }, { status: 401 });
      }

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      const signatureBuffer = Buffer.from(signature, "hex");
      const expectedBuffer = Buffer.from(expectedSignature, "hex");

      if (
        signatureBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
      ) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else {
      console.warn("CAL_WEBHOOK_SECRET is not configured. Webhook signature check skipped.");
    }

    const body = JSON.parse(rawBody);
    const { triggerEvent, payload } = body;

    if (triggerEvent !== "BOOKING_CREATED") {
      return NextResponse.json({ message: `Ignored event: ${triggerEvent}` }, { status: 200 });
    }

    const metadata = payload?.metadata;
    const applicationId = metadata?.applicationId;

    if (!applicationId) {
      return NextResponse.json({ error: "applicationId missing from metadata" }, { status: 400 });
    }

    const application = await prisma.candidateApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const startTime = payload?.startTime;
    const scheduledAt = startTime ? new Date(startTime) : new Date();

    await prisma.candidateApplication.update({
      where: { id: applicationId },
      data: {
        status: "SCHEDULED",
        scheduledAt,
      },
    });

    console.log(`Successfully scheduled application ${applicationId} for ${scheduledAt}`);

    return NextResponse.json(
      { success: true, message: "Application status updated to SCHEDULED" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Cal.com webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
