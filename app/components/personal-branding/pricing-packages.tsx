"use client";

import React from "react";
import { FaCheck, FaArrowRight, FaStar } from "react-icons/fa";
import ScrollAnimation from "../ui/scroll-animation";

interface PricingPackagesProps {
  onOpenInquiry: (pkg: "3-month" | "6-month") => void;
}

export default function PricingPackages({ onOpenInquiry }: PricingPackagesProps) {

  return (
    <section id="packages-section" className="py-20 sm:py-28 bg-[#f9f9fb] scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <ScrollAnimation variant="fadeUp">
            <span className="text-[#5a58ab] font-bold text-xs sm:text-sm uppercase tracking-wider">
              Personal Branding on LinkedIn · Packages
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#252E3D] mt-2 tracking-tight">
              Choose Your Package
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mt-3 leading-relaxed">
              Fully managed, done-for-you LinkedIn branding designed for executives and founders who want authority without the time burden.
            </p>
          </ScrollAnimation>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto items-stretch">
          {/* Card 1: 3-Month Package */}
          <ScrollAnimation variant="fadeUp" delay={0.1}>
            <div className="h-full rounded-3xl p-7 sm:p-9 bg-white border border-gray-200/90 shadow-lg flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                    Foundation Tier
                  </span>
                  <span className="text-xs font-semibold text-gray-500">3-Month Retainer</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#252E3D] mt-4">
                  LinkedIn Brand Launch
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  Establish a clear strategy, authentic voice, and consistent weekly publishing cadence.
                </p>

                {/* Price Display */}
                <div className="mt-5 pb-5 border-b border-gray-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#252E3D]">$3,000</span>
                    <span className="text-sm font-semibold text-gray-500">USD</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Total investment for full 3-month cycle</p>
                </div>

                {/* What's Included */}
                <div className="mt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                    What&apos;s Included:
                  </h4>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-[#5a58ab] text-xs mt-1 flex-shrink-0" />
                      <span><strong className="text-[#252E3D]">Profile Optimization:</strong> Headline, About &amp; keyword positioning</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-[#5a58ab] text-xs mt-1 flex-shrink-0" />
                      <span><strong className="text-[#252E3D]">Brand Strategy:</strong> Target audience &amp; core content pillars</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-[#5a58ab] text-xs mt-1 flex-shrink-0" />
                      <span><strong className="text-[#252E3D]">Ghostwriting:</strong> Authentic, voice-aligned thought leadership</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-[#5a58ab] text-xs mt-1 flex-shrink-0" />
                      <span><strong className="text-[#252E3D]">Publishing &amp; Management:</strong> Editorial calendar &amp; scheduling</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-[#5a58ab] text-xs mt-1 flex-shrink-0" />
                      <span><strong className="text-[#252E3D]">Engagement Management:</strong> Active community conversations &amp; visibility</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-[#5a58ab] text-xs mt-1 flex-shrink-0" />
                      <span><strong className="text-[#252E3D]">Audience Growth:</strong> Targeted professional network expansion</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-[#5a58ab] text-xs mt-1 flex-shrink-0" />
                      <span><strong className="text-[#252E3D]">Monthly Reviews:</strong> Performance analytics &amp; strategy refinement</span>
                    </li>
                  </ul>
                </div>

                {/* Best For */}
                <div className="mt-5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600">
                  <strong className="text-gray-900">Best for:</strong> Establishing a polished presence and consistent cadence.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => onOpenInquiry("3-month")}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#252E3D] hover:bg-[#1a1f2b] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Select 3-Month Launch</span>
                  <FaArrowRight className="text-xs" />
                </button>
              </div>
            </div>
          </ScrollAnimation>

          {/* Card 2: 6-Month Package (Featured) */}
          <ScrollAnimation variant="fadeUp" delay={0.2}>
            <div className="h-full rounded-3xl p-8 sm:p-10 bg-white border-2 border-[#5a58ab] shadow-2xl flex flex-col justify-between relative hover:border-[#4d4a99] transition-all duration-300">
              {/* Highlight ribbon */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#5a58ab] to-[#3F78E0] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <FaStar className="text-yellow-300 text-xs" />
                <span>Authority Tier · Recommended</span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#5a58ab]/10 text-[#5a58ab]">
                    Long-Term Authority
                  </span>
                  <span className="text-xs font-semibold text-gray-500">6-Month Retainer</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#252E3D] mt-4">
                  LinkedIn Brand Authority
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  Scale reach, deepen authority, and develop recognizable industry thought leadership.
                </p>

                {/* Price Display */}
                <div className="mt-5 pb-5 border-b border-gray-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#5a58ab]">$5,000</span>
                    <span className="text-sm font-semibold text-gray-500">USD</span>
                    <span className="text-xs font-bold text-emerald-600 ml-1 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Save $1,000
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Full 6-month managed partnership</p>
                </div>

                {/* What's Included */}
                <div className="mt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#5a58ab] mb-3">
                    Everything in 3-Month Launch, plus:
                  </h4>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-emerald-600 text-xs mt-1 flex-shrink-0" />
                      <span><strong className="text-[#252E3D]">Long-Term Brand Evolution:</strong> Ongoing positioning refinement as presence scales</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-emerald-600 text-xs mt-1 flex-shrink-0" />
                      <span><strong className="text-[#252E3D]">Continuous Optimization:</strong> Data-driven hook, topic &amp; engagement tuning</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-emerald-600 text-xs mt-1 flex-shrink-0" />
                      <span><strong className="text-[#252E3D]">Proactive Network Growth:</strong> Executive outreach &amp; high-value relationship building</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-gray-500 italic text-xs">
                      <FaCheck className="text-gray-400 text-xs mt-0.5 flex-shrink-0" />
                      <span>Includes all 7 core deliverables from Foundation Tier</span>
                    </li>
                  </ul>
                </div>

                {/* Best For */}
                <div className="mt-5 p-3 rounded-xl bg-[#5a58ab]/5 border border-[#5a58ab]/20 text-xs text-gray-700">
                  <strong className="text-[#5a58ab]">Best for:</strong> Leaders committed to category authority and sustained inbound pipeline.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => onOpenInquiry("6-month")}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#5a58ab] hover:bg-[#4d4a99] text-white font-bold text-sm transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Select 6-Month Authority</span>
                  <FaArrowRight className="text-xs" />
                </button>

              </div>
            </div>
          </ScrollAnimation>
        </div>

        {/* Footnote on custom enterprise scopes */}
        <div className="mt-12 text-center text-xs text-gray-500 max-w-xl mx-auto">
          Need custom multi-executive branding for your C-Suite team?{" "}
          <button
            onClick={() => onOpenInquiry("6-month")}
            className="text-[#5a58ab] font-bold underline cursor-pointer"
          >
            Request corporate consultation
          </button>
          .
        </div>
      </div>
    </section>
  );
}
