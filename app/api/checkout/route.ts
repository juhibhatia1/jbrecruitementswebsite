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
    // Rate limit check: limit to 5 checkout attempts per hour
    if (isRateLimited(ip, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Please try again in an hour." },
        { status: 429 },
      );
    }

    const { serviceName, candidateName, candidateEmail } = await request.json();

    if (!serviceName || !candidateName || !candidateEmail) {
      return NextResponse.json(
        { error: "Missing required fields: serviceName, candidateName, candidateEmail" },
        { status: 400 },
      );
    }

    const resolvedPrice = SERVICE_PRICING[serviceName];
    if (resolvedPrice === undefined) {
      return NextResponse.json(
        { error: `Invalid or unrecognized service: ${serviceName}` },
        { status: 400 },
      );
    }

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

    // Create Stripe PaymentIntent using resolved server-side price
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(resolvedPrice * 100), // in cents
      currency: "usd",
      metadata: {
        candidateName,
        candidateEmail,
        serviceName,
        amount: resolvedPrice.toString(),
      },
      receipt_email: candidateEmail,
    });

    // Save PENDING purchase in the database
    const purchase = await prisma.purchase.create({
      data: {
        candidateName,
        candidateEmail,
        serviceName,
        amount: resolvedPrice,
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
