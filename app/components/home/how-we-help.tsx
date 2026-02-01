"use client";

import React from "react";
import ScrollAnimation from "../ui/scroll-animation";
import Link from "next/link";
import ResumeScanner from "../ui/resume-scan";
import { useRouter } from "next/navigation";

export default function HowWeHelpSection() {
  const router = useRouter();
  return (
    <div className="w-full bg-linear-to-b from-gray-50 to-white py-12 md:py-16 lg:py-20 border-t border-[#bababa] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-5 space-x-1 lg:mb-10">
          <ScrollAnimation variant="fadeUp">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="md:mb-8 col-span-1 flex items-center gap-1 lg:gap-2">
                <img
                  src="/home/icons8-ai-48.avif"
                  alt="Help Icon"
                  className="w-6 h-6 md:w-4 md:h-4 lg:w-7 lg:h-7"
                />
                <p
                  className="text-[#605dba] text-base md:text-sm lg:text-lg font-medium"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  How We Help
                </p>
              </div>

              <div className="col-span-1 sm:col-span-4">
                <h2 className="text-[#252e3d] text-2xl sm:text-3xl md:text-4xl lg:text-[28px] xl:text-[33.3px] leading-tight font-semibold">
                  We support hiring across the UK, Europe, the Middle East, and
                  the USA
                </h2>
              </div>
            </div>
          </ScrollAnimation>
        </div>

        {/* Main Content Grid: left card, centered description, right card */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 xl:gap-16"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          {/* Left Column */}
          <ScrollAnimation
            variant="slideRight"
            delay={0.2}
            className="space-y-8 lg:space-y-10 col-span-1"
          >
            {/* Chat Card */}
            <div
              className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 lg:p-5 shadow-lg cursor-pointer h-full flex flex-col justify-between"
              onClick={() => router.push("/companies")}
            >
              {/* Chat Messages */}
              <div className="space-y-3 md:space-y-4 mb-8 md:mb-0">
                {/* User message */}
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 md:px-5 py-2.5 md:py-3 max-w-xs">
                    <p className="text-gray-700 text-sm md:text-base">
                      Can I share my requirements with you?
                    </p>
                  </div>
                </div>

                {/* Bot response */}
                <div className="flex justify-end">
                  <div className="bg-indigo-600 rounded-2xl rounded-tr-none px-5 md:px-6 py-2.5 md:py-3">
                    <p className="text-white text-sm md:text-base font-medium">
                      Yes, please.
                    </p>
                  </div>
                </div>

                {/* Done message */}
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 md:px-5 py-2.5 md:py-3 flex items-center gap-2">
                    <p className="text-gray-700 text-sm md:text-base">Done</p>
                    <div className="w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-2.5 h-2.5 md:w-3 md:h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-indigo-600 rounded-2xl rounded-tr-none px-5 md:px-6 py-2.5 md:py-3">
                    <p className="text-white text-sm md:text-base font-medium">
                      We'll follow up shortly.
                    </p>
                    <div className="absolute -bottom-4 -right-6 w-24 h-24 bg-blue-400/40 rounded-full blur-2xl"></div>
                  </div>
                </div>
              </div>

              {/* Card Title and Description */}
              <div className="mt-8 md:mt-10">
                <h3 className="text-gray-900 text-2xl md:text-3xl font-bold mb-3 md:mb-2">
                  Companies
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Build your next great team with us. We help businesses find
                  candidates who aren’t just qualified - but aligned.
                </p>
              </div>
            </div>
          </ScrollAnimation>

          {/* Middle Column: centered description text */}
          <ScrollAnimation
            variant="fadeUp"
            delay={0.4}
            className="hidden lg:flex col-span-1 items-center justify-center px-4 md:px-6"
          >
            <div className="max-w-md text-center">
              <p className="text-[#252E3D] text-base md:text-lg lg:text-2xl leading-relaxed font-medium">
                We align businesses with the right talent while supporting
                individuals to grow and succeed. Our structured approach ensures
                meaningful, long-term career matches.
              </p>
            </div>
          </ScrollAnimation>

          {/* Right Column */}
          <ScrollAnimation
            variant="slideLeft"
            delay={0.6}
            className="space-y-6 md:space-y-8 col-span-1 flex flex-col items-end"
          >
            {/* Career Guidance Card */}
            <div
              className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 lg:p-5 shadow-lg w-full cursor-pointer h-full flex flex-col justify-between"
              onClick={() => router.push("/job-seekers")}
            >
              {/* Resume Preview Box */}
              <div className="mb-6 md:mb-8 relative">
                <div className="">
                  <ResumeScanner />
                </div>

                {/* Corner brackets */}
                <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-gray-300"></div>
                <div className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2 border-gray-300"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2 border-gray-300"></div>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-gray-300"></div>
              </div>

              {/* Card Title and Description */}
              <div>
                <h3 className="text-gray-900 text-2xl md:text-3xl font-bold mb-3 md:mb-2">
                  Job Seekers
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  We support individuals throughout their career journey with
                  tools and guidance that help them stand out and succeed.
                </p>
              </div>
            </div>
          </ScrollAnimation>
        </div>

        {/* Explore More pill aligned right beneath the card */}
        <div className="w-full flex justify-end mt-10 lg:mt-12">
          <Link
            href="/about-us"
            className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-md text-gray-900 text-base md:text-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            <span>Explore More</span>
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
