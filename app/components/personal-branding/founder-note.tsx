"use client";

import React from "react";
import Image from "next/image";
import { FaLinkedin, FaInstagram } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";
import ScrollAnimation from "../ui/scroll-animation";
import { useLinkedInFollowers } from "@/lib/hooks/useLinkedInFollowers";
import { useInstagramFollowers } from "@/lib/hooks/useInstagramFollowers";

export default function FounderNote() {
  const { formatted: liFollowerCount } = useLinkedInFollowers();
  const { formatted: igFollowerCount } = useInstagramFollowers();

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <ScrollAnimation variant="fadeUp">
          <div className="relative rounded-3xl bg-gradient-to-br from-[#fbfbfe] via-[#f7f7fc] to-[#f2f1fa] border border-[#e2e1fa] p-8 sm:p-12 md:p-16 shadow-lg overflow-hidden">
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5a58ab] via-[#3F78E0] to-[#5a58ab]" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#5a58ab]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-gray-200/80">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#5a58ab] shadow-md flex-shrink-0">
                  <Image
                    src="/founder.avif"
                    alt="Juhi Bhatia - Founder & CEO"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5a58ab]/10 text-xs font-semibold text-[#5a58ab] mb-1">
                    <HiOutlineSparkles className="text-xs" />
                    <span>Founder&apos;s Perspective</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#252E3D] tracking-tight">
                    A Note from Juhi Bhatia
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                    <span>Founder &amp; CEO, JB Recruitment Solutions</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-[#0077b5] font-semibold">
                      <FaLinkedin className="text-xs" />
                      {liFollowerCount}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-pink-600 font-semibold">
                      <FaInstagram className="text-xs" />
                      {igFollowerCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-col gap-2 self-start sm:self-center">
                <a
                  href="https://www.linkedin.com/in/juhiibhatia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[#0077b5] text-xs font-bold transition shadow-xs hover:shadow-sm"
                >
                  <FaLinkedin className="text-sm" />
                  <span>LinkedIn Profile</span>
                </a>
                <a
                  href="https://www.instagram.com/juhibhatia_globalrecruiter/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-pink-600 text-xs font-bold transition shadow-xs hover:shadow-sm"
                >
                  <FaInstagram className="text-sm" />
                  <span>Instagram Profile</span>
                </a>
              </div>
            </div>

            {/* Note Body with exact words from content.txt */}
            <div className="mt-8 space-y-5 text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
              <p className="text-base sm:text-lg text-gray-800 font-medium leading-relaxed">
                I&apos;ve been on LinkedIn for over 10 years, but I only started intentionally building my personal brand in April 2025.
              </p>

              <p>
                Since then, I&apos;ve grown my audience to over 400,000 followers, secured multiple brand partnerships, and attracted clients who reached out to me organically - without having to do traditional business development or sales.
              </p>

              <p>
                It took consistency, multiple trial and error, learning what resonated with my audience, and finding the confidence to share my experiences and perspectives authentically.
              </p>

              <p>
                I know what it&apos;s like to want to build your social proof on LinkedIn but keep postponing it until tomorrow, next week, or next month because you&apos;re busy doing your actual job.
              </p>

              <p>
                You know LinkedIn matters. You know you should be sharing your expertise. But between meetings, clients, deadlines, and everything else on your plate, creating content becomes another task that never gets done.
              </p>

              {/* Editorial Pull Quote */}
              <div className="my-8 p-6 sm:p-7 rounded-2xl bg-white border-l-4 border-[#5a58ab] border-y border-r border-[#e2e1fa] shadow-sm relative overflow-hidden">
                <span className="absolute top-2 right-4 text-6xl text-[#5a58ab]/10 font-serif select-none pointer-events-none">
                  &ldquo;
                </span>
                <p className="text-base sm:text-xl font-bold text-[#5a58ab] italic leading-snug">
                  &ldquo;You shouldn&apos;t have to choose between doing your job well and building your personal brand.&rdquo;
                </p>
              </div>

              <p className="font-bold text-[#252E3D] text-base sm:text-lg">
                That&apos;s exactly why I created this service.
              </p>

              <p>
                I want to help you build an authentic, credible LinkedIn presence without having to figure out what to post, spend hours writing, or manage engagement yourself.
              </p>

              <p>
                With a dedicated account manager and our team taking care of your personal branding, you can focus on your work while we help you show up consistently-with your voice, values, and goals at the centre of everything we do.
              </p>

              {/* Closing Sign-off */}
              <div className="mt-8 pt-6 border-t border-gray-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-base sm:text-xl font-extrabold text-[#252E3D] italic tracking-tight">
                    &ldquo;You&apos;ve already built your expertise. Now, let&apos;s build your visibility.&rdquo;
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">- Juhi Bhatia</span>
                    <span className="text-xs text-gray-500 font-medium">• Founder &amp; CEO, JB Recruitment Solutions</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800 self-start sm:self-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Personally Overseen by Juhi</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
