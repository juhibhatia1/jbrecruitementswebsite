import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, isRateLimited } from "@/lib/rate-limiter";
import { MULTI_CURRENCY_PRICING, type Currency } from "@/lib/rag/system-context";
import { detectCurrencyFromRequest } from "@/lib/geo-utils";
import { candidateApplicationSafeSelect } from "@/lib/candidate-application-select";
import { PaymentFactory } from "../../lib/payments/payment-factory";
import crypto from "crypto";

// Fallback USD-only pricing (legacy safety net)
const SERVICE_PRICING_USD: Record<string, number> = {
  "Resume Review & Rewriting": 79,
  "Cover Letter Writing": 49,
  "LinkedIn Optimization": 79,
  "Superstar Shout-Out": 179,
  "Ask Me Anything": 49,
  "Interview Prep": 99,
  "Ready-to-Apply Job Pack": 119,
  "Mock Interview": 39,
  "All Career Services Bundle": 480,
};

const BUNDLE_DISCOUNT_PERCENT = 0.2;
const BUNDLE_MIN_SERVICE_COUNT = 4;
const BUNDLE_EXCLUDED_SERVICE_NAMES = new Set(["AI Mock Interview"]);

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
    const { candidateName, candidateEmail, candidatePhone, paymentGateway = "STRIPE" } = body;
    // Optional interview metadata — only present when this checkout is for a mock interview
    const interviewMetadata = body.interviewMetadata as {
      templateId?: string;
      linkedInUrl?: string;
      resumeUrl?: string;
      resumeText?: string;
      interviewPreference?: "AI" | "MANUAL";
      careerGoal?: string;
      focusAreas?: string;
      selfIntroNotes?: string;
      jobRole?: string;
      yearsOfExperience?: string;
      applicationLink?: string;
      jobApplicationLink?: string;
      interviewBrief?: string;
    } | undefined;

    const nameClean = (candidateName || "").trim();
    const emailClean = (candidateEmail || "").trim();
    const phoneClean = (candidatePhone || "").trim();
    const phoneDigits = phoneClean.replace(/\D/g, "");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s\-\(\)\.]{6,20}$/;

    if (!nameClean || nameClean.length < 2 || !/\p{L}/u.test(nameClean)) {
      return NextResponse.json(
        { error: "Please enter a valid full name (at least 2 letters)." },
        { status: 400 },
      );
    }

    if (!emailClean || !emailRegex.test(emailClean)) {
      if (emailClean.includes("@") && !emailClean.split("@")[1]?.includes(".")) {
        return NextResponse.json(
          { error: "Your email appears to be missing a dot/extension in the domain (e.g. @gmail.com instead of @gmailcom)." },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { error: "Please enter a valid email address (e.g. name@example.com)." },
        { status: 400 },
      );
    }

    if (!phoneClean || !phoneRegex.test(phoneClean) || phoneDigits.length < 6 || phoneDigits.length > 15) {
      return NextResponse.json(
        { error: "Please enter a valid WhatsApp phone number with country code (e.g. +1 555 123 4567 or +91 93811 50341)." },
        { status: 400 },
      );
    }

    // ── Resolve authoritative currency strictly from location ──────────────
    const authoritativeCurrency = await detectCurrencyFromRequest(request, ip);

    // ── Protect against currency mismatch (e.g. stale client cache vs real location) ──
    let requestedCurrency =
      typeof body.currency === "string" ? body.currency.trim().toUpperCase() : null;
    if (requestedCurrency === "₹") requestedCurrency = "INR";
    if (requestedCurrency === "$") requestedCurrency = "USD";
    if (requestedCurrency && requestedCurrency !== authoritativeCurrency) {
      return NextResponse.json(
        {
          error: `Currency mismatch detected. Your location indicates ${authoritativeCurrency}, but the order was submitted in ${requestedCurrency}. Please refresh the page to view current pricing.`,
          code: "CURRENCY_MISMATCH",
          expectedCurrency: authoritativeCurrency,
        },
        { status: 400 },
      );
    }
    const currency = authoritativeCurrency;

    // ── Resolve & validate payment gateway against currency ───────────────────
    let effectiveGateway =
      typeof paymentGateway === "string" ? paymentGateway.trim().toUpperCase() : "STRIPE";

    // PayU strictly supports INR only. International orders (USD/AED) MUST use Stripe.
    if (currency !== "INR") {
      effectiveGateway = "STRIPE";
    } else if (!body.paymentGateway) {
      effectiveGateway = "PAYU";
    }

    if (effectiveGateway === "PAYU" && currency !== "INR") {
      return NextResponse.json(
        { error: "PayU is only available for payments in INR." },
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

    const provider = PaymentFactory.getProvider(effectiveGateway);
    const purchaseId = crypto.randomUUID();

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
            resumeUrl: interviewMetadata.resumeUrl || null,
            resumeText: interviewMetadata.resumeText || null,
            interviewPreference: (interviewMetadata as any).interviewPreference || "AI",
            careerGoal: interviewMetadata.careerGoal || null,
            focusAreas: interviewMetadata.focusAreas || null,
            selfIntroNotes: interviewMetadata.selfIntroNotes || null,
            yearsOfExperience: interviewMetadata.yearsOfExperience || null,
            jobApplicationLink: interviewMetadata.jobApplicationLink || null,
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
            resumeUrl: interviewMetadata.resumeUrl || null,
            resumeText: interviewMetadata.resumeText || null,
            interviewPreference: (interviewMetadata as any).interviewPreference || "AI",
            careerGoal: interviewMetadata.careerGoal || null,
            focusAreas: interviewMetadata.focusAreas || null,
            selfIntroNotes: interviewMetadata.selfIntroNotes || null,
            yearsOfExperience: interviewMetadata.yearsOfExperience || null,
            jobApplicationLink: interviewMetadata.jobApplicationLink || null,
          },
        });
      }
      
      applicationId = application?.id;
    }

    const metadataParams = {
      candidateName,
      candidateEmail,
      serviceName: combinedServiceName,
      serviceCount: serviceNames.length.toString(),
      amount: totalAmount.toString(),
      bundleDiscount: bundleDiscount.toString(),
      bundleEligibleServiceCount: bundleEligibleCount.toString(),
      displayCurrency: currency,
      purchaseId,
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
    };

    // Create Order via PaymentFactory
    const orderResult = await provider.createOrder({
      amount: totalAmount,
      currency: currency,
      candidateName,
      candidateEmail,
      candidatePhone,
      serviceName: combinedServiceName,
      metadata: metadataParams,
    });

    // Save PENDING purchase record
    const purchase = await prisma.purchase.create({
      data: {
        id: purchaseId,
        candidateName,
        candidateEmail,
        candidatePhone: candidatePhone || null,
        serviceName: combinedServiceName,
        amount: totalAmount,
        currency: currency,
        gatewayTransactionId: orderResult.gatewayTransactionId,
        paymentGateway: effectiveGateway as any,
        status: "PENDING",
        // Store metadata in completionNotes for non-Stripe gateways (like PayU) to recover checkout context
        ...(effectiveGateway !== "STRIPE" && {
          completionNotes: JSON.stringify(metadataParams),
        }),
      },
    });

    if (applicationId) {
      await prisma.candidateApplication.update({
        where: { id: applicationId },
        data: { purchaseId: purchase.id },
      });
    }

    return NextResponse.json({
      clientSecret: orderResult.clientSecret,
      paymentUrl: orderResult.paymentUrl,
      gatewayMetadata: orderResult.metadata,
      purchaseId: purchase.id,
    });
  } catch (error: any) {
    console.error("Error creating Payment Order:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
