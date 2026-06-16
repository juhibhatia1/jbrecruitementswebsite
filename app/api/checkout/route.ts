import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

let stripe: Stripe | null = null;

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
    const { serviceName, amount, candidateName, candidateEmail } = await request.json();

    if (!serviceName || !amount || !candidateName || !candidateEmail) {
      return NextResponse.json(
        { error: "Missing required fields: serviceName, amount, candidateName, candidateEmail" },
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

    // Create Stripe PaymentIntent
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(parseFloat(amount) * 100), // in cents
      currency: "usd",
      metadata: {
        candidateName,
        candidateEmail,
        serviceName,
        amount: amount.toString(),
      },
      receipt_email: candidateEmail,
    });

    // Save PENDING purchase in the database
    const purchase = await prisma.purchase.create({
      data: {
        candidateName,
        candidateEmail,
        serviceName,
        amount: parseFloat(amount),
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
