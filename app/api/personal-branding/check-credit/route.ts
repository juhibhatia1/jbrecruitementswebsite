import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const emailRaw = body?.email;

    if (!emailRaw || typeof emailRaw !== "string") {
      return NextResponse.json({ hasCredit: false, error: "Email is required" }, { status: 400 });
    }

    const emailClean = emailRaw.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailClean)) {
      return NextResponse.json({ hasCredit: false, error: "Invalid email format" }, { status: 400 });
    }

    // Find the latest completed consultation purchase for this email
    const consultationPurchase = await prisma.purchase.findFirst({
      where: {
        candidateEmail: {
          equals: emailClean,
          mode: "insensitive",
        },
        serviceName: {
          contains: "Personal Branding Consultation",
          mode: "insensitive",
        },
        status: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!consultationPurchase) {
      return NextResponse.json({ hasCredit: false });
    }

    // Verify this consultation has not already been credited in a completed plan
    const alreadyCredited = await prisma.purchase.findFirst({
      where: {
        completionNotes: {
          contains: `[CONSULTATION_CREDITED:${consultationPurchase.id}]`,
        },
        status: "COMPLETED",
      },
    });

    if (alreadyCredited) {
      return NextResponse.json({
        hasCredit: false,
        alreadyRedeemed: true,
        redeemedDate: alreadyCredited.createdAt,
      });
    }

    return NextResponse.json({
      hasCredit: true,
      creditAmountUSD: 300,
      creditAmountINR: 25000,
      creditAmountAED: 1100,
      consultationId: consultationPurchase.id,
      purchaseDate: consultationPurchase.createdAt,
    });
  } catch (err: any) {
    console.error("Error checking consultation credit:", err);
    return NextResponse.json({ hasCredit: false, error: "Internal server error" }, { status: 500 });
  }
}
