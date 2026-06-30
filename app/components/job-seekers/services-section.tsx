"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import ServiceCard from "./service-card";
import PaymentModal from "./payment-modal";
import { IoCart, IoSparkles, IoClose, IoArrowForward } from "react-icons/io5";
import { MULTI_CURRENCY_PRICING } from "@/lib/rag/system-context";

type Currency = "USD" | "AED" | "INR";

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "USD",
  AED: "AED",
  INR: "INR",
};

const BUNDLE_PRICE_BY_CURRENCY: Record<Currency, number> = {
  USD: 480,
  AED: 1600,
  INR: 30000,
};

const services = [
  {
    id: 1,
    title: "Resume Review & Rewriting",
    description:
      "ATS-optimised resumes aligned with your target roles and recruiter search systems.",
    iconPath: "/icons/job-seekers/resume-review.svg",
    timeline: "5 days",
    features: [
      "ATS-compliant, keyword-optimized resumes",
      "Strategic skills keywords for Boolean search visibility",
      "Strong achievement-focused bullet points",
      "Clear professional positioning and value proposition",
    ],
  },
  {
    id: 2,
    title: "Cover Letter Writing",
    description:
      "A master cover letter that communicates impact, motivation, and adaptability.",
    iconPath: "/icons/job-seekers/cover-letter.svg",
    timeline: "5 days",
    features: [
      "Strengths and achievements highlighted",
      "Motivation and role-fit are articulated strategically",
      "Easily customizable version for multiple applications",
      "Professional and persuasive",
    ],
  },
  {
    id: 3,
    title: "LinkedIn Optimization",
    description:
      "Strategic LinkedIn profiles designed to improve recruiter discovery and search ranking.",
    iconPath: "/icons/job-seekers/linkedin-optimisation.svg",
    timeline: "5 days",
    features: [
      "Keywords optimized content",
      "Skills-based profile structuring",
      "LinkedIn banner optimisation for stronger personal branding",
    ],
  },
  {
    id: 4,
    title: "Superstar Shout-Out",
    description: "Targeted LinkedIn announcement to decision-makers",
    iconPath: "/icons/job-seekers/superstar.svg",
    timeline: "5 days",
    features: [
      "Custom post showcasing your profile, skills & availability",
      "Strategic positioning to attract hiring managers",
      "Increased visibility with employers & key decision-makers",
      "Published via Juhi Bhatia's LinkedIn for wider reach & credibility",
    ],
  },
  {
    id: 5,
    title: "Ask Me Anything",
    description:
      "Direct, practical guidance over email for real-world career challenges and decisions.",
    iconPath: "/icons/job-seekers/ask-me-anything.svg",
    timeline: "48 hours",
    features: [
      "Career changes and transitions",
      "Remote jobs and interviews",
      "Burnout, layoffs, and clarity",
      "Resume or LinkedIn direction",
    ],
  },
  {
    id: 6,
    title: "Interview Prep",
    description:
      "Direct, practical support to help you crack your interviews with confidence.",
    iconPath: "/icons/job-seekers/interview-prep.svg",
    timeline: "Delivered via email",
    features: [
      "Profile and role review",
      "Top 10 likely interview questions",
      "Structured answers using the STAR method",
    ],
  },
];

const OPPORTUNITIES_SERVICE = {
  id: 7,
  title: "Job Opportunities",
  description: "Browse available mock interview practice sessions and book your slot to sharpen your interview skills.",
  iconPath: "/icons/job-seekers/interview-prep.svg",
  timeline: "Instant access",
  features: [
    "AI-powered or coach-led practice sessions",
    "Role-specific interview questions and scenarios",
    "Receive detailed performance feedback",
    "Strengthen your confidence before real interviews",
  ],
};

// All individual service names (excludes bundle)
const ALL_SERVICE_TITLES = services.map((s) => s.title);

