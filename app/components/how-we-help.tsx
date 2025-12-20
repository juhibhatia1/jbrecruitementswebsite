import React from "react";

export default function HowWeHelpSection() {
  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white py-16 md:py-20 lg:py-24 px-6 md:px-8 lg:px-12 border-t border-[#bababa]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-5 space-x-1">
          <div className="flex items-center gap-2 mb-10 md:mb-12">
            <img
              src="/home/icons8-ai-48.png"
              alt="Help Icon"
              className="w-6 h-6 md:w-7 md:h-7"
            />
            <p
              className="text-[#605dba] text-base md:text-lg font-medium"
              style={{ fontFamily: "Geist, sans-serif" }}
            >
              How We Help
            </p>
            <h2 className="text-[#252e3d] text-3xl md:text-4xl lg:text-5xl xl:text-5xl leading-tight font-semibold">
              Recruitment Support Built for Real People
            </h2>
          </div>
        </div>

        {/* Main Content Grid: left card, centered description, right card */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 xl:gap-16"
          style={{ fontFamily: "Geist, sans-serif" }}
        >
          {/* Left Column */}
          <div className="space-y-8 lg:space-y-10 col-span-1">
            {/* Chat Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 lg:p-5 shadow-lg">
              {/* Chat Messages */}
              <div className="space-y-3 md:space-y-4 mb-8 md:mb-0">
                {/* User message */}
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 md:px-5 py-2.5 md:py-3 max-w-xs">
                    <p className="text-gray-700 text-sm md:text-base">
                      Can I share my requirements with you?
                    </p>
                  </div>
                </div>

                {/* Bot response */}
                <div className="flex justify-end">
                  <div className="bg-indigo-600 rounded-2xl rounded-tr-md px-5 md:px-6 py-2.5 md:py-3">
                    <p className="text-white text-sm md:text-base font-medium">
                      Yes, please.
                    </p>
                  </div>
                </div>

                {/* Done message */}
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 md:px-5 py-2.5 md:py-3 flex items-center gap-2">
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

                {/* Follow up message with blue glow */}
                <div className="flex justify-start relative">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 md:px-5 py-2.5 md:py-3 relative">
                    <p className="text-gray-700 text-sm md:text-base">
                      We'll follow up shortly.
                    </p>
                    {/* Blue glow effect */}
                    <div className="absolute -bottom-4 -right-6 w-24 h-24 bg-blue-400/40 rounded-full blur-2xl"></div>
                  </div>
                </div>
              </div>

              {/* Card Title and Description */}
              <div className="mt-8 md:mt-10">
                <h3 className="text-gray-900 text-2xl md:text-3xl font-bold mb-3 md:mb-2">
                  Hiring
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  We help businesses find candidates who are not just qualified,
                  but aligned with their culture, goals, and long-term vision
                </p>
              </div>
            </div>
          </div>

          {/* Middle Column: centered description text */}
          <div className="hidden lg:flex col-span-1 items-center justify-center px-4 md:px-6">
            <div className="max-w-md text-center">
              <p className="text-gray-800 text-base md:text-lg lg:text-xl leading-relaxed">
                Experience how our people-first recruitment approach simplifies
                hiring for companies and supports professionals through
                meaningful career moves.
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 md:space-y-8 col-span-1 flex flex-col items-end">
            {/* Career Guidance Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 lg:p-5 shadow-lg w-full">
              {/* Resume Preview Box */}
              <div className="mb-6 md:mb-8 relative">
                <div className="border-[3px] border-gray-200 rounded-2xl p-5 md:p-6 bg-white relative overflow-hidden">
                  {/* Header with profile */}
                  <div className="flex items-start gap-3 mb-5">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-2.5 md:h-3 bg-gray-900 rounded w-28 md:w-32 mb-2"></div>
                      <div className="h-1.5 md:h-2 bg-gray-400 rounded w-20 md:w-24"></div>
                    </div>
                  </div>

                  {/* Contact info section */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="space-y-1">
                      <div className="h-2 bg-gray-900 rounded w-16"></div>
                      <div className="h-1.5 bg-gray-300 rounded w-full"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 bg-gray-900 rounded w-12"></div>
                      <div className="h-1.5 bg-gray-300 rounded w-full"></div>
                    </div>
                  </div>

                  {/* Bullet points section */}
                  <div className="space-y-2 mb-2">
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-gray-900 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div className="h-1.5 bg-gray-300 rounded flex-1"></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-gray-900 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div className="h-1.5 bg-gray-300 rounded flex-1"></div>
                    </div>
                  </div>

                  {/* Experience section */}
                  <div className="space-y-3">
                    <div>
                      <div className="h-2.5 bg-gray-900 rounded w-24 mb-2"></div>
                      <div className="space-y-1.5">
                        <div className="h-1.5 bg-gray-300 rounded w-full"></div>
                        <div className="h-1.5 bg-gray-300 rounded w-11/12"></div>
                      </div>
                    </div>
                    <div>
                      <div className="h-2.5 bg-gray-900 rounded w-16 mb-2"></div>
                      <div className="space-y-1.5">
                        <div className="h-1.5 bg-gray-300 rounded w-full"></div>
                        <div className="h-1.5 bg-gray-300 rounded w-4/5"></div>
                      </div>
                    </div>
                  </div>

                  {/* Purple accent line at bottom */}
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-indigo-600"></div>
                </div>

                {/* Corner brackets */}
                <div className="absolute -top-2 -left-2 w-8 h-8 border-l-2 border-t-2 border-gray-300"></div>
                <div className="absolute -top-2 -right-2 w-8 h-8 border-r-2 border-t-2 border-gray-300"></div>
                <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-2 border-b-2 border-gray-300"></div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-2 border-b-2 border-gray-300"></div>
              </div>

              {/* Card Title and Description */}
              <div>
                <h3 className="text-gray-900 text-2xl md:text-3xl font-bold mb-3 md:mb-2">
                  Career Guidance
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Guidance to strengthen profiles, improve visibility, and move
                  toward meaningful opportunities.
                </p>
              </div>
            </div>
            {/* Explore More pill aligned right beneath the card */}
            <div className="w-full flex justify-end">
              <a
                href="#"
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
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
