"use client";

import React from "react";
import Image from "next/image";
import { FaLinkedin, FaArrowRight, FaShieldAlt } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";
import ScrollAnimation from "../ui/scroll-animation";
import { useLinkedInFollowers } from "@/lib/hooks/useLinkedInFollowers";

interface BrandingHeroProps {
  onOpenInquiry: (pkg?: "3-month" | "6-month" | "general") => void;
}

export default function BrandingHero({ onOpenInquiry }: BrandingHeroProps) {
  const { formatted: followerCount, isLive } = useLinkedInFollowers();

  const scrollToPackages = () => {
    const el = document.getElementById("packages-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 bg-gradient-to-b from-[#f9f9fb] via-white to-[#fbfbfe]">
      {/* Background Decorative Glow Elements */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[720px] h-[400px] bg-gradient-to-tr from-[#5a58ab]/12 via-[#3F78E0]/8 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-48 right-10 w-[380px] h-[380px] bg-[#605dba]/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <ScrollAnimation variant="fadeUp">
              {/* Top pill badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5a58ab]/10 border border-[#5a58ab]/20 text-[#5a58ab] text-xs sm:text-sm font-semibold tracking-wide shadow-xs">
                <HiOutlineSparkles className="text-base text-[#5a58ab] animate-pulse" />
                <span>Personal Branding on LinkedIn · Fully Managed Service</span>
              </div>
            </ScrollAnimation>

            <ScrollAnimation variant="fadeUp" delay={0.1}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#252E3D] leading-[1.12] tracking-tight">
                Personal Branding on LinkedIn
              </h1>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-[#5a58ab] tracking-tight">
                Build Your Influence, Grow Your Visibility
              </p>
            </ScrollAnimation>

            <ScrollAnimation variant="fadeUp" delay={0.2}>
              <p className="text-lg sm:text-xl font-medium text-[#252E3D] leading-snug max-w-2xl">
                Your expertise deserves to be seen. We manage your LinkedIn end-to-end so you build authority and win inbound opportunities—without the time burden.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm sm:text-base text-gray-700 max-w-2xl">
                <span>Led by <strong>Juhi Bhatia</strong> (13 yrs in recruitment &amp;</span>
                <span className="font-bold text-[#252E3D] inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200/80">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{followerCount} Live Followers</span>
                </span>
                <span>), our team handles strategy, ghostwriting, publishing, and growth for you.</span>
              </div>
            </ScrollAnimation>

            {/* CTAs */}
            <ScrollAnimation variant="fadeUp" delay={0.3}>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={scrollToPackages}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#5a58ab] hover:bg-[#4d4a99] text-white text-sm sm:text-base font-bold transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Choose Your Package</span>
                  <FaArrowRight className="text-xs" />
                </button>

                <button
                  onClick={() => onOpenInquiry("general")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-[#252E3D] border border-gray-300 text-sm sm:text-base font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer"
                >
                  <span>Request Consultation</span>
                </button>
              </div>
            </ScrollAnimation>

            {/* Real-time Credibility Metric Ribbon */}
            <ScrollAnimation variant="fadeUp" delay={0.4}>
              <div className="pt-4 border-t border-gray-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#252E3D]">
                      {followerCount}
                    </span>
                    {isLive && (
                      <span className="inline-flex relative h-2.5 w-2.5" title="Real-time sync">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                    <span>LinkedIn Followers</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1 py-0.2 rounded">LIVE</span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#252E3D]">13 Years</div>
                  <div className="text-xs text-gray-500 font-medium">Recruiting Experience</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#5a58ab]">100%</div>
                  <div className="text-xs text-gray-500 font-medium">Fully Managed</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#252E3D]">Executive</div>
                  <div className="text-xs text-gray-500 font-medium">Founders &amp; C-Suite</div>
                </div>
              </div>
            </ScrollAnimation>
          </div>

          {/* Right Column: Visual Trust Card featuring Juhi Bhatia */}
          <div className="lg:col-span-5">
            <ScrollAnimation variant="scaleUp" delay={0.2}>
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl bg-white p-6 sm:p-8 shadow-xl border border-gray-200/90 overflow-hidden">
                {/* Decorative background radial */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#5a58ab]/10 rounded-full blur-2xl pointer-events-none" />

                {/* Profile header */}
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#5a58ab] shadow-md flex-shrink-0">
                    <Image
                      src="/founder.avif"
                      alt="Juhi Bhatia - Founder & CEO of JB Recruitment Solutions"
                      fill
                      sizes="96px"
                      priority
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-lg sm:text-xl font-bold text-[#252E3D]">Juhi Bhatia</h3>
                      <FaLinkedin className="text-[#0077b5] text-base" />
                    </div>
                    <p className="text-xs sm:text-sm text-[#5a58ab] font-semibold">
                      Founder &amp; CEO | JB Recruitment Solutions
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                        {followerCount} Live Followers
                      </span>
                    </div>
                  </div>
                </div>

                {/* Core Philosophy Quote */}
                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-[#f8f8fc] to-[#f4f3ff] border border-[#e2e1fa] text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                  &ldquo;You bring the expertise. We help you tell your story, grow your visibility, and build your influence.&rdquo;
                </div>

                {/* Core benefits checklist */}
                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700">
                    <FaShieldAlt className="text-[#5a58ab] text-sm flex-shrink-0" />
                    <span>Profile positioning &amp; tailored content strategy</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700">
                    <FaShieldAlt className="text-[#5a58ab] text-sm flex-shrink-0" />
                    <span>Ghostwriting that preserves your authentic voice</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700">
                    <FaShieldAlt className="text-[#5a58ab] text-sm flex-shrink-0" />
                    <span>Done-for-you publishing, engagement &amp; audience growth</span>
                  </div>
                </div>

                {/* Bottom link to LinkedIn */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">Direct LinkedIn Profile</span>
                  <a
                    href="https://www.linkedin.com/in/juhiibhatia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#0077b5] font-bold hover:underline"
                  >
                    <FaLinkedin />
                    <span>View Profile ({followerCount})</span>
                  </a>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </div>
    </section>
  );
}
