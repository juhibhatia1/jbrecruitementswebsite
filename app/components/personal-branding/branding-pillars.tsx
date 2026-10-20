"use client";

import React from "react";
import {
  HiOutlineUserCircle,
  HiOutlineLightBulb,
  HiOutlinePencilSquare,
  HiOutlineCalendarDays,
  HiOutlineChatBubbleLeftRight,
  HiOutlineChartBar,
} from "react-icons/hi2";
import { FaUserTie } from "react-icons/fa";
import ScrollAnimation from "../ui/scroll-animation";

const PILLARS = [
  {
    number: "01",
    icon: HiOutlineUserCircle,
    title: "1. LinkedIn Profile Optimisation",
    description:
      "We optimise your headline, About section, experience, relevant keywords, and professional positioning to communicate your value clearly and strengthen your profile's discoverability.",
    badge: "Foundation",
  },
  {
    number: "02",
    icon: HiOutlineLightBulb,
    title: "2. Personal Brand Strategy",
    description:
      "We understand your goals, expertise, audience, and professional story to develop a strategy that reflects who you are and what you want to be known for.",
    badge: "Strategy",
  },
  {
    number: "03",
    icon: HiOutlinePencilSquare,
    title: "3. Done-for-You Content & Ghostwriting",
    description:
      "We turn your experiences, ideas, industry insights, and professional knowledge into compelling LinkedIn posts written in your voice. Your content reflects your personality and expertise-not generic, copied content.",
    badge: "Voice & Creation",
  },
  {
    number: "04",
    icon: HiOutlineCalendarDays,
    title: "4. Content Planning & Publishing",
    description:
      "We plan, schedule, and publish your content to help you maintain a consistent presence without managing the process yourself.",
    badge: "Consistency",
  },
  {
    number: "05",
    icon: HiOutlineChatBubbleLeftRight,
    title: "5. Engagement Management",
    description:
      "We help you participate in relevant professional conversations and engage with industry discussions to support your visibility and encourage meaningful interactions.",
    badge: "Community",
  },
  {
    number: "06",
    icon: HiOutlineChartBar,
    title: "6. Audience Growth & Performance Tracking",
    description:
      "We work towards growing a relevant audience and review available LinkedIn analytics, including impressions, engagement, profile views, and follower growth, to refine your content strategy over time.",
    badge: "Growth & Analytics",
  },
];

export default function BrandingPillars() {
  return (
    <section className="py-20 sm:py-28 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with exact title from content.txt */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <ScrollAnimation variant="fadeUp">
            <span className="text-[#5a58ab] font-bold text-xs sm:text-sm uppercase tracking-wider">
              Full-Service Deliverables
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#252E3D] mt-2 tracking-tight">
              What&apos;s Included in Our LinkedIn Personal Branding Service?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mt-3 leading-relaxed">
              From foundational strategy to weekly publishing and community engagement, our team manages every detail end-to-end.
            </p>
          </ScrollAnimation>
        </div>

        {/* Pillars Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {PILLARS.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <ScrollAnimation
                key={pillar.title}
                variant="fadeUp"
                delay={0.08 * index}
              >
                <div className="h-full rounded-2xl p-7 bg-white border border-gray-200/90 hover:border-[#5a58ab]/40 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                  {/* Subtle top indicator */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#5a58ab] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5a58ab]/10 to-[#3F78E0]/10 text-[#5a58ab] flex items-center justify-center text-2xl group-hover:bg-[#5a58ab] group-hover:text-white transition-all duration-300 shadow-xs">
                        <Icon />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-gray-300 group-hover:text-[#5a58ab] transition-colors">
                          {pillar.number}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100/80 text-gray-700 group-hover:bg-[#5a58ab]/10 group-hover:text-[#5a58ab] transition-colors border border-gray-200/50">
                          {pillar.badge}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-[#252E3D] group-hover:text-[#5a58ab] transition-colors tracking-tight">
                      {pillar.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 mt-3 leading-relaxed font-normal">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </ScrollAnimation>
            );
          })}
        </div>

        {/* Dedicated Account Manager Callout from content.txt */}
        <ScrollAnimation variant="fadeUp" delay={0.3}>
          <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#f7f7fc] via-[#f2f1fa] to-[#fbfbfe] border border-[#e2e1fa] shadow-sm flex flex-col sm:flex-row items-center gap-5 sm:gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-b from-[#5a58ab] to-[#3F78E0]" />
            <div className="w-14 h-14 rounded-2xl bg-[#5a58ab] text-white flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-[#5a58ab]/20">
              <FaUserTie />
            </div>
            <div className="text-sm sm:text-base text-gray-800 leading-relaxed">
              <span className="text-[#252E3D] font-extrabold text-base sm:text-lg block mb-1">
                Your dedicated account manager will work closely with you
              </span>
              to understand your goals, capture your voice, coordinate content, and keep your personal brand moving forward.
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
