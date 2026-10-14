"use client";

import React from "react";
import { FaCheck, FaArrowRight, FaStar } from "react-icons/fa";
import ScrollAnimation from "../ui/scroll-animation";
import { useDetectCurrency } from "@/lib/hooks/useDetectCurrency";

interface PricingPackagesProps {
  onOpenInquiry: (pkg?: "3-month" | "6-month" | "general") => void;
}

export default function PricingPackages({ onOpenInquiry }: PricingPackagesProps) {
  const currency = useDetectCurrency();
  const isIndianUser = currency === "INR";

  return (
    <section id="packages-section" className="py-20 sm:py-28 bg-[#f9f9fb] scroll-mt-20 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with exact title from content.txt */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <ScrollAnimation variant="fadeUp">
            <span className="text-[#5a58ab] font-bold text-xs sm:text-sm uppercase tracking-wider">
              Investment Options
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#252E3D] mt-2 tracking-tight">
              Choose Your Personal Branding Package
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mt-3 leading-relaxed">
              Fully managed, done-for-you LinkedIn branding designed to build your authentic authority and grow your visibility.
            </p>
          </ScrollAnimation>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto items-stretch">
          {/* Card 1: 3-Month Package (LinkedIn Brand Launch) */}
          <ScrollAnimation variant="fadeUp" delay={0.1}>
            <div className="h-full rounded-3xl p-7 sm:p-9 bg-white border border-gray-200/90 shadow-lg flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                    Foundation
                  </span>
                  <span className="text-xs font-semibold text-gray-500">3 Months</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#252E3D] mt-4">
                  LinkedIn Brand Launch
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  Build a strong foundation for your personal brand with a clear strategy, professional profile optimisation, consistent content, and managed LinkedIn presence.
                </p>

                {/* Price Display */}
                {currency === null ? (
                  <div className="mt-5 pb-5 border-b border-gray-100 space-y-2.5 animate-pulse">
                    <div className="flex items-baseline gap-2">
                      <div className="h-9 sm:h-10 w-36 bg-gray-200 rounded-lg" />
                      <div className="h-4 w-10 bg-gray-200 rounded" />
                    </div>
                    <div className="h-3 w-28 bg-gray-100 rounded" />
                    <div className="h-6 w-64 bg-gray-100 rounded-lg" />
                  </div>
                ) : (
                  <div className="mt-5 pb-5 border-b border-gray-100 transition-opacity duration-300">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#252E3D]">
                        {isIndianUser ? "₹2,65,000" : "$3,000"}
                      </span>
                      <span className="text-sm font-semibold text-gray-500">
                        {isIndianUser ? "INR" : "USD"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">3 Months Retainer</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700">
                      <span>✓ Eligible for {isIndianUser ? "₹25,000" : "$300"} consultation credit deduction</span>
                    </div>
                  </div>
                )}

                {/* What's Included (Exact items from content.txt) */}
                <div className="mt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                    What&apos;s included:
                  </h4>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-[#5a58ab] text-xs mt-1 flex-shrink-0" />
                      <span>LinkedIn profile optimisation</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-[#5a58ab] text-xs mt-1 flex-shrink-0" />
                      <span>Personal brand strategy and content pillars</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-[#5a58ab] text-xs mt-1 flex-shrink-0" />
                      <span>Done-for-you LinkedIn ghostwriting</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-[#5a58ab] text-xs mt-1 flex-shrink-0" />
                      <span>Content planning, scheduling, and publishing</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-[#5a58ab] text-xs mt-1 flex-shrink-0" />
                      <span>Engagement management</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-[#5a58ab] text-xs mt-1 flex-shrink-0" />
                      <span>Audience growth strategy</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-[#5a58ab] text-xs mt-1 flex-shrink-0" />
                      <span>Monthly performance review and content recommendations</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-[#5a58ab] text-xs mt-1 flex-shrink-0" />
                      <span><strong>Dedicated account manager</strong></span>
                    </li>
                  </ul>
                </div>

                {/* Best For */}
                <div className="mt-6 p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600 leading-relaxed">
                  <strong className="text-gray-900">Best for:</strong> Founders, business owners, and professionals who want to establish their personal brand and build a consistent LinkedIn presence.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => onOpenInquiry("3-month")}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#252E3D] hover:bg-[#1a1f2b] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Select LinkedIn Brand Launch</span>
                  <FaArrowRight className="text-xs" />
                </button>
              </div>
            </div>
          </ScrollAnimation>

          {/* Card 2: 6-Month Package (LinkedIn Brand Authority) */}
          <ScrollAnimation variant="fadeUp" delay={0.2}>
            <div className="h-full rounded-3xl p-8 sm:p-10 bg-white border-2 border-[#5a58ab] shadow-2xl flex flex-col justify-between relative hover:border-[#4d4a99] transition-all duration-300">
              {/* Highlight ribbon */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#5a58ab] to-[#3F78E0] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md whitespace-nowrap">
                <FaStar className="text-yellow-300 text-xs flex-shrink-0" />
                <span className="whitespace-nowrap">Authority Tier · Recommended</span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#5a58ab]/10 text-[#5a58ab]">
                    Authority Tier
                  </span>
                  <span className="text-xs font-semibold text-gray-500">6 Months</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#252E3D] mt-4">
                  LinkedIn Brand Authority
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  Go beyond establishing your presence. Build a recognisable personal brand through a longer-term strategy focused on consistency, authority, and audience development.
                </p>

                {/* Price Display */}
                {currency === null ? (
                  <div className="mt-5 pb-5 border-b border-gray-100 space-y-2.5 animate-pulse">
                    <div className="flex items-baseline gap-2">
                      <div className="h-9 sm:h-10 w-36 bg-gray-200 rounded-lg" />
                      <div className="h-4 w-10 bg-gray-200 rounded" />
                      <div className="h-5 w-24 bg-gray-100 rounded-md" />
                    </div>
                    <div className="h-3 w-28 bg-gray-100 rounded" />
                    <div className="h-6 w-64 bg-gray-100 rounded-lg" />
                  </div>
                ) : (
                  <div className="mt-5 pb-5 border-b border-gray-100 transition-opacity duration-300">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#5a58ab]">
                        {isIndianUser ? "₹4,85,000" : "$5,000"}
                      </span>
                      <span className="text-sm font-semibold text-gray-500">
                        {isIndianUser ? "INR" : "USD"}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 ml-1 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {isIndianUser ? "Save ₹45,000" : "Save $1,000"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">6 Months Retainer</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700">
                      <span>✓ Eligible for {isIndianUser ? "₹25,000" : "$300"} consultation credit deduction</span>
                    </div>
                  </div>
                )}

                {/* What's Included (Exact items from content.txt) */}
                <div className="mt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#5a58ab] mb-3">
                    Everything included in the 3-month package, plus:
                  </h4>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-emerald-600 text-xs mt-1 flex-shrink-0" />
                      <span>
                        <strong className="text-[#252E3D]">Long-Term Brand Development:</strong> Ongoing refinement of your positioning as your personal brand evolves.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-emerald-600 text-xs mt-1 flex-shrink-0" />
                      <span>
                        <strong className="text-[#252E3D]">Continuous Content Optimisation:</strong> Refinement of content themes and approaches based on audience response and performance.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FaCheck className="text-emerald-600 text-xs mt-1 flex-shrink-0" />
                      <span>
                        <strong className="text-[#252E3D]">Audience Growth &amp; Engagement:</strong> Sustained engagement management and audience development to help you expand your reach and build relevant professional connections.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5 text-gray-500 italic text-xs">
                      <FaCheck className="text-gray-400 text-xs mt-0.5 flex-shrink-0" />
                      <span>Includes all deliverables from 3-month package + Dedicated account manager</span>
                    </li>
                  </ul>
                </div>

                {/* Best For */}
                <div className="mt-6 p-3.5 rounded-xl bg-[#5a58ab]/5 border border-[#5a58ab]/20 text-xs text-gray-700 leading-relaxed">
                  <strong className="text-[#5a58ab]">Best for:</strong> Founders, executives, consultants, and business owners who want to invest in long-term visibility and strengthen their professional authority.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => onOpenInquiry("6-month")}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#5a58ab] hover:bg-[#4d4a99] text-white font-bold text-sm transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Select LinkedIn Brand Authority</span>
                  <FaArrowRight className="text-xs" />
                </button>
              </div>
            </div>
          </ScrollAnimation>
        </div>

        {/* Consultation Callout Option */}
        <ScrollAnimation variant="fadeUp" delay={0.25}>
          <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/90 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                <span>100% Deductible</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#252E3D]">
                Prefer to start with a 1-on-1 Strategy Consultation?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
                Book an executive consultation with Juhi Bhatia for{" "}
                {currency === null ? (
                  <span className="inline-block h-4 w-20 bg-gray-200 rounded animate-pulse align-middle" />
                ) : (
                  <strong>{isIndianUser ? "₹25,000 INR" : "$300 USD"}</strong>
                )}
                . If you enroll in the 3 or 6-month plan, your entire consultation fee is decremented directly from your package price.
              </p>
            </div>
            <button
              onClick={() => onOpenInquiry("general")}
              className="flex-shrink-0 py-3.5 px-6 rounded-xl bg-[#252E3D] hover:bg-[#1a1f2b] text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              {currency === null ? (
                <span className="inline-flex items-center gap-2">
                  <span>Book Consultation</span>
                  <span className="inline-block h-3.5 w-12 bg-white/20 rounded animate-pulse" />
                </span>
              ) : (
                <span>Book Consultation ({isIndianUser ? "₹25,000" : "$300"})</span>
              )}
              <FaArrowRight className="text-xs" />
            </button>
          </div>
        </ScrollAnimation>

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