export default function ServicesSection() {
  const router = useRouter();
  const [currentFlipIndex, setCurrentFlipIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [started, setStarted] = useState<boolean>(false);

  // ── Currency state ────────────────────────────────────────────────────────
  const [currency, setCurrency] = useState<Currency>("USD");

  // Multi-select cart state
  const [selectedTitles, setSelectedTitles] = useState<Set<string>>(new Set());
  const [showBundleBanner, setShowBundleBanner] = useState(false);

  // Payment Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [checkoutServices, setCheckoutServices] = useState<
    { title: string; amount: number; description: string }[]
  >([]);

  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-detect currency from geo on mount — runs client-side so it uses the real browser IP
  useEffect(() => {
    const GEO_CACHE_KEY = "jb_currency_v3";

    // Clean up stale keys from older versions
    sessionStorage.removeItem("jb_currency");
    sessionStorage.removeItem("jb_currency_v2");

    const cached = sessionStorage.getItem(GEO_CACHE_KEY) as Currency | null;
    if (cached && ["USD", "AED", "INR"].includes(cached)) {
      setCurrency(cached);
      return;
    }

    const AED_COUNTRIES = new Set(["AE"]);
    const INR_COUNTRIES = new Set(["IN", "PK", "LK"]);

    // Use AbortController to timeout after 5s
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    // Fetch directly from ipapi.co in the browser — uses the real client IP
    fetch("https://ipapi.co/json/", {
      headers: { "Accept": "application/json" },
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error(`ipapi.co status: ${r.status}`);
        return r.json();
      })
      .then((data: { country_code?: string; error?: boolean }) => {
        if (data.error) throw new Error("ipapi.co returned an error response");
        const code = (data.country_code || "").toUpperCase();
        let detected: Currency = "USD";
        if (AED_COUNTRIES.has(code)) detected = "AED";
        else if (INR_COUNTRIES.has(code)) detected = "INR";
        console.log(`[geo] Detected country: ${code} → currency: ${detected}`);
        setCurrency(detected);
        sessionStorage.setItem(GEO_CACHE_KEY, detected);
      })
      .catch((err) => {
        console.warn("[geo] Could not detect location, defaulting to USD:", err.message);
      })
      .finally(() => clearTimeout(timeout));
  }, []);

  // Helpers to get the local amount for a service in the selected currency
  const getLocalAmount = (title: string): number => {
    return MULTI_CURRENCY_PRICING[title]?.[currency] ?? 0;
  };

  const BUNDLE_PRICE = BUNDLE_PRICE_BY_CURRENCY[currency];
  const INDIVIDUAL_TOTAL = services.reduce(
    (sum, s) => sum + getLocalAmount(s.title),
    0
  );

  // start auto-flip sequence after initial 3s delay
  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), 3000);
    return () => clearTimeout(startTimer);
  }, []);

  // Sequential auto-flip every 6 seconds after `started`
  useEffect(() => {
    if (isPaused || !started || isModalOpen) return;

    const interval = setInterval(() => {
      setCurrentFlipIndex((prev) => (prev + 1) % services.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, started, isModalOpen]);

  const clearResumeTimeout = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  const handleHoverStart = useCallback(() => {
    clearResumeTimeout();
    setIsPaused(true);
    setCurrentFlipIndex(-1);
  }, [clearResumeTimeout]);

  const handleHoverEnd = useCallback(
    (index: number) => {
      clearResumeTimeout();
      setIsPaused(false);
      setCurrentFlipIndex((index + 1) % services.length);
    },
    [clearResumeTimeout],
  );

  const pauseTemporarily = useCallback(() => {
    clearResumeTimeout();
    setIsPaused(true);
    setCurrentFlipIndex(-1);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  }, [clearResumeTimeout]);

  useEffect(() => {
    return () => clearResumeTimeout();
  }, [clearResumeTimeout]);

  // Toggle a service in/out of cart
  const handleToggleSelect = (title: string) => {
    setSelectedTitles((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      // Show bundle banner when ALL 6 individual services are selected
      const allSelected = ALL_SERVICE_TITLES.every((t) => next.has(t));
      setShowBundleBanner(allSelected);
      return next;
    });
  };

  // Cart totals (in selected currency)
  const cartServices = services.filter((s) => selectedTitles.has(s.title));
  const cartTotal = cartServices.reduce(
    (sum, s) => sum + getLocalAmount(s.title),
    0
  );
  const bundleSavings = cartTotal - BUNDLE_PRICE;

  // Open payment modal for a single service (Buy Now)
  const handleBuyClick = (title: string, description: string) => {
    const localAmt = getLocalAmount(title);
    if (title === "All Career Services Bundle") {
      fetch("/api/analytics/funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceName: title, eventType: "CLICK_BUY" }),
      }).catch((e) => console.error("Telemetry failed:", e));
    }
    setCheckoutServices([{ title, amount: localAmt, description }]);
    setIsModalOpen(true);
  };

  // Open payment modal for cart (multi-service)
  const handleCartCheckout = () => {
    if (cartServices.length === 0) return;
    setCheckoutServices(
      cartServices.map((s) => ({
        title: s.title,
        amount: getLocalAmount(s.title),
        description: s.description,
      })),
    );
    setIsModalOpen(true);
  };

  // Switch to bundle from cart banner
  const handleSwitchToBundle = () => {
    setShowBundleBanner(false);
    setSelectedTitles(new Set());
    handleBuyClick(
      "All Career Services Bundle",
      "Comprehensive pack including Resume rewrite, Cover letter rewrite, LinkedIn Optimization, Superstar Shout-out, Ask Me Anything session, and Interview Prep.",
    );
  };

  // Log bundle view on mount
  useEffect(() => {
    fetch("/api/analytics/funnel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceName: "All Career Services Bundle",
        eventType: "VIEW",
      }),
    }).catch((e) => console.error("Telemetry failed:", e));
  }, []);

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Section Header */}
        <div className="relative flex flex-col items-left md:flex-row md:items-center justify-center mb-0 md:mb-12 md:pl-12">
          <div className="md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2 flex items-center gap-2 mb-3 md:mb-0">
            <img
              src="/home/icons8-ai-48.avif"
              alt="Help Icon"
              className="w-6 h-6 md:w-7 md:h-7"
            />
            <span className="text-sm sm:text-base font-semibold text-[#605dba]">
              Our Services
            </span>
          </div>

          <h2 className="text-left md:text-center text-2xl sm:text-3xl md:text-4xl font-semibold text-[#252e3d]">
            How We Can Help
          </h2>
        </div>

        {/* ── Info message ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 -mt-2 md:-mt-6">
          <p className="text-sm text-gray-400">
            Select multiple services and pay in one go, or click{" "}
            <span className="text-[#5a58ab] font-medium">Buy Now</span> for a single service.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, index) => {
            const localAmt = getLocalAmount(s.title);
            const dynamicPriceBullet = `${currency} ${localAmt.toLocaleString()} | ${s.timeline}`;
            const dynamicFeatures = [...s.features, dynamicPriceBullet];

            return (
              <ServiceCard
                key={s.id}
                title={s.title}
                amount={MULTI_CURRENCY_PRICING[s.title]?.USD ?? 0}
                localAmount={localAmt}
                currency={CURRENCY_SYMBOLS[currency]}
                description={s.description}
                iconPath={s.iconPath}
                features={dynamicFeatures}
                shouldFlip={started && currentFlipIndex === index && !isModalOpen}
                onManualFlip={pauseTemporarily}
                onHoverStart={handleHoverStart}
                onHoverEnd={() => handleHoverEnd(index)}
                onBuyClick={() => handleBuyClick(s.title, s.description)}
                isSelected={selectedTitles.has(s.title)}
                onToggleSelect={() => handleToggleSelect(s.title)}
              />
            );
          })}

          {/* Opportunities card — navigates to /opportunities */}
          {(() => {
            const localAmt = MULTI_CURRENCY_PRICING[OPPORTUNITIES_SERVICE.title]?.[currency] ?? 40;
            const dynamicPriceBullet = `${currency} ${localAmt.toLocaleString()} | ${OPPORTUNITIES_SERVICE.timeline}`;
            return (
              <ServiceCard
                key={OPPORTUNITIES_SERVICE.id}
                title={OPPORTUNITIES_SERVICE.title}
                amount={40}
                localAmount={localAmt}
                currency={CURRENCY_SYMBOLS[currency]}
                description={OPPORTUNITIES_SERVICE.description}
                iconPath={OPPORTUNITIES_SERVICE.iconPath}
                features={[...OPPORTUNITIES_SERVICE.features, dynamicPriceBullet]}
                shouldFlip={false}
                onBuyClick={() => router.push("/opportunities")}
                buyLabel="View Opportunities"
              />
            );
          })()}
        </div>

        {/* Bundle Offer Below Cards */}
        <div className="mt-12 flex justify-center">
          <div className="relative isolate inline-flex flex-col items-center gap-3 rounded-3xl border border-[#e6eefc] px-6 sm:px-8 py-6 shadow-[0_12px_40px_rgba(37,55,77,0.06)] text-center max-w-lg">
            <div
              className="absolute inset-0 -z-10 blur-2xl bg-linear-to-r from-[#e6eefc]/40 via-[#dfe8fb]/30 to-[#f8fafc]/20"
              aria-hidden="true"
            ></div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-[#5a58ab] shadow-sm border border-[#e8e3ff]">
              Limited Bundle
            </span>
            <h2 className="text-lg sm:text-2xl font-bold text-[#252e3d] leading-tight">
              All services bundled together at a special price of{" "}
              {CURRENCY_SYMBOLS[currency]} {BUNDLE_PRICE.toLocaleString()}.
            </h2>
            <span className="text-sm sm:text-md text-[#4b5563]">
              Save{" "}
              <span className="font-semibold text-[#5a58ab]">
                {CURRENCY_SYMBOLS[currency]} {(INDIVIDUAL_TOTAL - BUNDLE_PRICE).toLocaleString()}
              </span>{" "}
              vs buying all separately.
            </span>
            <button
              onClick={() =>
                handleBuyClick(
                  "All Career Services Bundle",
                  "Comprehensive pack including Resume rewrite, Cover letter rewrite, LinkedIn Optimization, Superstar Shout-out, Ask Me Anything session, and Interview Prep.",
                )
              }
              className="mt-2 bg-[#5a58ab] hover:bg-[#4a489b] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm cursor-pointer hover:shadow-md active:scale-[0.98]"
            >
              Get Bundle Offer
            </button>
          </div>
        </div>
      </div>

      {/* ── Sticky Cart Bar ─────────────────────────────────────────────────── */}
      {cartServices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 animate-slideUp">
          <div className="mx-auto max-w-2xl bg-[#252e3d] rounded-2xl shadow-[0_-4px_32px_rgba(37,46,61,0.25)] px-5 py-4">
            {/* Bundle banner — shown when all 6 are selected */}
            {showBundleBanner && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3 bg-[#5a58ab]/20 border border-[#5a58ab]/30 rounded-xl p-3">
                <div className="flex items-start gap-3 min-w-0">
                  <IoSparkles className="text-yellow-300 w-5 h-5 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold leading-snug">
                      You've selected all 6 services!
                    </p>
                    <p className="text-white/70 text-xs mt-0.5">
                      The{" "}
                      <span className="text-yellow-300 font-semibold">
                        Bundle Offer ({CURRENCY_SYMBOLS[currency]} {BUNDLE_PRICE.toLocaleString()})
                      </span>{" "}
                      saves you{" "}
                      <span className="text-yellow-300 font-semibold">
                        {CURRENCY_SYMBOLS[currency]} {bundleSavings.toLocaleString()}
                      </span>{" "}
                      vs buying them separately.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSwitchToBundle}
                  className="w-full sm:w-auto shrink-0 bg-yellow-400 hover:bg-yellow-300 text-[#252e3d] text-xs font-bold px-3 py-1.5 rounded-lg transition-colors text-center"
                >
                  Switch to Bundle
                </button>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {/* Top Row: Selected service pills */}
              <div className="flex flex-row md:flex-wrap items-center gap-1.5 overflow-x-auto md:overflow-visible pb-1 md:pb-0 whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {cartServices.map((s) => (
                  <span
                    key={s.title}
                    className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/15 text-white/90 text-xs px-2.5 py-1 rounded-lg transition-colors shrink-0"
                  >
                    <span>{s.title}</span>
                    <button
                      onClick={() => handleToggleSelect(s.title)}
                      className="text-white/40 hover:text-white cursor-pointer transition-colors ml-1 text-sm font-bold leading-none"
                      title={`Remove ${s.title}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Divider line */}
              <div className="h-px bg-white/10 w-full"></div>

              {/* Bottom Row: Summary & Actions */}
              <div className="flex items-center justify-between gap-4">
                {/* Cart summary */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <IoCart className="text-white w-6 h-6" />
                    <span className="absolute -top-2 -right-2 bg-[#5a58ab] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {cartServices.length}
                    </span>
                  </div>
                  <div>
                    <p className="text-white/60 text-[10px] font-medium leading-none mb-0.5">
                      {CURRENCY_SYMBOLS[currency]}
                    </p>
                    <p className="text-white text-base md:text-lg font-bold leading-none">
                      {cartTotal.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedTitles(new Set());
                      setShowBundleBanner(false);
                    }}
                    className="text-white/40 hover:text-white/80 p-2 rounded-lg transition-colors cursor-pointer"
                    aria-label="Clear cart"
                  >
                    <IoClose className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCartCheckout}
                    className="group bg-[#5a58ab] hover:bg-[#4a489b] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-sm flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Checkout</span>
                    <IoArrowForward className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Payment Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCheckoutServices([]);
        }}
        services={checkoutServices}
        currency={CURRENCY_SYMBOLS[currency]}
      />
    </section>
  );
}
