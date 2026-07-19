import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getClientIp, isRateLimited } from "@/lib/rate-limiter";
import { MULTI_CURRENCY_PRICING, type Currency } from "@/lib/rag/system-context";
import { detectCurrencyFromRequest } from "@/lib/geo-utils";
import { candidateApplicationSafeSelect } from "@/lib/candidate-application-select";

let stripe: Stripe | null = null;

// Supported Stripe currency codes for each of our display currencies
const STRIPE_CURRENCY_MAP: Record<Currency, string> = {
  USD: "usd",
  AED: "aed",
  INR: "inr",
};

// Fallback USD-only pricing (legacy safety net)
const SERVICE_PRICING_USD: Record<string, number> = {
  "Resume Review & Rewriting": 79,
  "Cover Letter Writing": 49,
  "LinkedIn Optimization": 79,
  "Superstar Shout-Out": 159,
  "Ask Me Anything": 39,
  "Interview Prep": 99,
  "Ready-to-Apply Job Pack": 99,
  "All Career Services Bundle": 480,
};

const BUNDLE_DISCOUNT_PERCENT = 0.1;
const BUNDLE_MIN_SERVICE_COUNT = 4;
const BUNDLE_EXCLUDED_SERVICE_NAMES = new Set(["AI Mock Interview"]);

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
    // Optional interview metadata — only present when this checkout is for a mock interview
    const interviewMetadata = body.interviewMetadata as {
      templateId?: string;
      linkedInUrl?: string;
      interviewPreference?: "AI" | "MANUAL";
      jobRole?: string;
      yearsOfExperience?: string;
      applicationLink?: string;
      interviewBrief?: string;
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
    let bundleEligibleSubtotal = 0;
    let bundleEligibleCount = 0;
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

      if (!BUNDLE_EXCLUDED_SERVICE_NAMES.has(name)) {
        bundleEligibleSubtotal += price;
        bundleEligibleCount += 1;
      }
    }

    const bundleDiscount =
      bundleEligibleCount >= BUNDLE_MIN_SERVICE_COUNT
        ? Math.round(bundleEligibleSubtotal * BUNDLE_DISCOUNT_PERCENT)
        : 0;
    totalAmount = Math.max(0, totalAmount - bundleDiscount);

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
        select: candidateApplicationSafeSelect,
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
            interviewPreference: (interviewMetadata as any).interviewPreference || "AI",
          },
        });
      }
      
      applicationId = application?.id;
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
        bundleDiscount: bundleDiscount.toString(),
        bundleEligibleServiceCount: bundleEligibleCount.toString(),
        displayCurrency: currency,
        // Interview-specific metadata (only set for mock interview purchases)
        ...(interviewMetadata?.templateId && {
          interviewTemplateId: interviewMetadata.templateId,
          interviewPreference: (interviewMetadata as any).interviewPreference || "AI",
          linkedInUrl: interviewMetadata.linkedInUrl || "",
          applicationId: applicationId || "",
        }),
        ...(!interviewMetadata?.templateId &&
          interviewMetadata?.interviewPreference === "MANUAL" && {
            interviewPreference: "MANUAL",
            jobRole: interviewMetadata.jobRole || "",
            yearsOfExperience: interviewMetadata.yearsOfExperience || "",
            applicationLink: interviewMetadata.applicationLink || "",
            interviewBrief: interviewMetadata.interviewBrief || "",
            linkedInUrl: interviewMetadata.linkedInUrl || "",
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
