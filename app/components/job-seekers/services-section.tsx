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
    description: "Detailed review and rewording to make your resume stand out.",
    iconPath: "/icons/job-seekers/resume-review.svg",
  },
  {
    id: 2,
    title: "Cover Letter Writing",
    description: "Custom cover letters tailored to your target roles.",
    iconPath: "/icons/job-seekers/cover-letter.svg",
  },
  {
    id: 3,
    title: "LinkedIn Optimization",
    description: "Profile tweaks to improve visibility and recruiter interest.",
    iconPath: "/icons/job-seekers/linkedin-optimisation.svg",
  },
  {
    id: 4,
    title: "Superstar Shout-Out",
    description: "Highlighting top candidates to our hiring partners.",
    iconPath: "/icons/job-seekers/superstar.svg",
  },
  {
    id: 5,
    title: "Ask Me Anything",
    description: "Quick consults to answer career questions and strategies.",
    iconPath: "/icons/job-seekers/ask-me-anything.svg",
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
          <span className="text-sm font-semibold text-[#605dba]">
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
                className="text-[#374151] text-lg md:text-[19px] leading-relaxed font-medium"
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
              shouldFlip={started && currentFlipIndex === index}
              onManualFlip={handleManualFlip}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
