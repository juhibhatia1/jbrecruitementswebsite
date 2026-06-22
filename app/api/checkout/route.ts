import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getClientIp, isRateLimited } from "@/lib/rate-limiter";

let stripe: Stripe | null = null;

const SERVICE_PRICING: Record<string, number> = {
  "Resume Review & Rewriting": 80,
  "Cover Letter Writing": 50,
  "LinkedIn Optimization": 80,
  "Superstar Shout-Out": 160,
  "Ask Me Anything": 40,
  "Interview Prep": 100,
  "All Career Services Bundle": 480,
};

function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured on the server.");
    }
    stripe = new Stripe(key, {
      apiVersion: "2026-05-27.dahlia",
    });
  }
  return stripe;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    // Rate limit: 5 checkout attempts per hour per IP
    if (isRateLimited(ip, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Please try again in an hour." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { candidateName, candidateEmail } = body;

    if (!candidateName || !candidateEmail) {
      return NextResponse.json(
        { error: "Missing required fields: candidateName, candidateEmail" },
        { status: 400 },
      );
    }

    // ── Resolve service names & total price ─────────────────────────────────
    // Support both legacy single `serviceName` and new multi `serviceNames[]`
    let serviceNames: string[];

    if (Array.isArray(body.serviceNames) && body.serviceNames.length > 0) {
      serviceNames = body.serviceNames;
    } else if (typeof body.serviceName === "string" && body.serviceName) {
      serviceNames = [body.serviceName];
    } else {
      return NextResponse.json(
        { error: "Missing required field: serviceName or serviceNames" },
        { status: 400 },
      );
    }

    // Validate every name and sum their prices
    let totalAmount = 0;
    for (const name of serviceNames) {
      const price = SERVICE_PRICING[name];
      if (price === undefined) {
        return NextResponse.json(
          { error: `Invalid or unrecognized service: ${name}` },
          { status: 400 },
        );
      }
      totalAmount += price;
    }

    // For DB storage, join multiple names with " + "
    const combinedServiceName = serviceNames.join(" + ");

    let stripeClient;
    try {
      stripeClient = getStripe();
    } catch (err: any) {
      console.error(err.message);
      return NextResponse.json(
        { error: "Stripe integration is not properly configured on the server." },
        { status: 500 },
      );
    }

    // Create Stripe PaymentIntent with server-computed total
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // in cents
      currency: "usd",
      metadata: {
        candidateName,
        candidateEmail,
        serviceName: combinedServiceName,
        serviceCount: serviceNames.length.toString(),
        amount: totalAmount.toString(),
      },
      receipt_email: candidateEmail,
    });

    // Save PENDING purchase record
    const purchase = await prisma.purchase.create({
      data: {
        candidateName,
        candidateEmail,
        serviceName: combinedServiceName,
        amount: totalAmount,
        currency: "USD",
        stripePaymentIntentId: paymentIntent.id,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      purchaseId: purchase.id,
    });
  } catch (error: any) {
    console.error("Error creating Stripe PaymentIntent:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
