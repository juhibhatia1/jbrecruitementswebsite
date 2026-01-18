"use client";

import Image from "next/image";
import { FaCheck } from "react-icons/fa";

export default function HireWithConfidence() {
  return (
    <section className="w-full bg-gradient-to-b from-slate-50 to-white md:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1
            className="text-[#252e3d] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6"
            style={{ fontFamily: "Geist, sans-serif" }}
          >
            Hire with Confidence
          </h1>
          <p
            className="mx-auto max-w-3xl text-[#252e3d] text-base md:text-lg lg:text-xl leading-relaxed"
            style={{ fontFamily: "Palatino Linotype, sans-serif" }}
          >
            Hiring is one of the most crucial decisions a business makes. At JB
            Solutions, we treat it with the importance it deserves. Our
            recruitment approach goes beyond matching skills - we look at
            culture compatibility, long-term potential, and the real impact a
            candidate can bring to the team.
          </p>
        </div>

        {/* Cards Grid - 2x2 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* TOP LEFT - Complete Recruitment Support */}
          <div className="bg-white rounded-xl p-8 md:p-6 shadow-lg border border-slate-200 flex flex-col md:flex-row gap-8 items-center lg:col-span-8">
            {/* Background Image */}
            <div className="flex-shrink-0 rounded-xl w-72 h-60 sm:w-84 sm:h-68 md:w-100 md:h-100 relative bg-slate-100">
              <Image
                src="/companies/card-1.svg"
                alt="Complete Recruitment Support"
                fill
                className="object-contain"
              />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight text-[#252e3d]"
                style={{ fontFamily: "Geist, sans-serif" }}
              >
                Complete Recruitment Support
              </h2>
              <p className="text-[#4b5563] text-base mb-4 leading-relaxed">
                Simplify your entire hiring journey. From sourcing to selection,
                we deliver structured, human-first recruitment support. So the
                right hire is always within reach.
              </p>
              <ul className="space-y-4 text-base text-[#252e3d]">
                <li className="flex items-center gap-2">
                  <FaCheck className="text-black flex-shrink-0" size={15} />
                  <span
                    style={{ fontFamily: "Geist, sans-serif" }}
                    className="text-black font-medium"
                  >
                    Complete Talent Acquisition
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheck className="text-black flex-shrink-0" size={15} />
                  <span
                    style={{ fontFamily: "Geist, sans-serif" }}
                    className="text-black font-medium"
                  >
                    Complete Talent Acquisition
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheck className="text-black flex-shrink-0" size={15} />
                  <span
                    style={{ fontFamily: "Geist, sans-serif" }}
                    className="text-black font-medium"
                  >
                    Global & Leadership Hiring
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheck className="text-black flex-shrink-0" size={15} />
                  <span
                    style={{ fontFamily: "Geist, sans-serif" }}
                    className="text-black font-medium"
                  >
                    Data-Driven Candidate Shortlisting
                  </span>
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
                  style={{ fontFamily: "Geist, sans-serif" }}
                >
                  Can I share my requirements with you?
                </p>
              </div>

              {/* Chat 2 (Response) */}
              <div className="flex justify-end">
                <div className="bg-[#605dba] text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-md inline-block">
                  <p
                    className="text-sm font-medium"
                    style={{ fontFamily: "Geist, sans-serif" }}
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
                    style={{ fontFamily: "Geist, sans-serif" }}
                  >
                    Done ✅
                  </span>
                </div>
              </div>

              {/* Chat 4 (Follow up) */}
              <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm inline-block max-w-[85%]">
                <p
                  className="text-[#1f2937] text-sm"
                  style={{ fontFamily: "Geist, sans-serif" }}
                >
                  We'll follow up shortly.
                </p>
              </div>
            </div>

            <div>
              <h3
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight text-[#252e3d]"
                style={{ fontFamily: "Geist, sans-serif" }}
              >
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
          <div className="bg-white rounded-xl p-8 md:p-6 shadow-lg border border-slate-200 flex flex-col md:flex-row gap-8 items-center min-h-[400px] lg:col-span-8">
            {/* Content */}
            <div className="flex-1">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight text-[#252e3d]"
                style={{ fontFamily: "Geist, sans-serif" }}
              >
                Industry-aware Screening
              </h2>
              <p className="text-[#4b5563] text-base mb-4 leading-relaxed">
                It ensures candidates are evaluated with a deep understanding of
                the role, domain, and business context. Instead of relying on
                keywords alone, we assess real-world experience, problem solving
                ability, and team alignment.
              </p>
              <ul className="space-y-4 text-base text-[#252e3d]">
                <li className="flex items-center gap-2">
                  <FaCheck className="text-black flex-shrink-0" size={15} />
                  <span
                    style={{ fontFamily: "Geist, sans-serif" }}
                    className="text-black font-medium"
                  >
                    Role-Specific Evaluation
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheck className="text-black flex-shrink-0" size={15} />
                  <span
                    style={{ fontFamily: "Geist, sans-serif" }}
                    className="text-black font-medium"
                  >
                    Context-Driven Shortlisting
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheck className="text-black flex-shrink-0" size={15} />
                  <span
                    style={{ fontFamily: "Geist, sans-serif" }}
                    className="text-black font-medium"
                  >
                    Better Hiring Decisions
                  </span>
                </li>
              </ul>
            </div>
            <div className="flex-shrink-0 w-72 h-60 sm:w-84 sm:h-68 md:w-100 md:h-100 rounded-xl relative bg-slate-100">
              <Image
                src="/companies/card-2.svg"
                alt="Complete Recruitment Support"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* BOTTOM RIGHT - Quality-Driven Selection */}
          <div className="bg-white rounded-xl p-5 md:p-6 shadow-lg border border-slate-200 min-h-[400px] flex flex-col justify-between lg:col-span-4">
            <div className="mb-6 w-full max-w-sm mx-autorounded-xl p-3">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <p
                  className="text-sm text-[#1f2937] font-semibold tracking-wide"
                  style={{ fontFamily: "Geist, sans-serif" }}
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
              <h3
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight text-[#252e3d]"
                style={{ fontFamily: "Geist, sans-serif" }}
              >
                Quality-Driven Selection
              </h3>
              <p className="text-[#4b5563] leading-relaxed text-sm sm:text-base">
                Gain clear visibility into candidate fit, hiring progress, and
                next steps — so decisions feel confident, not rushed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
