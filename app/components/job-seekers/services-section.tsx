"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ServiceCard from "./service-card";
import PaymentModal from "./payment-modal";
import {
  IoCart,
  IoSparkles,
  IoFlash,
  IoClose,
  IoArrowForward,
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";
import Link from "next/link";
import { RxArrowTopRight } from "react-icons/rx";
import { MULTI_CURRENCY_PRICING } from "@/lib/rag/system-context";
import { useDetectCurrency } from "@/lib/hooks/useDetectCurrency";

type Currency = "USD" | "AED" | "INR";

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "USD",
  AED: "AED",
  INR: "INR",
};

const BUNDLE_DISCOUNT_PERCENT = 20;
const BUNDLE_MIN_SERVICE_COUNT = 4;
const BUNDLE_EXCLUDED_TITLES = new Set<string>([]);

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
      "LinkedIn banner optimization for stronger personal branding",
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
      "Direct, practical support to help you prepare for interviews with confidence while our full mock-template library is being built.",
    iconPath: "/icons/job-seekers/interview-prep.svg",
    timeline: "Delivered via email",
    features: [
      "Profile and role review",
      "Top 10 likely interview questions",
      "Structured answers using the STAR method",
    ],
  },
  {
    id: 8,
    title: "Ready-to-Apply Job Pack",
    description:
      "A curated shortlist of active, relevant public job opportunities matched to your experience, skills, and target locations.",
    iconPath: "/icons/job-seekers/resume-review.svg",
    timeline: "Curated within 3 days",
    features: [
      "Targeted opportunities based on your background",
      "Preferred location filtering",
      "Public job listings from portals and company career pages",
      "Direct application links for faster applying",
    ],
  },
];

const OPPORTUNITIES_SERVICE = {
  id: 7,
  title: "Mock Interview",
  description:
    "Book an in-app AI interview practice session and share the role details you want us to focus on.",
  iconPath: "/icons/job-seekers/interview-prep.svg",
  timeline: "Instant access",
  features: [
    "AI-powered practice sessions",
    "Role-specific interview questions and scenarios",
    "Receive detailed performance feedback",
    "Strengthen your confidence before real interviews",
  ],
};

const PROMO_SLIDES = [
  ...services.map((service) => ({
    title: service.title,
    eyebrow: "Featured service",
    summary: service.description,
    benefit: service.features.slice(0, 2),
    metrics:
      service.title === "Resume Review & Rewriting"
        ? [
            { value: "2.8k+", label: "Resume revamps" },
            { value: "82%", label: "ATS lift" },
            { value: "4.8/5", label: "Client rating" },
          ]
        : service.title === "Cover Letter Writing"
          ? [
              { value: "1.9k+", label: "Letters written" },
              { value: "74%", label: "Reply lift" },
              { value: "48h", label: "Turnaround" },
            ]
          : service.title === "LinkedIn Optimization"
            ? [
                { value: "3.2k+", label: "Profiles tuned" },
                { value: "61%", label: "Visibility boost" },
                { value: "5.0/5", label: "Quality score" },
              ]
            : service.title === "Superstar Shout-Out"
              ? [
                  { value: "560+", label: "Spotlights shared" },
                  { value: "18k+", label: "Post reach" },
                  { value: "96%", label: "Approval rate" },
                ]
              : service.title === "Ask Me Anything"
                ? [
                    { value: "1.4k+", label: "Questions answered" },
                    { value: "92%", label: "Satisfaction" },
                    { value: "24h", label: "Avg. reply" },
                  ]
                : service.title === "Ready-to-Apply Job Pack"
                  ? [
                      { value: "750+", label: "Job packs sent" },
                      { value: "15+", label: "Roles per pack" },
                      { value: "3 days", label: "Turnaround" },
                    ]
                  : [
                      { value: "48h", label: "Turnaround" },
                      { value: "79%", label: "Confidence gain" },
                      { value: "5.0/5", label: "Feedback score" },
                    ],
    iconPath: service.iconPath,
    cta: "Explore this service",
  })),
  {
    title: OPPORTUNITIES_SERVICE.title,
    eyebrow: "AI interview practice",
    summary: OPPORTUNITIES_SERVICE.description,
    benefit: [
      "Practice with an AI interviewer",
      "Get role-specific questions and feedback",
    ],
    metrics: [
      { value: "80k+", label: "Mock sessions" },
      { value: "88%", label: "Skill lift" },
      { value: "30 min", label: "Start time" },
    ],
    iconPath: OPPORTUNITIES_SERVICE.iconPath,
    cta: "Browse interview options",
  },
  {
    title: "All Career Services Bundle",
    eyebrow: "Limited Time Offer • Best value",
    summary:
      "Limited Time Offer: Get 20% off when you choose any 4 or more services, including the AI Mock Interview.",
    benefit: [
      "Build a bundle from the services that fit your needs",
      "AI Mock Interview is included in the discount calculation",
    ],
    metrics: [
      { value: "20%", label: "Limited Time Off" },
      { value: "4+", label: "Services needed" },
      { value: "7", label: "Service options" },
    ],
    iconPath: "/icons/job-seekers/resume-review.svg",
    cta: "Get bundle offer",
  },
];

