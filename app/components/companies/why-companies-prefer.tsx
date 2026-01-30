"use client";

import {
  BsSpeedometer2,
  BsChatTextFill,
  BsBullseye,
  BsHeartFill,
} from "react-icons/bs";
import ScrollAnimation from "../ui/scroll-animation";
import Image from "next/image";

export default function WhyCompaniesPrefer() {
  const cards = [
    {
      iconPath: "/icons/companies/partner.svg",
      text: "You gain a hiring partner, not just a CV provider.",
    },
    {
      iconPath: "/icons/companies/speedometer.svg",
      text: "Our process reduces time-to-hire and increases retention.",
    },
    {
      iconPath: "/icons/companies/chat-text-fill.svg",
      text: "You receive timely updates and transparent communication.",
    },
    {
      iconPath: "/icons/companies/bullseye.svg",
      text: "We present only the most promising profiles, saving you hours of screening.",
    },
    {
      iconPath: "/icons/companies/heart-fill.svg",
      text: "You work with a team that genuinely cares about making great matches.",
    },
  ];

  return (
    <section className="w-full bg-[#FAFAFC] py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <ScrollAnimation variant="fadeUp">
          <div className="text-center mb-12 md:mb-16">
            <h2
              className="text-[#252e3d] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
              style={{ fontFamily: "Geist, sans-serif" }}
            >
              Why Companies Prefer JB?
            </h2>
          </div>
        </ScrollAnimation>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 1. Text Block (Top-Left) */}
          <ScrollAnimation
            variant="fadeUp"
            className="h-full flex items-center"
          >
            <div className="pr-4 lg:pr-8">
              <p
                className="text-[#374151] text-base md:text-lg lg:text-[19px] leading-relaxed font-medium"
                style={{ fontFamily: "Palatino Linotype, serif" }}
              >
                You get candidates who fit the role, fit the team, and move your
                organisation forward. We take pride in being a recruitment
                partner that feels like an extension of your internal HR
              </p>
            </div>
          </ScrollAnimation>

          {/* Cards 2-6 */}
          {cards.map((card, index) => (
            <ScrollAnimation
              key={index}
              variant="fadeUp"
              delay={0.1 * (index + 1)}
              className="h-full"
            >
              <div className="bg-white rounded-xl p-8 h-full min-h-[220px] flex flex-col items-center justify-center text-center shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-50 hover:shadow-md transition-shadow duration-300">
                <Image
                  src={card.iconPath}
                  width={50}
                  height={50}
                  alt="icon"
                  className="mb-4"
                />
                <p
                  className="text-[#374151] text-base sm:text-base md:text-lg leading-relaxed font-medium font-serif"
                  style={{ fontFamily: "Palatino Linotype, serif" }}
                >
                  {card.text}
                </p>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}
