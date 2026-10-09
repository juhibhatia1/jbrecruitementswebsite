"use client";

import React from "react";
import Image from "next/image";
import {
  HiOutlineCheckBadge,
  HiOutlineEye,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineCurrencyDollar,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import { FaArrowRight } from "react-icons/fa";
import ScrollAnimation from "../ui/scroll-animation";
import { useLinkedInFollowers } from "@/lib/hooks/useLinkedInFollowers";

interface OutcomesSectionProps {
  onOpenInquiry: (pkg?: "3-month" | "6-month" | "general") => void;
}

const OUTCOMES = [
  {
    icon: HiOutlineCheckBadge,
    title: "Credibility & Recognition",
    description:
      "Position yourself as the go-to authority in your domain so leaders and partners recognize your track record immediately.",
  },
  {
    icon: HiOutlineEye,
    title: "Executive Visibility",
    description:
      "Put your perspectives in front of relevant industry decision-makers, investors, and prospective clients.",
  },
  {
    icon: HiOutlineUserGroup,
    title: "High-Trust Network",
    description:
      "Expand beyond second-degree connections into an active ecosystem of executives, founders, and industry peers.",
  },
  {
    icon: HiOutlineBriefcase,
    title: "Inbound Opportunities",
    description:
      "Turn your profile into an inbound magnet for client inquiries, collaborations, speaking invites, and career growth.",
  },
  {
    icon: HiOutlineCurrencyDollar,
    title: "Brand Monetization",
    description:
      "Unlock new revenue streams through consulting, advisory engagements, brand partnerships, and strategic ventures.",
  },
];

export default function OutcomesSection({ onOpenInquiry }: OutcomesSectionProps) {
  const { formatted: followerCount, isLive } = useLinkedInFollowers();

  const scrollToPackages = () => {
    const el = document.getElementById("packages-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 sm:py-28 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <ScrollAnimation variant="fadeUp">
            <span className="text-[#5a58ab] font-bold text-xs sm:text-sm uppercase tracking-wider">
              Strategic Impact
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#252E3D] mt-2 tracking-tight">
              What Can Personal Branding Help You Achieve?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mt-3 leading-relaxed">
              When executive expertise meets consistent, strategic distribution, tangible career and business results follow.
            </p>
          </ScrollAnimation>
        </div>

        {/* Outcomes Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {OUTCOMES.map((item, index) => {
            const Icon = item.icon;
            return (
              <ScrollAnimation
                key={item.title}
                variant="fadeUp"
                delay={0.06 * index}
              >
                <div className="h-full rounded-2xl p-6 sm:p-7 bg-[#fafafc] border border-gray-200/80 hover:border-[#5a58ab]/40 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-[#5a58ab]/10 text-[#5a58ab] flex items-center justify-center text-xl mb-4">
                      <Icon />
                    </div>
                    <h3 className="text-lg font-bold text-[#252E3D] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </ScrollAnimation>
            );
          })}

          {/* 6th Card: Transparent Disclaimer */}
          <ScrollAnimation variant="fadeUp" delay={0.3}>
            <div className="h-full rounded-2xl p-6 sm:p-7 bg-amber-50/50 border border-amber-200/70 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-amber-800 text-sm font-bold mb-2">
                <HiOutlineInformationCircle className="text-lg flex-shrink-0" />
                <span>Transparent Expectation</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-900/85 leading-relaxed italic">
                &ldquo;Results vary; specific follower counts, leads, or revenue cannot be guaranteed.&rdquo;
              </p>
              <p className="text-xs text-amber-800/70 mt-2 leading-relaxed">
                We prioritize authentic, long-term influence over short-lived vanity metrics.
              </p>
            </div>
          </ScrollAnimation>
        </div>

        {/* Closing Narrative Banner: "Build Your Brand With Us" */}
        <ScrollAnimation variant="fadeUp" delay={0.2}>
          <div className="mt-16 sm:mt-20 rounded-3xl bg-gradient-to-br from-[#1a1f2b] to-[#252e3d] p-8 sm:p-12 lg:p-14 text-white relative overflow-hidden shadow-2xl">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#5a58ab]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#a5a3ff]">
                  <span>Founder&apos;s Promise</span>
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                  Build Your Brand With Us
                </h3>

                <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
                  &ldquo;I grew my LinkedIn following to over {followerCount} organically by sharing real industry insights. Through JB, my team and I help you build that same recognized presence without managing every detail yourself.&rdquo;
                </p>

                <p className="text-base sm:text-lg font-semibold text-white italic border-l-2 border-[#5a58ab] pl-3">
                  &ldquo;You bring the expertise. We build your visibility and influence.&rdquo;
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <button
                    onClick={scrollToPackages}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#5a58ab] hover:bg-[#4d4a99] text-white text-sm sm:text-base font-bold transition-all shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    <span>Choose Your Package &amp; Let&apos;s Get Started</span>
                    <FaArrowRight className="text-xs" />
                  </button>

                  <button
                    onClick={() => onOpenInquiry("general")}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm sm:text-base font-semibold transition-all border border-white/20 cursor-pointer"
                  >
                    <span>Request Consultation</span>
                  </button>
                </div>
              </div>

              {/* Founder Avatar & Signature */}
              <div className="lg:col-span-4 flex flex-col items-center sm:items-start lg:items-center text-center sm:text-left lg:text-center">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white/20 shadow-xl mb-3">
                  <Image
                    src="/founder.avif"
                    alt="Juhi Bhatia - Founder & CEO"
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <div className="font-bold text-lg text-white">Juhi Bhatia</div>
                <div className="text-xs text-gray-400">Founder &amp; CEO | JB</div>
                <div className="inline-flex items-center gap-1.5 text-xs text-[#a5a3ff] font-semibold mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{followerCount} Live LinkedIn Followers</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
