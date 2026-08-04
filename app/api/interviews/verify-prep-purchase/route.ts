import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const purchaseId = searchParams.get("purchaseId")?.trim();

    if (!purchaseId) {
      return NextResponse.json({ error: "Missing purchaseId parameter" }, { status: 400 });
    }

    // Lookup purchase by purchase id or Stripe Payment Intent ID
    const purchase = await prisma.purchase.findFirst({
      where: {
        OR: [
          { id: purchaseId },
          { stripePaymentIntentId: purchaseId }
        ]
      },
      select: {
        id: true,
        serviceName: true,
        candidateName: true,
        interviewPrepUrl: true,
        interviewPrepText: true,
        status: true,
      }
    });

    if (!purchase) {
      return NextResponse.json({
        found: false,
        message: "Purchase ID not found. Please verify the ID from your confirmation email."
      });
    }

    const isPrep = purchase.serviceName.toLowerCase().includes("interview prep");
    if (!isPrep) {
      return NextResponse.json({
        found: true,
        isPrepService: false,
        serviceName: purchase.serviceName,
        message: `Found purchase for "${purchase.serviceName}", but it is not an Interview Prep service.`
      });
    }

    return NextResponse.json({
      found: true,
      isPrepService: true,
      purchaseId: purchase.id,
      serviceName: purchase.serviceName,
      candidateName: purchase.candidateName,
      interviewPrepUrl: purchase.interviewPrepUrl || null,
      hasPrepDoc: !!purchase.interviewPrepUrl,
      hasPrepText: !!purchase.interviewPrepText,
    });
  } catch (error: any) {
    console.error("[Verify Prep Purchase Error]:", error);
    return NextResponse.json({ error: "Failed to verify Purchase ID" }, { status: 500 });
  }
}
