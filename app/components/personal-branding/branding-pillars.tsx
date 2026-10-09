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
import ScrollAnimation from "../ui/scroll-animation";

const PILLARS = [
  {
    icon: HiOutlineUserCircle,
    title: "LinkedIn Profile Optimisation",
    description:
      "Transform your profile into an executive landing page. We refine your headline, About section, career experience, Boolean recruiter keywords, and overall visual positioning.",
    badge: "Foundation",
  },
  {
    icon: HiOutlineLightBulb,
    title: "Personal Brand Strategy",
    description:
      "Pinpoint your unique professional narrative. We define your distinct positioning, identify your exact target audience, and build tailored content pillars that establish thought leadership.",
    badge: "Strategy",
  },
  {
    icon: HiOutlinePencilSquare,
    title: "LinkedIn Ghostwriting",
    description:
      "You bring the insights; we craft the words. We write compelling, authentic, and professionally formatted posts that reflect your authentic voice, industry knowledge, and philosophy.",
    badge: "Content",
  },
  {
    icon: HiOutlineCalendarDays,
    title: "Content Publishing & Management",
    description:
      "Never worry about when or what to post. We plan an editorial calendar, schedule content at peak algorithm hours, and keep your feed consistently active and engaging.",
    badge: "Management",
  },
  {
    icon: HiOutlineChatBubbleLeftRight,
    title: "Engagement Management",
    description:
      "Personal branding is a two-way conversation. We participate in relevant industry discussions, thoughtful comments, and executive conversations to expand your professional visibility.",
    badge: "Community",
  },
  {
    icon: HiOutlineChartBar,
    title: "Audience Growth & Analytics",
    description:
      "Build a high-caliber network of decision-makers, peers, and prospective partners. We track key performance metrics each month and refine your strategy based on real audience data.",
    badge: "Growth",
  },
];

export default function BrandingPillars() {
  return (
    <section className="py-20 sm:py-28 bg-white border-t border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <ScrollAnimation variant="fadeUp">
            <span className="text-[#5a58ab] font-bold text-xs sm:text-sm uppercase tracking-wider">
              Complete End-to-End Execution
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#252E3D] mt-2 tracking-tight">
              We Manage Your LinkedIn Presence While You Focus on Your Work
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mt-4 leading-relaxed">
              Building a commanding executive brand shouldn’t take 15 hours a week from your schedule.
              Here is how our dedicated team handles every touchpoint.
            </p>
          </ScrollAnimation>
        </div>

        {/* Pillars Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PILLARS.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <ScrollAnimation
                key={pillar.title}
                variant="fadeUp"
                delay={0.1 * index}
              >
                <div className="h-full rounded-2xl p-7 bg-[#fcfcfd] border border-gray-200/90 hover:border-[#5a58ab]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-[#5a58ab]/10 text-[#5a58ab] flex items-center justify-center text-2xl group-hover:bg-[#5a58ab] group-hover:text-white transition-all duration-300">
                        <Icon />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 group-hover:bg-[#5a58ab]/10 group-hover:text-[#5a58ab] transition-colors">
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-[#252E3D] group-hover:text-[#5a58ab] transition-colors">
                      {pillar.title}
                    </h3>

                    <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors flex items-center gap-1.5">
                    <span>100% Handled By JB Team</span>
                  </div>
                </div>
              </ScrollAnimation>
            );
          })}
        </div>
      </div>
    </section>
  );
}
