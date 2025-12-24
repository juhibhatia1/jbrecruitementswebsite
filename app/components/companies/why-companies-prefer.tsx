"use client";

import { BsSpeedometer2, BsChatTextFill, BsBullseye, BsHeartFill } from "react-icons/bs";
import { FaHandshake } from "react-icons/fa";
import ScrollAnimation from "../ui/scroll-animation";

export default function WhyCompaniesPrefer() {
  const cards = [
    {
      icon: <FaHandshake size={24} className="text-white" />,
      text: "You gain a hiring partner, not just a CV provider."
    },
    {
      icon: <BsSpeedometer2 size={24} className="text-white" />,
      text: "Our process reduces time-to-hire and increases retention."
    },
    {
      icon: <BsChatTextFill size={24} className="text-white" />,
      text: "You receive timely updates and transparent communication."
    },
    {
      icon: <BsBullseye size={24} className="text-white" />,
      text: "We present only the most promising profiles, saving you hours of screening."
    },
    {
      icon: <BsHeartFill size={24} className="text-white" />,
      text: "You work with a team that genuinely cares about making great matches."
    }
  ];

  return (
    <section className="w-full bg-[#FAFAFC] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <ScrollAnimation variant="fadeUp">
          <div className="text-center mb-16">
            <h2 className="text-[#252e3d] text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: 'Geist, sans-serif' }}>
              Why Companies Prefer JB?
            </h2>
          </div>
        </ScrollAnimation>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* 1. Text Block (Top-Left) */}
          <ScrollAnimation variant="fadeUp" className="h-full flex items-center">
            <div className="pr-4 lg:pr-8">
              <p className="text-[#374151] text-lg md:text-[19px] leading-relaxed font-medium" style={{ fontFamily: 'Palatino Linotype, serif' }}>
                You get candidates who fit the role, fit the team, and move your organisation forward. We take pride in being a recruitment partner that feels like an extension of your internal HR
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
                <div className="mb-6 w-14 h-14 bg-gradient-to-br from-[#7c78d6] to-[#605dba] rounded-xl flex items-center justify-center shadow-sm">
                  {card.icon}
                </div>
                <p className="text-[#374151] text-base md:text-lg leading-relaxed font-medium font-serif" style={{ fontFamily: 'Palatino Linotype, serif' }}>
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
