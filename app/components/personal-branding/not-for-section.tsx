"use client";

import React from "react";
import {
  HiOutlineXCircle,
  HiOutlineArrowTrendingDown,
  HiOutlineSparkles,
  HiOutlineBolt,
  HiOutlineBriefcase,
} from "react-icons/hi2";
import ScrollAnimation from "../ui/scroll-animation";

const NOT_FOR_ITEMS = [
  {
    icon: HiOutlineArrowTrendingDown,
    title: "Those seeking overnight growth",
    description: "Building an authentic audience takes time, consistency, and patience.",
  },
  {
    icon: HiOutlineSparkles,
    title: "Those chasing virality",
    description: "We focus on meaningful visibility, not viral tricks or guaranteed reach.",
  },
  {
    icon: HiOutlineBolt,
    title: "Those expecting instant income",
    description: "Monetization grows from trust, credibility, and the right opportunities—not shortcuts.",
  },
  {
    icon: HiOutlineXCircle,
    title: "Those looking for algorithm hacks",
    description: "We focus on sustainable content and engagement strategies, not temporary tricks.",
  },
  {
    icon: HiOutlineBriefcase,
    title: "Those needing immediate job offers",
    description: "Personal branding can support your career, but it isn't a replacement for an urgent job search.",
  },
];

export default function NotForSection() {
  return (
    <section className="py-20 sm:py-28 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <ScrollAnimation variant="fadeUp">
            <span className="text-rose-600 font-bold text-xs sm:text-sm uppercase tracking-wider">
              Setting Honest Expectations
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#252E3D] mt-2 tracking-tight">
              Who This Service Is NOT For
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mt-3 leading-relaxed">
              We protect your reputation with real thought leadership. Here is who will not benefit from our approach.
            </p>
          </ScrollAnimation>
        </div>

        {/* 5 Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {NOT_FOR_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <ScrollAnimation
                key={item.title}
                variant="fadeUp"
                delay={0.07 * index}
              >
                <div className="h-full rounded-2xl p-7 bg-white border border-rose-100/80 hover:border-rose-300 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div>
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform">
                      <Icon />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#252E3D] group-hover:text-rose-700 transition-colors mb-2 tracking-tight">
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

          {/* Highlight Anchor Box */}
          <ScrollAnimation variant="fadeUp" delay={0.4}>
            <div className="h-full rounded-2xl p-8 bg-gradient-to-br from-[#161a24] via-[#212735] to-[#161a24] text-white flex flex-col justify-center shadow-xl border border-white/10 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#5a58ab]/20 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#a5a3ff] px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 mb-3">
                  <span>✦ Our Commitment</span>
                </span>
                <p className="text-base sm:text-lg font-bold text-white leading-relaxed italic">
                  &ldquo;Our approach is simple: build genuine influence, earn trust, and create opportunities over time.&rdquo;
                </p>
                <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Quality &amp; long-term credibility first.</span>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