type PromoMetrics = {
  candidatesServed: number;
  paidBookings: number;
  completedInterviews: number;
};

export default function ServicesSection({
  promoMetrics,
}: {
  promoMetrics: PromoMetrics;
}) {
  const router = useRouter();
  const [currentFlipIndex, setCurrentFlipIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [started, setStarted] = useState<boolean>(false);
  const [activePromoSlide, setActivePromoSlide] = useState(0);
  const [isPromoPaused, setIsPromoPaused] = useState(false);

  // Currency — auto-detected from geo (cache → browser hints → /api/geo → ipapi.co)
  const currency = useDetectCurrency();

  // Multi-select cart state
  const [selectedTitles, setSelectedTitles] = useState<Set<string>>(new Set());
  const [showBundleBanner, setShowBundleBanner] = useState(false);
  const [bundleBannerDismissed, setBundleBannerDismissed] = useState(false);
  const servicesGridRef = useRef<HTMLDivElement | null>(null);

  // Payment Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [checkoutServices, setCheckoutServices] = useState<
    { title: string; amount: number; description: string }[]
  >([]);

  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);




  // Helpers to get the local amount for a service in the selected currency
  const getLocalAmount = (title: string): number => {
    return MULTI_CURRENCY_PRICING[title]?.[currency] ?? 0;
  };

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
      const eligibleSelectedCount = Array.from(next).filter(
        (serviceTitle) => !BUNDLE_EXCLUDED_TITLES.has(serviceTitle),
      ).length;
      const meetsThreshold = eligibleSelectedCount >= BUNDLE_MIN_SERVICE_COUNT;
      setShowBundleBanner(meetsThreshold && !bundleBannerDismissed);
      if (!meetsThreshold) {
        setBundleBannerDismissed(false);
      }
      return next;
    });
  };

  // Cart totals (in selected currency)
  const cartServices = [...services, OPPORTUNITIES_SERVICE].filter((s) =>
    selectedTitles.has(s.title),
  );
  const cartEligibleServices = cartServices.filter(
    (service) => !BUNDLE_EXCLUDED_TITLES.has(service.title),
  );
  const cartTotal = cartServices.reduce(
    (sum, s) => sum + getLocalAmount(s.title),
    0,
  );
  const bundleDiscount =
    cartEligibleServices.length >= BUNDLE_MIN_SERVICE_COUNT
      ? cartEligibleServices.reduce(
          (sum, service) => sum + getLocalAmount(service.title),
          0,
        ) *
        (BUNDLE_DISCOUNT_PERCENT / 100)
      : 0;
  const discountedCartTotal = cartTotal - bundleDiscount;

  useEffect(() => {
    const eligibleSelectedCount = cartEligibleServices.length;
    if (eligibleSelectedCount < BUNDLE_MIN_SERVICE_COUNT) {
      setBundleBannerDismissed(false);
      setShowBundleBanner(false);
      return;
    }

    setShowBundleBanner(!bundleBannerDismissed);
  }, [bundleBannerDismissed, cartEligibleServices.length]);

  // Open payment modal for a single service (Buy Now)
  // Note: CLICK_BUY analytics are already fired by ServiceCard's Buy Now button,
  // so no duplicate fetch is needed here.
  const handleBuyClick = (title: string, description: string) => {
    const localAmt = getLocalAmount(title);
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

  // Scroll the user back to the service grid to build a bundle
  const handleBundleCtaClick = () => {
    if (cartEligibleServices.length >= BUNDLE_MIN_SERVICE_COUNT) {
      handleCartCheckout();
      return;
    }

    servicesGridRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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

  useEffect(() => {
    if (PROMO_SLIDES.length <= 1 || isPromoPaused) return;

    const interval = setInterval(() => {
      setActivePromoSlide((current) => (current + 1) % PROMO_SLIDES.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [isPromoPaused]);

  const goToPromoSlide = (nextIndex: number) => {
    const boundedIndex =
      (nextIndex + PROMO_SLIDES.length) % PROMO_SLIDES.length;
    setActivePromoSlide(boundedIndex);
  };

  const currentPromo = PROMO_SLIDES[activePromoSlide];
  return (
    <section className="py-10 sm:py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-0">
        {/* Section Header */}
        <div className="relative mb-0 flex flex-col items-start justify-center md:mb-12 md:flex-row md:items-center md:pl-12">
          <div className="mb-3 flex items-center gap-2 md:absolute md:left-0 md:top-1/2 md:mb-0 md:-translate-y-1/2">
            <Image
              src="/home/icons8-ai-48.avif"
              alt="JB Recruitment Services Help Icon"
              width={28}
              height={28}
              className="w-6 h-6 md:w-7 md:h-7"
            />
            <span className="text-sm sm:text-base font-semibold text-[#605dba]">
              Our Services
            </span>
          </div>

          <h2 className="text-left text-2xl font-semibold text-[#252e3d] sm:text-3xl md:text-center md:text-4xl">
            How We Can Help
          </h2>
        </div>

        {/*  Info message  */}
        <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between md:-mt-6">
          <p className="text-sm text-gray-600">
            Select multiple services and pay in one go, or click{" "}
            <span className="text-[#5a58ab] font-medium">Buy Now</span> for a
            single service.
          </p>
        </div>

        {/* Grid Layout */}
        <div
          ref={servicesGridRef}
          className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6"
        >
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
                shouldFlip={
                  started && currentFlipIndex === index && !isModalOpen
                }
                onManualFlip={pauseTemporarily}
                onHoverStart={handleHoverStart}
                onHoverEnd={() => handleHoverEnd(index)}
                onBuyClick={() => handleBuyClick(s.title, s.description)}
                isSelected={selectedTitles.has(s.title)}
                onToggleSelect={() => handleToggleSelect(s.title)}
              />
            );
          })}

          {/* Opportunities card  navigates to /opportunities */}
          {(() => {
            const localAmt =
              MULTI_CURRENCY_PRICING[OPPORTUNITIES_SERVICE.title]?.[currency] ??
              39;
            const dynamicPriceBullet = `${currency} ${localAmt.toLocaleString()} | ${OPPORTUNITIES_SERVICE.timeline}`;
            return (
              <ServiceCard
                key={OPPORTUNITIES_SERVICE.id}
                title={OPPORTUNITIES_SERVICE.title}
              amount={39}
                localAmount={localAmt}
                currency={CURRENCY_SYMBOLS[currency]}
                description={OPPORTUNITIES_SERVICE.description}
                iconPath={OPPORTUNITIES_SERVICE.iconPath}
                features={[
                  ...OPPORTUNITIES_SERVICE.features,
                  dynamicPriceBullet,
                ]}
                shouldFlip={false}
                onBuyClick={() => router.push("/mock-interviews/custom")}
                buyLabel="Book Now"
                isSelected={selectedTitles.has(OPPORTUNITIES_SERVICE.title)}
                onToggleSelect={() => handleToggleSelect(OPPORTUNITIES_SERVICE.title)}
              />
            );
          })()}

          {/* Bundle Offer positioned at the bottom of all service cards */}
          <div className="col-span-full">
            <div className="relative isolate h-full overflow-hidden rounded-3xl border border-[#e6eefc] px-4 py-6 text-center shadow-[0_12px_40px_rgba(37,55,77,0.06)] sm:px-6 sm:py-8">
              <div
                className="absolute inset-0 -z-10 bg-linear-to-r from-[#e6eefc]/40 via-[#dfe8fb]/30 to-[#f8fafc]/20 blur-2xl"
                aria-hidden="true"
              />
              <div className="mx-auto flex max-w-2xl flex-col items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-900 shadow-sm animate-pulse">
                  <IoFlash className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Limited Time Offer</span>
                </span>
                <h2 className="text-lg font-bold leading-tight text-[#252e3d] sm:text-2xl text-center">
                  Get 20% off when you choose any 4 or more services!
                </h2>
                <p className="text-sm leading-relaxed text-[#4b5563] text-center">
                  Special Limited Time Offer: Pick the services that fit you best. A generous 20% discount applies
                  automatically at checkout, including the AI Mock Interview.
                </p>
                <span className="text-sm text-[#4b5563]">
                  Select{" "}
                  <span className="font-semibold text-[#5a58ab]">
                    {BUNDLE_MIN_SERVICE_COUNT} or more
                  </span>{" "}
                  eligible services to unlock the offer.
                </span>
                <button
                  onClick={handleBundleCtaClick}
                  className="mt-2 rounded-xl bg-[#5a58ab] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#4a489b] hover:shadow-md active:scale-[0.98] cursor-pointer"
                >
                  {cartEligibleServices.length >= BUNDLE_MIN_SERVICE_COUNT
                    ? "Checkout with discount"
                    : "Build my bundle"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Service spotlight carousel */}
            <div className="mx-auto mt-8 max-w-4xl md:mt-14">
          <section
            onMouseEnter={() => setIsPromoPaused(true)}
            onMouseLeave={() => setIsPromoPaused(false)}
            className="overflow-hidden rounded-[2rem] border border-[#dde6f7] bg-white px-4 py-5 shadow-[0_16px_50px_rgba(37,55,77,0.08)] sm:px-5 sm:py-6 md:px-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f2f0ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#5a58ab]">
                  Service spotlight
                </span>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-[#252e3d] sm:text-2xl md:text-4xl">
                  Everything we offer, in a quick carousel
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b6476]">
                  Tap through to see how each service helps candidates move
                  faster and show up stronger.
                </p>
              </div>
            </div>

            <div className="mt-5 lg:items-stretch">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-[#e5ebf8] bg-linear-to-br from-[#f6f5ff] via-white to-white p-5 sm:p-7 md:p-8">
                {/* Top row: eyebrow + arrows */}
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center rounded-full bg-[#eae8ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5a58ab]">
                    {currentPromo.eyebrow}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => goToPromoSlide(activePromoSlide - 1)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d8def1] bg-white text-[#5a58ab] transition hover:bg-[#f4f6ff]"
                      aria-label="Previous service"
                    >
                      <IoChevronBack className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => goToPromoSlide(activePromoSlide + 1)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d8def1] bg-white text-[#5a58ab] transition hover:bg-[#f4f6ff]"
                      aria-label="Next service"
                    >
                      <IoChevronForward className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Body: content (left) + metrics (right) */}
                <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:gap-10">
                  {/* Content */}
                  <div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#eae8ff] to-white shadow-sm sm:h-[72px] sm:w-[72px]">
                        <Image
                          src={currentPromo.iconPath}
                          alt={`JB Recruitments - ${currentPromo.title}`}
                          width={36}
                          height={36}
                          className="h-8 w-8 object-contain sm:h-9 sm:w-9"
                        />
                      </div>

                      <div className="min-w-0">
                        <h4
                          className="text-2xl font-semibold tracking-tight text-[#252e3d] sm:text-3xl"
                          style={{ fontFamily: "Crimson Text, serif" }}
                        >
                          {currentPromo.title}
                        </h4>
                        <p className="mt-2 text-sm leading-6 text-[#5b6476] sm:text-base">
                          {currentPromo.summary}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col items-start gap-2">
                      {currentPromo.benefit.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#e5ebf8] bg-white px-3 py-1.5 text-xs font-medium text-[#4b5563]"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#5a58ab]" />
                          {item}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        servicesGridRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        })
                      }
                      className="group mt-6 inline-flex items-center gap-2 rounded-full bg-[#5a58ab] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4a489b] hover:shadow-md active:scale-[0.98] cursor-pointer"
                    >
                      {currentPromo.cta}
                      <IoArrowForward className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>

                  {/* Metrics */}
                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    {currentPromo.metrics?.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-2xl border border-[#e5ebf8] bg-white px-4 py-3.5 shadow-sm"
                      >
                        <p className="text-2xl font-bold tracking-tight text-[#5a58ab] sm:text-3xl">
                          {metric.value}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a93a8]">
                          {metric.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination dots */}
                <div className="mt-7 flex items-center justify-center gap-2">
                  {PROMO_SLIDES.map((slide, index) => (
                    <button
                      key={`${slide.title}-${index}`}
                      type="button"
                      onClick={() => setActivePromoSlide(index)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        index === activePromoSlide
                          ? "w-8 bg-[#5a58ab]"
                          : "w-2.5 bg-[#d6ddf0] hover:bg-[#bac6e3]"
                      }`}
                      aria-label={`Go to ${slide.title}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      {/*  Sticky Cart Bar  */}
      {cartServices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 animate-slideUp">
          <div className="mx-auto max-w-2xl bg-[#252e3d] rounded-2xl shadow-[0_-4px_32px_rgba(37,46,61,0.25)] px-5 py-4">
            {/* Bundle banner shown when the 10% discount threshold is reached */}
            {showBundleBanner && (
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 mb-3 bg-[#5a58ab]/20 border border-[#5a58ab]/30 rounded-xl p-3 pr-10">
                <button
                  type="button"
                  onClick={() => {
                    setShowBundleBanner(false);
                    setBundleBannerDismissed(true);
                  }}
                  aria-label="Dismiss bundle offer"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <IoClose className="h-4 w-4" />
                </button>
                <div className="flex items-start gap-3 min-w-0">
                  <IoSparkles className="text-yellow-300 w-5 h-5 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white text-sm font-semibold leading-snug">
                        You’ve unlocked the bundle discount!
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 border border-amber-300">
                        Limited Time Offer
                      </span>
                    </div>
                    <p className="text-white/70 text-xs mt-1">
                      You have {cartEligibleServices.length} eligible services
                      in your cart, so the{" "}
                      <span className="text-yellow-300 font-semibold">
                        {BUNDLE_DISCOUNT_PERCENT}% Limited Time bundle discount
                      </span>{" "}
                      now applies automatically.
                    </p>
                  </div>
                </div>
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
                      —
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
                      {discountedCartTotal.toLocaleString()}
                    </p>
                    {bundleDiscount > 0 && (
                      <p className="text-[10px] text-emerald-300 mt-1 font-medium">
                        Limited Time: 20% bundle discount applied ({CURRENCY_SYMBOLS[currency]}{" "}
                        {bundleDiscount.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{" "}
                        off)
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedTitles(new Set());
                      setShowBundleBanner(false);
                      setBundleBannerDismissed(false);
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
