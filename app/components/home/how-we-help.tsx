"use client";

import React from "react";
import ScrollAnimation from "../ui/scroll-animation";
import Link from "next/link";
import ResumeScanner from "../ui/resume-scan";
import { RxArrowTopRight } from "react-icons/rx";

export default function HowWeHelpSection() {
  return (
    <div className="relative w-full bg-linear-to-b from-gray-50 to-white py-12 md:py-16 lg:py-20 border-t border-[#bababa] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-5 space-x-1 lg:mb-10">
          <ScrollAnimation variant="fadeUp">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="md:mb-8 col-span-1 flex items-center gap-1 lg:gap-2">
                <img
                  src="/home/icons8-ai-48.avif"
                  alt="Help Icon"
                  className="w-4 h-4 md:w-4 md:h-4 lg:w-7 lg:h-7"
                />
                <p
                  className="text-[#605dba] text-base md:text-md lg:text-lg font-medium"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  How We Help
                </p>
              </div>

              <div className="col-span-1 sm:col-span-3">
                <h2 className="text-[#252e3d] text-xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight font-semibold">
                  We support hiring across the UK, <br />
                  Europe, the Middle East, & the USA
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
            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 lg:p-5 shadow-lg h-full flex flex-col justify-between">
              <div className="space-y-3 md:space-y-4 mb-8 md:mb-0">
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 md:px-5 py-2.5 md:py-3 max-w-xs">
                    <p className="text-gray-700 text-sm md:text-base">
                      Can I share my requirements with you?
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-indigo-600 rounded-2xl rounded-tr-none px-5 md:px-6 py-2.5 md:py-3">
                    <p className="text-white text-sm md:text-base font-medium">
                      Yes, please.
                    </p>
                  </div>
                </div>

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
                  </div>
                </div>
              </div>

              <div className="mt-8 md:mt-10">
                <h3 className="text-gray-900 text-2xl md:text-3xl font-bold mb-3 md:mb-2">
                  Companies
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Build your next great team with us. We help businesses find
                  candidates who are not just qualified - but aligned.
                </p>
                <div className="mt-6">
                  <Link
                    href="/companies"
                    className="inline-flex items-center gap-1 rounded-full bg-[#252e3d] px-5 py-2.5 text-sm font-medium text-white shadow-[0_10px_20px_rgba(96,93,186,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_25px_rgba(96,93,186,0.4)] group"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    Learn More
                    <RxArrowTopRight
                      size={18}
                      className="transform transition-transform duration-300 group-hover:rotate-45 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
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
            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 lg:p-5 shadow-lg w-full h-full flex flex-col justify-between">
              <div className="mb-6 md:mb-8 relative">
                <div>
                  <ResumeScanner />
                </div>

                <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-gray-300"></div>
                <div className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2 border-gray-300"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2 border-gray-300"></div>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-gray-300"></div>
              </div>

              <div>
                <h3 className="text-gray-900 text-2xl md:text-3xl font-bold mb-3 md:mb-2">
                  Job Seekers
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  We support individuals throughout their career journey with
                  tools and guidance that help them stand out and succeed.
                </p>
                <div className="mt-6">
                  <Link
                    href="/job-seekers"
                    className="inline-flex items-center gap-1 rounded-full bg-[#252e3d] px-5 py-2.5 text-sm font-medium text-white shadow-[0_10px_20px_rgba(96,93,186,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_25px_rgba(96,93,186,0.4)] group"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    Explore Services
                    <RxArrowTopRight
                      size={18}
                      className="transform transition-transform duration-300 group-hover:rotate-45 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>

        {/* Explore More pill aligned right beneath the card */}
        {/* <div className="w-full flex justify-end mt-10 lg:mt-12">
          <Link
            href="/about-us"
            className="inline-flex items-center gap-1 rounded-full bg-[#252e3d] px-6 py-3 text-base md:text-lg font-medium text-white shadow-[0_10px_20px_rgba(96,93,186,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_25px_rgba(96,93,186,0.4)] group"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <span>Explore More</span>
            <RxArrowTopRight
              size={20}
              className="transform transition-transform duration-300 group-hover:rotate-45 group-hover:translate-x-1"
            />
          </Link>
        </div> */}
      </div>
    </div>
  );
}
