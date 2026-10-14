"use client";

import React from "react";
import {
  HiOutlineInboxArrowDown,
  HiOutlineShieldCheck,
  HiOutlineCurrencyDollar,
  HiOutlineSparkles,
  HiOutlineBookOpen,
  HiOutlineUserGroup,
  HiOutlineTrophy,
} from "react-icons/hi2";
import ScrollAnimation from "../ui/scroll-animation";

const EXPECTATIONS = [
  {
    icon: HiOutlineInboxArrowDown,
    title: "Get Inbound, Not Ignored",
    description: "Help the right people discover you, your expertise, and your services.",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "Be Trusted Before You Speak",
    description: "Establish credibility through consistent content that showcases your knowledge, experience, and perspective.",
  },
  {
    icon: HiOutlineCurrencyDollar,
    title: "Turn Content Into Revenue Opportunities",
    description: "Build a foundation for potential client enquiries, brand partnerships, collaborations, and other monetization opportunities.",
  },
  {
    icon: HiOutlineSparkles,
    title: "Become the Obvious Choice",
    description: "Strengthen your positioning so your target audience understands what makes you different and why you matter.",
  },
  {
    icon: HiOutlineBookOpen,
    title: "Turn Your Story Into a Compelling Narrative",
    description: "Communicate your journey, expertise, and value in a way that resonates with the people you want to reach.",
  },
  {
    icon: HiOutlineUserGroup,
    title: "Attract the Right Decision-Makers",
    description: "Create strategic content designed to connect with potential clients, business leaders, collaborators, and industry professionals.",
  },
  {
    icon: HiOutlineTrophy,
    title: "Build Influence That Lasts",
    description: "Develop a recognisable personal brand through consistent visibility, authentic storytelling, and meaningful engagement.",
  },
];

export default function OutcomesSection() {
  return (
    <section className="py-20 sm:py-28 bg-[#f9f9fb] border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Title with exact words from content.txt */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <ScrollAnimation variant="fadeUp">
            <span className="text-[#5a58ab] font-bold text-xs sm:text-sm uppercase tracking-wider">
              Tangible Results &amp; Reputation
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#252E3D] mt-2 tracking-tight">
              What Can You Expect From This Service?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mt-3 leading-relaxed">
              We&apos;re not here to help you post just for the sake of posting. We&apos;re here to help you build a personal brand that communicates your value, earns trust, and creates opportunities.
            </p>
          </ScrollAnimation>
        </div>

        {/* Expectations Grid (7 items from content.txt) */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {EXPECTATIONS.map((item, index) => {
            const Icon = item.icon;
            const stepNum = String(index + 1).padStart(2, "0");
            return (
              <ScrollAnimation
                key={item.title}
                variant="fadeUp"
                delay={0.06 * index}
              >
                <div className="h-full rounded-2xl p-7 bg-white border border-gray-200/90 shadow-xs hover:shadow-xl hover:border-[#5a58ab]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                  {/* Subtle top indicator */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#5a58ab] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5a58ab]/10 to-[#3F78E0]/10 text-[#5a58ab] flex items-center justify-center text-2xl group-hover:bg-[#5a58ab] group-hover:text-white transition-all duration-300 shadow-xs">
                        <Icon />
                      </div>
                      <span className="font-mono text-xs font-extrabold text-gray-300 group-hover:text-[#5a58ab] transition-colors">
                        {stepNum}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#252E3D] group-hover:text-[#5a58ab] transition-colors tracking-tight mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>
              </ScrollAnimation>
            );
          })}

          {/* Philosophy Banner directly from content.txt:
              "You Don't Chase Attention. You Build a Brand That Earns It." */}
          <ScrollAnimation variant="fadeUp" delay={0.3} className="md:col-span-2 lg:col-span-2">
            <div className="h-full rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#161a24] via-[#212735] to-[#161a24] text-white flex flex-col justify-center shadow-2xl relative overflow-hidden border border-[#5a58ab]/30 group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#5a58ab]/25 via-[#3F78E0]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#5a58ab]/15 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#a5a3ff] text-xs font-semibold mb-4">
                  <span>✦ Core Philosophy</span>
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  You Don&apos;t Chase Attention. You Build a Brand That Earns It.
                </h3>
                <p className="mt-4 text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl font-normal">
                  Our goal is to help you move beyond simply having a LinkedIn profile to building a professional presence that supports your reputation, business, and long-term ambitions.
                </p>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
