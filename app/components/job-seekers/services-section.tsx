"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import ServiceCard from "./service-card";
import PaymentModal from "./payment-modal";

const services = [
  {
    id: 1,
    title: "Resume Review & Rewriting",
    amount: 80,
    description:
      "ATS-optimised resumes aligned with your target roles and recruiter search systems.",
    iconPath: "/icons/job-seekers/resume-review.svg",
    features: [
      "ATS-compliant, keyword-optimized resumes",
      "Strategic skills keywords for Boolean search visibility",
      "Strong achievement-focused bullet points",
      "Clear professional positioning and value proposition",
      "USD 80 | 5 days",
    ],
  },
  {
    id: 2,
    title: "Cover Letter Writing",
    amount: 50,
    description:
      "A master cover letter that communicates impact, motivation, and adaptability.",
    iconPath: "/icons/job-seekers/cover-letter.svg",
    features: [
      "Strengths and achievements highlighted",
      "Motivation and role-fit are articulated strategically",
      "Easily customizable version for multiple applications",
      "Professional and persuasive",
      "USD 50 | 5 days",
    ],
  },
  {
    id: 3,
    title: "LinkedIn Optimization",
    amount: 80,
    description:
      "Strategic LinkedIn profiles designed to improve recruiter discovery and search ranking.",
    iconPath: "/icons/job-seekers/linkedin-optimisation.svg",
    features: [
      "Keywords optimized content",
      "Skills-based profile structuring",
      "LinkedIn banner optimisation for stronger personal branding",
      "USD 80 | 5 days",
    ],
  },
  {
    id: 4,
    title: "Superstar Shout-Out",
    amount: 160,
    description: "Targeted LinkedIn announcement to decision-makers",
    iconPath: "/icons/job-seekers/superstar.svg",
    features: [
      "Custom post showcasing your profile, skills & availability",
      "Strategic positioning to attract hiring managers",
      "Increased visibility with employers & key decision-makers",
      "Published via Juhi Bhatia’s LinkedIn for wider reach & credibility. USD 160 | 5 days",
    ],
  },
  {
    id: 5,
    title: "Ask Me Anything",
    amount: 40,
    description:
      "Direct, practical guidance over email for real-world career challenges and decisions.",
    iconPath: "/icons/job-seekers/ask-me-anything.svg",
    features: [
      "Career changes and transitions",
      "Remote jobs and interviews",
      "Burnout, layoffs, and clarity",
      "Resume or LinkedIn direction",
      "USD 40 | 48 hours",
    ],
  },
  {
    id: 6,
    title: "Interview Prep",
    amount: 100,
    description:
      "Direct, practical support to help you crack your interviews with confidence.",
    iconPath: "/icons/job-seekers/interview-prep.svg",
    features: [
      "Profile and role review",
      "Top 10 likely interview questions",
      "Structured answers using the STAR method",
      "Delivered via email",
      "USD 100",
    ],
  },
];

export default function ServicesSection() {
  const [currentFlipIndex, setCurrentFlipIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [started, setStarted] = useState<boolean>(false);
  
  // Payment Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<{
    title: string;
    amount: number;
    description: string;
  } | null>(null);

  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const pauseAutoFlip = useCallback(() => {
    clearResumeTimeout();
    setIsPaused(true);
  }, [clearResumeTimeout]);

  const resumeAutoFlip = useCallback(() => {
    clearResumeTimeout();
    setIsPaused(false);
  }, [clearResumeTimeout]);

  const pauseTemporarily = useCallback(() => {
    pauseAutoFlip();
    setCurrentFlipIndex(-1); // Close any open cards immediately
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  }, [pauseAutoFlip]);

  const handleBuyClick = (title: string, amount: number, description: string) => {
    // For the bundle offer click, trigger CLICK_BUY telemetry
    if (title === "All Career Services Bundle") {
      fetch("/api/analytics/funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceName: title, eventType: "CLICK_BUY" }),
      }).catch((e) => console.error("Telemetry failed:", e));
    }
    setSelectedService({ title, amount, description });
    setIsModalOpen(true);
  };

  // Log bundle view on mount
  useEffect(() => {
    fetch("/api/analytics/funnel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceName: "All Career Services Bundle", eventType: "VIEW" }),
    }).catch((e) => console.error("Telemetry failed:", e));
  }, []);

  useEffect(() => {
    return () => clearResumeTimeout();
  }, [clearResumeTimeout]);

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="relative flex flex-col items-left md:flex-row md:items-center justify-center mb-0 md:mb-16 md:pl-12">
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

        {/* Grid Layout matching why-companies-prefer */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Service Cards 1-6 */}
          {services.map((s, index) => (
            <ServiceCard
              key={s.id}
              title={s.title}
              description={s.description}
              iconPath={s.iconPath}
              features={s.features}
              shouldFlip={started && currentFlipIndex === index && !isModalOpen}
              onManualFlip={pauseTemporarily}
              onHoverStart={pauseAutoFlip}
              onHoverEnd={resumeAutoFlip}
              onBuyClick={() => handleBuyClick(s.title, s.amount, s.description)}
            />
          ))}
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
              All services bundled together at a special price of USD 480.
            </h2>
            <span className="text-sm sm:text-md text-[#4b5563]">
              Highlighting every upgrade in one move.
            </span>
            <button
              onClick={() =>
                handleBuyClick(
                  "All Career Services Bundle",
                  480,
                  "Comprehensive pack including Resume rewrite, Cover letter rewrite, LinkedIn Optimization, Superstar Shout-out, Ask Me Anything session, and Interview Prep."
                )
              }
              className="mt-2 bg-[#5a58ab] hover:bg-[#4a489b] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm cursor-pointer hover:shadow-md active:scale-[0.98]"
            >
              Get Bundle Offer
            </button>
          </div>
        </div>
      </div>

      {/* Stripe Payment Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={selectedService}
      />
    </section>
  );
}
