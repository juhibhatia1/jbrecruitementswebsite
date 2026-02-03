"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import ServiceCard from "./service-card";

const services = [
  {
    id: 1,
    title: "Resume Review & Rewriting",
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
    description:
      "A master cover letter that communicates impact, motivation, and adaptability.",
    iconPath: "/icons/job-seekers/cover-letter.svg",
    features: [
      "Strengths and achievements highlighted",
      "Motivation and role-fit are articulated strategically",
      "Easily customizable version for multiple applications",
      "Professional and persuasive",
      "USD 80 | 5 days",
    ],
  },
  {
    id: 3,
    title: "LinkedIn Optimization",
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
    description: "Targeted LinkedIn announcement to decision-makers",
    iconPath: "/icons/job-seekers/superstar.svg",
    features: [
      "Custom post showcasing your profile, skills & availability",
      "Strategic positioning to attract hiring managers",
      "Increased visibility with employers & key decision-makers",
      "Published via Juhi Bhatia’s LinkedIn for wider reach & credibility. USD 180 | 5 days",
    ],
  },
  {
    id: 5,
    title: "Ask Me Anything",
    description:
      "Direct, practical guidance over email for real-world career challenges and decisions.",
    iconPath: "/icons/job-seekers/ask-me-anything.svg",
    features: [
      "Career changes and transitions",
      "Remote jobs and interviews",
      "Burnout, layoffs, and clarity",
      "Resume or LinkedIn direction",
      "USD 30 | 48 hours",
    ],
  },
];

export default function ServicesSection() {
  const [currentFlipIndex, setCurrentFlipIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [started, setStarted] = useState<boolean>(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // start auto-flip sequence after initial 3s delay
  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), 3000);
    return () => clearTimeout(startTimer);
  }, []);

  // Sequential auto-flip every 6 seconds after `started`
  useEffect(() => {
    if (isPaused || !started) return;

    const interval = setInterval(() => {
      setCurrentFlipIndex((prev) => (prev + 1) % services.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, started]);

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

  useEffect(() => {
    return () => clearResumeTimeout();
  }, [clearResumeTimeout]);

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="relative flex flex-col items-left md:items-center md:flex-row md:items-center justify-center mb-0 md:mb-16 md:pl-12">
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
          {/* 1. Text Block (Top-Left) */}
          <div className="h-full flex items-center">
            <div className="pr-4 lg:pr-8">
              <p className="text-[#374151] text-base md:text-lg lg:text-[19px] leading-relaxed font-medium">
                Beyond core recruitment, we support your hiring process with
                thoughtful coordination, clear communication, and end-to-end
                assistance.
              </p>
            </div>
          </div>

          {/* Service Cards 2-6 */}
          {services.map((s, index) => (
            <ServiceCard
              key={s.id}
              title={s.title}
              description={s.description}
              iconPath={s.iconPath}
              features={s.features}
              shouldFlip={started && currentFlipIndex === index}
              onManualFlip={pauseTemporarily}
              onHoverStart={pauseAutoFlip}
              onHoverEnd={resumeAutoFlip}
            />
          ))}
        </div>

        {/* Bundle Offer Below Cards */}
        <div className="mt-12 flex justify-center">
          <div className="relative isolate inline-flex flex-col items-center gap-3 rounded-3xl border border-[#e6eefc] shadow-lg px-6 sm:px-8 py-6 shadow-[0_12px_40px_rgba(37,55,77,0.06)] text-center">
            <div
              className="absolute inset-0 -z-10 blur-2xl bg-gradient-to-r from-[#e6eefc]/40 via-[#dfe8fb]/30 to-[#f8fafc]/20"
              aria-hidden="true"
            ></div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-[#5a58ab] shadow-sm border border-[#e8e3ff]">
              Limited Bundle
            </span>
            <h2 className="text-lg sm:text-2xl font-bold text-[#252e3d] leading-tight">
              All services bundled together at a special price of USD 400.
            </h2>
            <span className="text-md text-[#4b5563]">
              Highlighting every upgrade in one move.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
