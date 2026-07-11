import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getClientIp, isRateLimited } from "@/lib/rate-limiter";
import { MULTI_CURRENCY_PRICING, type Currency } from "@/lib/rag/system-context";
import { detectCurrencyFromRequest } from "@/lib/geo-utils";

let stripe: Stripe | null = null;

// Supported Stripe currency codes for each of our display currencies
const STRIPE_CURRENCY_MAP: Record<Currency, string> = {
  USD: "usd",
  AED: "aed",
  INR: "inr",
};

// Fallback USD-only pricing (legacy safety net)
const SERVICE_PRICING_USD: Record<string, number> = {
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
      apiVersion: "2026-05-27.dahlia" as any,
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
    const { candidateName, candidateEmail, candidatePhone } = body;
    // Optional interview metadata — only present when this checkout is for an AI mock interview
    const interviewMetadata = body.interviewMetadata as {
      templateId?: string;
      linkedInUrl?: string;
    } | undefined;

    if (!candidateName || !candidateEmail) {
      return NextResponse.json(
        { error: "Missing required fields: candidateName, candidateEmail" },
        { status: 400 },
      );
    }

    // ── Resolve currency strictly from location ──────────────────────────────
    const currency = await detectCurrencyFromRequest(request, ip);

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

    // Validate every service name and sum prices in the selected currency
    let totalAmount = 0;
    for (const name of serviceNames) {
      const pricingRow = MULTI_CURRENCY_PRICING[name];
      const price = pricingRow
        ? pricingRow[currency]
        : SERVICE_PRICING_USD[name];

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

    const stripeCurrency = STRIPE_CURRENCY_MAP[currency];

    let applicationId: string | undefined = undefined;

    // If mock interview checkout, pre-create the candidate application
    if (interviewMetadata?.templateId) {
      const { generateInterviewAccessToken, hashInterviewAccessToken } = await import("@/lib/interview/access-token");
      
      const candidateEmailLower = candidateEmail.trim().toLowerCase();
      
      // Look for any existing pending (APPLIED) application for the same email/template to reuse
      let application = await prisma.candidateApplication.findFirst({
        where: {
          templateId: interviewMetadata.templateId,
          candidateEmail: candidateEmailLower,
          status: "APPLIED",
        },
      });

      if (!application) {
        const accessToken = generateInterviewAccessToken();
        const accessTokenHash = hashInterviewAccessToken(accessToken);
        const accessTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        application = await prisma.candidateApplication.create({
          data: {
            templateId: interviewMetadata.templateId,
            candidateName: candidateName.trim(),
            candidateEmail: candidateEmailLower,
            candidatePhone: candidatePhone || null,
            linkedInUrl: interviewMetadata.linkedInUrl || null,
            resumeUrl: (interviewMetadata as any).resumeUrl || null,
            resumeText: (interviewMetadata as any).resumeText || null,
            interviewPreference: (interviewMetadata as any).interviewPreference || "AI",
            accessTokenHash,
            accessTokenExpiresAt,
            status: "APPLIED",
          },
        });
      } else {
        // Update resume/details on existing draft if changed
        application = await prisma.candidateApplication.update({
          where: { id: application.id },
          data: {
            candidateName: candidateName.trim(),
            candidatePhone: candidatePhone || null,
            linkedInUrl: interviewMetadata.linkedInUrl || null,
            resumeUrl: (interviewMetadata as any).resumeUrl || null,
            resumeText: (interviewMetadata as any).resumeText || null,
            interviewPreference: (interviewMetadata as any).interviewPreference || "AI",
          },
        });
      }
      
      applicationId = application.id;
    }

    // Create Stripe PaymentIntent with server-computed total in the correct currency
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // smallest unit (cents / paise / fils)
      currency: stripeCurrency,
      metadata: {
        candidateName,
        candidateEmail,
        serviceName: combinedServiceName,
        serviceCount: serviceNames.length.toString(),
        amount: totalAmount.toString(),
        displayCurrency: currency,
        // Interview-specific metadata (only set for mock interview purchases)
        ...(interviewMetadata?.templateId && {
          interviewTemplateId: interviewMetadata.templateId,
          interviewPreference: (interviewMetadata as any).interviewPreference || "AI",
          linkedInUrl: interviewMetadata.linkedInUrl || "",
          applicationId: applicationId || "",
        }),
      },
      receipt_email: candidateEmail,
    });

    // Save PENDING purchase record
    const purchase = await prisma.purchase.create({
      data: {
        candidateName,
        candidateEmail,
        candidatePhone: candidatePhone || null,
        serviceName: combinedServiceName,
        amount: totalAmount,
        currency: currency,
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
