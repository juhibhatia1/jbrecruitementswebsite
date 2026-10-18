"use client";

import React from "react";
import Image from "next/image";
import { FaLinkedin, FaInstagram, FaArrowRight, FaShieldAlt } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";
import ScrollAnimation from "../ui/scroll-animation";
import { useLinkedInFollowers } from "@/lib/hooks/useLinkedInFollowers";
import { useInstagramFollowers } from "@/lib/hooks/useInstagramFollowers";
import { useDetectCurrency } from "@/lib/hooks/useDetectCurrency";

interface BrandingHeroProps {
  onOpenInquiry: (pkg?: "3-month" | "6-month" | "general") => void;
}

export default function BrandingHero({ onOpenInquiry }: BrandingHeroProps) {
  const { formatted: liFollowerCount } = useLinkedInFollowers();
  const { formatted: igFollowerCount } = useInstagramFollowers();
  const currency = useDetectCurrency();
  const isIndianUser = currency === "INR";
  const consultationFeeText = isIndianUser ? "₹24,999" : "$299";

  const scrollToPackages = () => {
    const el = document.getElementById("packages-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="overview" className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 bg-gradient-to-b from-[#f9f9fb] via-white to-[#fbfbfe]">
      {/* Background Decorative Glow Elements */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[720px] h-[400px] bg-gradient-to-tr from-[#5a58ab]/12 via-[#3F78E0]/8 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-48 right-10 w-[380px] h-[380px] bg-[#605dba]/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
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
              <p className="mt-2.5 text-lg sm:text-xl md:text-2xl font-bold text-[#5a58ab] tracking-tight">
                Authentic LinkedIn Branding &amp; Monetization: Build Your Influence, Grow Your Visibility
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium">
                <span className="font-semibold text-gray-800">By Juhi Bhatia</span>
                <span>•</span>
                <span>Recruitment Expert &amp; Personal Brand Educator</span>
              </div>
            </ScrollAnimation>

            <ScrollAnimation variant="fadeUp" delay={0.2}>
              <div className="space-y-3.5 text-sm sm:text-base text-gray-700 leading-relaxed max-w-2xl">
                <p>
                  LinkedIn can be more than a professional profile. It can become a platform for building credibility, attracting clients, creating career opportunities, securing brand partnerships, and exploring ways to monetize your expertise.
                </p>
                <p>
                  At JB, we help founders, executives, business owners, corporate professionals, and solopreneurs build their personal brands through a fully managed, done-for-you LinkedIn service.
                </p>
                <p>
                  From profile optimisation and content strategy to ghostwriting, publishing, and engagement management, we take care of your LinkedIn presence while you focus on what you do best.
                </p>
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#5a58ab]/10 via-[#3F78E0]/10 to-transparent border-l-4 border-[#5a58ab] text-[#252E3D] font-bold italic text-sm sm:text-base">
                  &ldquo;You bring the expertise. We help the right people see it.&rdquo;
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  With 13 years of industry experience and a LinkedIn audience of 400,000+ followers, Juhi understands how professional visibility can translate into meaningful opportunities. Through JB, she brings that experience to professionals who want to build their own personal brands, supported by a dedicated account manager and a team working closely with them throughout the journey.
                </p>
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

                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                  <button
                    onClick={() => onOpenInquiry("general")}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-[#252E3D] border border-gray-300 text-sm sm:text-base font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer"
                  >
                    <span>Request Consultation</span>
                  </button>
                </div>
              </div>
            </ScrollAnimation>

          </div>

          {/* Right Column: Visual Portrait Card featuring Juhi Bhatia right next to the heading */}
          <div className="lg:col-span-5">
            <ScrollAnimation variant="fadeUp" delay={0.15}>
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl bg-white p-3 sm:p-4 shadow-xl border border-gray-200/90 overflow-hidden group hover:shadow-2xl transition-all duration-300">
                {/* Decorative background radial */}
                <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-[#5a58ab]/15 via-[#3F78E0]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

                {/* Hero Portrait Frame */}
                <div className="relative w-full h-[360px] sm:h-[420px] lg:h-[600px] rounded-2xl overflow-hidden border border-[#5a58ab]/20 shadow-md">
                  <Image
                    src="/juhi-personal-branding.jpeg"
                    alt="Juhi Bhatia - Founder & CEO of JB Recruitment Solutions"
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    priority
                    className="object-cover object-top transition-transform duration-700"
                  />

                  {/* Floating Badges on Portrait with Glassmorphism */}
                  <div className="absolute top-3 left-3">
                    <a
                      href="https://www.linkedin.com/in/juhiibhatia/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-md text-[#0077b5] text-xs font-bold hover:bg-white hover:scale-105 transition-all"
                    >
                      <FaLinkedin className="text-sm" />
                      <span>{liFollowerCount}</span>
                    </a>
                  </div>

                  <div className="absolute top-3 right-3">
                    <a
                      href="https://www.instagram.com/juhibhatia_globalrecruiter/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-md text-pink-600 text-xs font-bold hover:bg-white hover:scale-105 transition-all"
                    >
                      <FaInstagram className="text-sm" />
                      <span>{igFollowerCount}</span>
                    </a>
                  </div>

                  {/* Subtle Gradient Vignette at Bottom of Image with Gold Accent */}
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#161a24]/90 via-[#161a24]/50 to-transparent flex items-end p-4 sm:p-5">
                    <div className="text-white w-full">
                      <div className="flex items-center justify-between">
                        <div className="font-extrabold text-xl sm:text-2xl drop-shadow-sm tracking-tight">Juhi Bhatia</div>
                      </div>
                      <div className="text-xs text-gray-200 font-medium drop-shadow-xs mt-0.5">
                        Founder &amp; CEO • Recruitment Expert &amp; Personal Brand Educator
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom link to LinkedIn & Instagram */}
                <div className="mt-3.5 pt-2.5 px-2 flex items-center justify-between text-xs text-gray-500">
                  <a
                    href="https://www.linkedin.com/in/juhiibhatia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#0077b5] font-bold hover:underline"
                  >
                    <FaLinkedin />
                    <span>LinkedIn ({liFollowerCount})</span>
                  </a>
                  <a
                    href="https://www.instagram.com/juhibhatia_globalrecruiter/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-pink-600 font-bold hover:underline"
                  >
                    <FaInstagram />
                    <span>Instagram ({igFollowerCount})</span>
                  </a>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>

        {/* Real-time Credibility Metric Ribbon with LinkedIn & Instagram - Centered Horizontally */}
        <ScrollAnimation variant="fadeUp" delay={0.35}>
          <div className="mt-10 sm:mt-12 max-w-5xl mx-auto">
            <div className="rounded-2xl bg-white/95 backdrop-blur-sm border border-[#e2e1fa] p-5 sm:p-6 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              <div className="pt-2 sm:pt-0 flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#252E3D] tracking-tight">
                    {liFollowerCount}
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-medium flex items-center justify-center gap-1 mt-1">
                  <FaLinkedin className="text-[#0077b5]" />
                  <span className="font-semibold text-gray-700">LinkedIn</span>
                </div>
              </div>

              <div className="pt-2 sm:pt-0 sm:pl-4 flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#252E3D] tracking-tight">
                    {igFollowerCount}
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-medium flex items-center justify-center gap-1 mt-1">
                  <FaInstagram className="text-pink-600" />
                  <span className="font-semibold text-gray-700">Instagram</span>
                </div>
              </div>

              <div className="pt-2 sm:pt-0 sm:pl-4 flex flex-col items-center justify-center text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#252E3D] tracking-tight">13 Years</div>
                <div className="text-xs text-gray-500 font-medium mt-1">Recruiting Experience</div>
              </div>

              <div className="pt-2 sm:pt-0 sm:pl-4 flex flex-col items-center justify-center text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#5a58ab] tracking-tight">840K+</div>
                <div className="text-xs text-gray-500 font-medium mt-1">Total Executive Reach</div>
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
