"use client";

import React from "react";
import {
  HiOutlineBriefcase,
  HiOutlineBuildingOffice2,
  HiOutlineSparkles,
  HiOutlineAcademicCap,
  HiOutlineClock,
} from "react-icons/hi2";
import ScrollAnimation from "../ui/scroll-animation";

const AUDIENCES = [
  {
    icon: HiOutlineBriefcase,
    title: "Founders & Executives",
    description:
      "Increase your visibility, strengthen your social proof, establish thought leadership, and build your personal brand alongside your business, products, or services.",
    tag: "Leadership",
  },
  {
    icon: HiOutlineBuildingOffice2,
    title: "Corporate Professionals",
    description:
      "Start sharing your expertise and building a professional reputation with a thoughtful content strategy that respects your role and workplace boundaries.",
    tag: "Career Growth",
  },
  {
    icon: HiOutlineSparkles,
    title: "Creators, Solopreneurs & Side-Hustlers",
    description:
      "Turn your expertise, ideas, and audience into potential brand partnerships, clients, collaborations, and income opportunities.",
    tag: "Monetization",
  },
  {
    icon: HiOutlineAcademicCap,
    title: "Consultants & Independent Professionals",
    description:
      "Showcase your knowledge, build credibility with your target audience, and strengthen your positioning to attract potential clients.",
    tag: "Inbound Clients",
  },
  {
    icon: HiOutlineClock,
    title: "Busy Professionals",
    description:
      "You understand the value of LinkedIn but struggle to post consistently. Let us manage your personal brand while you focus on your priorities.",
    tag: "Done-for-You",
  },
];

export default function WhoIsThisFor() {
  return (
    <section className="py-20 sm:py-28 bg-[#f9f9fb] border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <ScrollAnimation variant="fadeUp">
            <span className="text-[#5a58ab] font-bold text-xs sm:text-sm uppercase tracking-wider">
              Tailored For Your Goals
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#252E3D] mt-2 tracking-tight">
              Who Is This Service For?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mt-3 leading-relaxed">
              Whether you&apos;re building a business, growing your career, or turning your expertise into new opportunities, we help you build a LinkedIn presence aligned with your goals.
            </p>
          </ScrollAnimation>
        </div>

        {/* Audience Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {AUDIENCES.map((item, index) => {
            const Icon = item.icon;
            return (
              <ScrollAnimation
                key={item.title}
                variant="fadeUp"
                delay={0.08 * index}
              >
                <div className="h-full rounded-2xl p-7 bg-white border border-gray-200/90 shadow-xs hover:shadow-xl hover:border-[#5a58ab]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                  {/* Top glowing accent on hover */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#5a58ab] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5a58ab]/10 to-[#3F78E0]/10 text-[#5a58ab] flex items-center justify-center text-2xl group-hover:bg-[#5a58ab] group-hover:text-white transition-all duration-300 shadow-xs">
                        <Icon />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100/80 text-gray-700 group-hover:bg-[#5a58ab]/10 group-hover:text-[#5a58ab] transition-colors border border-gray-200/50">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-[#252E3D] group-hover:text-[#5a58ab] transition-colors tracking-tight">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-3.5 border-t border-gray-100 flex items-center gap-1.5 text-xs text-[#5a58ab] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Explore your custom roadmap</span>
                    <span>→</span>
                  </div>
                </div>
              </ScrollAnimation>
            );
          })}

          {/* 6th Complementary Anchor Card */}
          <ScrollAnimation variant="fadeUp" delay={0.4}>
            <div className="h-full rounded-2xl p-7 bg-gradient-to-br from-[#1e2430] via-[#252E3D] to-[#1a1f2b] text-white flex flex-col justify-between shadow-lg relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#5a58ab]/20 rounded-full blur-2xl pointer-events-none" />

              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-[#a5a3ff] border border-white/10">
                  <span>✦</span>
                  <span>Personalized Roadmap</span>
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white mt-4 tracking-tight">
                  Every Voice Is Unique
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-gray-300 leading-relaxed">
                  We don&apos;t use cookie-cutter templates. Your content strategy, themes, and tone are tailored specifically to your background and career ambitions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-xs text-[#a5a3ff] font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Fully managed &amp; dedicated account support</span>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
