"use client";

import React, { useState, useEffect } from "react";
import ServiceCard from "./service-card";
import { AiOutlineFileText, AiOutlineMail } from "react-icons/ai";
import { FaLinkedin } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { IoMdHome } from "react-icons/io";

const services = [
  {
    id: 1,
    title: "Resume Review & Rewriting",
    description:
      "ATS-optimized resumes aligned with your target roles and recruiter search systems.",
    iconPath: "/icons/job-seekers/resume-review.svg",
    features: [
      "ATS-friendly, role-aligned structure",
      "Keyword-rich, Boolean-ready skills",
      "Clear value-driven positioning",
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
      "Motivation clearly articulated",
      "Easily customizable for roles",
      "USD 80 | 5 days",
    ],
  },
  {
    id: 3,
    title: "LinkedIn Optimization",
    description:
      "Strategic LinkedIn profiles designed to improve recruiter discovery and ranking.",
    iconPath: "/icons/job-seekers/linkedin-optimisation.svg",
    features: [
      "ATS-style keyword optimization",
      "Skills-based profile structuring",
      "Recruiter and Boolean visibility",
      "USD 80 | 5 days",
    ],
  },
  {
    id: 4,
    title: "Superstar Shout-Out",
    description:
      "A targeted LinkedIn announcement amplifying your availability to decision-makers.",
    iconPath: "/icons/job-seekers/superstar.svg",
    features: [
      "Tailored recruiter-focused LinkedIn post",
      "Skills and availability highlighted",
      "Expanded employer visibility",
      "USD 180 | 5 days",
    ],
  },
  {
    id: 5,
    title: "Ask Me Anything",
    description:
      "Direct, practical guidance for real-world career challenges and decisions.",
    iconPath: "/icons/job-seekers/ask-me-anything.svg",
    features: [
      "Career changes and transitions",
      "Remote jobs and interviews",
      "Burnout, layoffs, clarity",
      "USD 30 | 48 hours",
    ],
  },
];

export default function ServicesSection() {
  const [currentFlipIndex, setCurrentFlipIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [started, setStarted] = useState<boolean>(false);

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

  const handleManualFlip = () => {
    setIsPaused(true);
    setCurrentFlipIndex(-1); // Reset auto-flip index to close any open cards immediately
    // Resume after 5 seconds
    setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  };

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-8 flex items-center gap-2">
          <img
            src="/home/icons8-ai-48.png"
            alt="Help Icon"
            className="w-6 h-6 md:w-7 md:h-7"
          />
          <span className="text-sm sm:text-base font-semibold text-[#605dba]">
            Our Services
          </span>
        </div>

        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-semibold text-[#252e3d] mb-12 md:mb-16">
          How We Can Help
        </h2>

        {/* Grid Layout matching why-companies-prefer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 1. Text Block (Top-Left) */}
          <div className="h-full flex items-center">
            <div className="pr-4 lg:pr-8">
              <p
                className="text-[#374151] text-base md:text-lg lg:text-[19px] leading-relaxed font-medium"
                style={{ fontFamily: "Palatino Linotype, serif" }}
              >
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
              onManualFlip={handleManualFlip}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
