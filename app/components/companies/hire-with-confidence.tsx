"use client";

import Image from "next/image";

export default function HireWithConfidence() {
  return (
    <section className="w-full bg-gradient-to-b from-slate-50 to-white md:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-[#26262A] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6 crimson">
            Hire with Confidence
          </h1>
          <p className="mx-auto max-w-3xl text-[#252e3d] text-base md:text-lg lg:text-xl leading-relaxed text-left raleway">
            Specializing in IT, Tech and Finance recruitment, JB helps businesses across diverse industries find the right talent. Our approach goes beyond matching skills - we focus on culture fit, long-term potential, and candidates who create lasting impact for your team.
          </p>
        </div>

        {/* Cards Grid - 2x2 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* TOP LEFT - Complete Recruitment Support */}
          <div className="bg-white rounded-xl p-8 md:p-6 shadow-lg border border-slate-200 lg:col-span-8">
            {/* Top Section: Image + Content side by side */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-6 items-center justify-center">
              {/* Image */}
              <div className="flex-shrink-0 w-full md:w-100 h-48 md:h-56 rounded-xl relative">
                <Image
                  src="/companies/card-1.avif"
                  alt="Complete Recruitment Support"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Content */}
              <div className="flex-1 items-center justify-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-tight text-[#252e3d] crimson">
                  Complete Recruitment Support
                </h2>
                <p className="text-[#4b5563] text-base leading-relaxed raleway">
                  Simplify your entire hiring journey. From sourcing to
                  selection, we deliver structured, human-first recruitment
                  support. So the right hire is always within reach.
                </p>
              </div>
            </div>

            {/* Bottom Section: Tagline + Features */}
            <div className="">
              {/* Centered tagline */}
              <div className="text-center mb-4">
                <p className="text-[#252E3D] font-semibold text-lg md:text-2xl crimson">
                  JB works as an extension of your brand
                </p>
              </div>

              {/* Two-column feature list */}
              <ul
                className="grid grid-cols-1 sm:grid-cols-2 
               gap-y-3 gap-x-24 md:gap-x-44 lg:gap-x-28 
               text-base text-[#737373] 
               w-fit mx-auto"
              >
                <li className="font-medium raleway text-left">
                  ● 300,000+ global talent network
                </li>
                <li className="font-medium raleway text-left">
                  ● Data-driven approach
                </li>
                <li className="font-medium raleway text-left">
                  ● 48-hour shortlist turnaround
                </li>
                <li className="font-medium raleway text-left">
                  ● Flexible payment options
                </li>
              </ul>
            </div>
          </div>

          {/* TOP RIGHT - Tailored Role-Based Search */}
          <div className="bg-white rounded-xl p-8 md:p-6 shadow-lg border border-slate-200 min-h-[400px] flex flex-col justify-between lg:col-span-4">
            {/* Chat Interface */}
            <div className="mb-4 space-y-4 md:space-y-2">
              {/* Chat 1 */}
              <div className="bg-slate-100 px-3 py-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 inline-block max-w-[85%]">
                <p
                  className="text-[#1f2937] text-sm"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Can I share my requirements with you?
                </p>
              </div>

              {/* Chat 2 (Response) */}
              <div className="flex justify-end">
                <div className="bg-[#605dba] text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-md inline-block">
                  <p
                    className="text-sm font-medium"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    Yes, please.
                  </p>
                </div>
              </div>

              {/* Chat 3 (Done) */}
              <div className="flex items-center">
                <div className="bg-slate-100 px-4 py-2 rounded-xl rounded-tl-none border border-slate-100 shadow-sm flex items-center">
                  <span
                    className="text-sm font-medium text-[#1f2937]"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    Done ✅
                  </span>
                </div>
              </div>

              {/* Chat 4 (Follow up) */}
              <div className="flex justify-end">
                <div className="bg-[#605dba] text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-md inline-block">
                  <p
                    className="text-sm font-medium"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    We'll follow up shortly.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 leading-tight text-[#26262A]">
                Tailored Role-Based Search
              </h3>
              <p className="text-[#4b5563] leading-relaxed text-sm sm:text-base">
                We help businesses find candidates who aren't just qualified -
                but aligned. Our hiring process is structured, efficient, and
                tailored to each organisation's culture and goals.
              </p>
            </div>
          </div>

          {/* BOTTOM LEFT - Industry-Aware Screening */}
          <div className="bg-white rounded-xl p-8 md:p-6 shadow-lg border border-slate-200 lg:col-span-8">
            {/* Content */}
            <div className="">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight text-[#26262A]">
                Industry-aware Screening
              </h2>
              <p className="text-[#4b5563] text-base mb-6 leading-relaxed">
                It ensures candidates are evaluated with a deep understanding of
                the role, domain, and business context. Instead of relying on
                keywords alone, we assess real-world experience, problem solving
                ability, and team alignment.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 md:gap-8">
              {/* Image */}
              <div className="flex-shrink-0 w-full sm:w-72 md:w-72 lg:w-100 xl:w-112 h-48 sm:h-40 md:h-56 rounded-xl relative mr-0 sm:mr-6">
                <Image
                  src="/companies/card-2.avif"
                  alt="Industry-aware Screening"
                  fill
                  sizes="(max-width: 768px) 100vw, 450px"
                  className="object-contain"
                />
              </div>
              <ul className="space-y-3 text-[#737373] w-full md:w-auto flex-1">
                <li className="font-medium">● Role-Specific Evaluation</li>
                <li className="font-medium">● Context-Driven Shortlisting</li>
                <li className="font-medium">● Better Hiring Decisions</li>
                <li className="font-medium">● Strategy-Based Assessment</li>
                <li className="font-medium">● A Trusted Name in Careers</li>
              </ul>
            </div>
          </div>

          {/* BOTTOM RIGHT - Quality-Driven Selection */}
          <div className="bg-white rounded-xl p-5 md:p-6 shadow-lg border border-slate-200 min-h-[400px] flex flex-col justify-between lg:col-span-4">
            <div className="w-full max-w-sm mx-auto rounded-xl p-3">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <p
                  className="text-sm text-[#1f2937] font-semibold tracking-wide"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Comparison
                </p>
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full border-2 border-[#605dba]"></span>
                    <span className="text-[#605dba] font-medium">
                      Nov 24 <span className="ml-1">3,642</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full border-2 border-slate-400"></span>
                    <span className="text-slate-500 font-medium">
                      Nov 23 <span className="ml-1">1,937</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative h-28 w-full">
                <svg
                  viewBox="0 0 300 100"
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  {/* Dotted Line (Previous) */}
                  <path
                    d="M0,80 C80,80 150,75 300,60"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="2"
                    strokeDasharray="6,6"
                  />

                  {/* Solid Line (Current) */}
                  <path
                    d="M0,70 C50,70 100,85 150,85 S250,30 300,30"
                    fill="none"
                    stroke="#605dba"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Point */}
                  <circle
                    cx="300"
                    cy="30"
                    r="5"
                    fill="white"
                    stroke="#605dba"
                    strokeWidth="3"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-auto">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 leading-tight text-[#26262A]">
                Quality-Driven Selection
              </h3>
              <p className="text-[#4b5563] leading-relaxed text-sm sm:text-base">
                Gain clear visibility into candidate fit, hiring progress, and
                next steps - so decisions feel confident, not rushed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
