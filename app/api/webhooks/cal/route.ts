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

    const metadata = payload?.metadata || {};
    const applicationId = metadata?.applicationId;
    const purchaseId = metadata?.purchaseId;
    const attendeeEmail = (
      payload?.responses?.email ||
      payload?.attendees?.[0]?.email ||
      ""
    ).trim().toLowerCase();

    const startTime = payload?.startTime;
    const scheduledAt = startTime ? new Date(startTime) : new Date();

    let updated = false;

    // 1. Try finding application by applicationId or purchaseId or email
    let application = applicationId
      ? await prisma.candidateApplication.findUnique({ where: { id: applicationId } })
      : purchaseId
      ? await prisma.candidateApplication.findFirst({ where: { purchaseId } })
      : attendeeEmail
      ? await prisma.candidateApplication.findFirst({
          where: { candidateEmail: attendeeEmail },
          orderBy: { createdAt: "desc" },
        })
      : null;

    if (application) {
      await prisma.candidateApplication.update({
        where: { id: application.id },
        data: {
          status: "SCHEDULED",
          scheduledAt,
        },
      });

      if (application.purchaseId) {
        await prisma.purchase.update({
          where: { id: application.purchaseId },
          data: {
            mockInterviewStatus: "SCHEDULED",
            mockInterviewDate: scheduledAt,
          },
        });
      }
      updated = true;
    }

    // 2. Try finding purchase directly by purchaseId or candidateEmail if purchaseId not linked yet
    let purchase = purchaseId
      ? await prisma.purchase.findUnique({ where: { id: purchaseId } })
      : attendeeEmail
      ? await prisma.purchase.findFirst({
          where: { candidateEmail: attendeeEmail },
          orderBy: { createdAt: "desc" },
        })
      : null;

    if (purchase) {
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          mockInterviewStatus: "SCHEDULED",
          mockInterviewDate: scheduledAt,
        },
      });
      updated = true;
    }

    if (!updated) {
      console.warn("Cal.com booking received but no matching application or purchase found for:", {
        applicationId,
        purchaseId,
        attendeeEmail,
      });
      return NextResponse.json(
        { warning: "Booking logged but no matching application/purchase record found" },
        { status: 200 }
      );
    }

    console.log(`Successfully updated booking schedule to ${scheduledAt} for email=${attendeeEmail}`);

    return NextResponse.json(
      { success: true, message: "Booking schedule updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cal.com webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
