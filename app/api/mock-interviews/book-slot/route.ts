import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendHumanInterviewScheduleConfirmationEmail } from "@/lib/emailService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const purchaseId = String(body.purchaseId || "");
    const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
    const timeZone = typeof body.timeZone === "string" ? body.timeZone : "Asia/Kolkata";

    if (!purchaseId || !scheduledAt || Number.isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ error: "Missing or invalid booking details" }, { status: 400 });
    }

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    if (!purchase.serviceName.includes("Coach Mock Interview")) {
      return NextResponse.json({ error: "This booking flow is only for human-led interviews" }, { status: 400 });
    }

    const details = parseHumanInterviewNotes(purchase.completionNotes);

    const updatedPurchase = await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        mockInterviewStatus: "SCHEDULED",
        mockInterviewDate: scheduledAt,
      },
    });

    await sendHumanInterviewScheduleConfirmationEmail({
      candidateName: purchase.candidateName,
      candidateEmail: purchase.candidateEmail,
      jobRole: details.jobRole || purchase.serviceName,
      scheduledAt,
      timeZone,
      yearsOfExperience: details.yearsOfExperience,
      applicationLink: details.applicationLink,
      interviewBrief: details.interviewBrief,
      purchaseId: purchase.id,
    });

    return NextResponse.json({
      success: true,
      purchase: updatedPurchase,
    });
  } catch (err: any) {
    console.error("Error booking human interview slot:", err);
    return NextResponse.json({ error: err.message || "Failed to book slot" }, { status: 500 });
  }
}

function parseHumanInterviewNotes(notes: string | null | undefined) {
  if (!notes) return {};

  try {
    const parsed = JSON.parse(notes);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}
