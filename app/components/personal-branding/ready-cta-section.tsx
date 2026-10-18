"use client";

import React from "react";
import Image from "next/image";
import { FaArrowRight, FaLinkedin, FaInstagram } from "react-icons/fa";
import ScrollAnimation from "../ui/scroll-animation";
import { useLinkedInFollowers } from "@/lib/hooks/useLinkedInFollowers";
import { useInstagramFollowers } from "@/lib/hooks/useInstagramFollowers";
import { useDetectCurrency } from "@/lib/hooks/useDetectCurrency";

interface ReadyCtaSectionProps {
  onOpenInquiry: (pkg?: "3-month" | "6-month" | "general") => void;
}

export default function ReadyCtaSection({ onOpenInquiry }: ReadyCtaSectionProps) {
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
    <section className="py-20 sm:py-28 bg-gradient-to-b from-white to-[#fbfbfe] border-t border-gray-100">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <ScrollAnimation variant="fadeUp">
          <div className="relative rounded-3xl bg-gradient-to-br from-[#1a1f2b] via-[#252E3D] to-[#1a1f2b] p-8 sm:p-12 md:p-16 text-white shadow-2xl overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#5a58ab]/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#3F78E0]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5a58ab]/30 border border-[#5a58ab]/40 text-xs font-semibold text-[#a5a3ff]">
                  <span>✨ Get Started Today</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                  Ready to Build Your Personal Brand?
                </h2>

                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  You don&apos;t need to become a full-time content creator to build influence on LinkedIn. You need the right strategy, authentic content, and a team that helps you show up consistently.
                </p>

                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  Let JB take care of your LinkedIn personal branding while you focus on building your business, leading your team, or advancing your career.
                </p>

                <div className="pt-2">
                  <p className="text-base sm:text-lg font-bold text-white italic border-l-4 border-[#5a58ab] pl-3.5">
                    &ldquo;Your expertise is already there. It&apos;s time the right people noticed it.&rdquo;
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-[#a5a3ff] mt-2 pl-3.5">
                    Choose your package and let&apos;s build your personal brand.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <button
                    onClick={scrollToPackages}
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#5a58ab] hover:bg-[#4d4a99] text-white text-sm sm:text-base font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>Choose Your Package</span>
                    <FaArrowRight className="text-xs" />
                  </button>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <button
                      onClick={() => onOpenInquiry("general")}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm sm:text-base font-semibold transition-all border border-white/20 cursor-pointer"
                    >
                      <span>Request Consultation ({consultationFeeText})</span>
                    </button>
                    <span className="text-[11px] text-emerald-300 font-semibold">
                      ✓ 100% credited toward your package
                    </span>
                  </div>
                </div>
              </div>

              {/* Founder Vignette */}
              <div className="lg:col-span-4 flex flex-col items-center text-center">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white/20 shadow-xl mb-3">
                  <Image
                    src="/founder.avif"
                    alt="Juhi Bhatia - Founder & CEO"
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </div>
                <div className="font-bold text-lg text-white">Juhi Bhatia</div>
                <div className="text-xs text-gray-400">Recruitment Expert &amp; Personal Brand Educator</div>
                <div className="flex flex-col items-center gap-1.5 mt-2">
                  <a
                    href="https://www.linkedin.com/in/juhiibhatia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#a5a3ff] hover:text-white font-semibold transition"
                  >
                    <FaLinkedin className="text-xs text-[#0077b5]" />
                    <span>{liFollowerCount} LinkedIn Followers</span>
                  </a>
                  <a
                    href="https://www.instagram.com/juhibhatia_globalrecruiter/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-pink-300 hover:text-white font-semibold transition"
                  >
                    <FaInstagram className="text-xs text-pink-400" />
                    <span>{igFollowerCount} Instagram Followers</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
