import React from 'react';

export default function HowWeHelpSection() {
  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white py-16 md:py-20 lg:py-24 px-6 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-10 md:mb-12">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <h2 className="text-indigo-500 text-base md:text-lg font-medium">How We Help</h2>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-start">
          {/* Left Column */}
          <div className="space-y-8 lg:space-y-10">
            {/* Main Heading */}
            <h1 className="text-gray-900 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              Recruitment Support Built for Real People
            </h1>

            {/* Chat Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 lg:p-10 shadow-lg">
              {/* Chat Messages */}
              <div className="space-y-3 md:space-y-4 mb-8 md:mb-10">
                {/* User message */}
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 md:px-5 py-2.5 md:py-3 max-w-xs">
                    <p className="text-gray-700 text-sm md:text-base">Can I share my requirements with you?</p>
                  </div>
                </div>
                
                {/* Bot response */}
                <div className="flex justify-end">
                  <div className="bg-indigo-600 rounded-2xl rounded-tr-md px-5 md:px-6 py-2.5 md:py-3">
                    <p className="text-white text-sm md:text-base font-medium">Yes, please.</p>
                  </div>
                </div>
                
                {/* Done message */}
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 md:px-5 py-2.5 md:py-3 flex items-center gap-2">
                    <p className="text-gray-700 text-sm md:text-base">Done</p>
                    <div className="w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Follow up message with blue glow */}
                <div className="flex justify-start relative">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 md:px-5 py-2.5 md:py-3 relative">
                    <p className="text-gray-700 text-sm md:text-base">We'll follow up shortly.</p>
                    {/* Blue glow effect */}
                    <div className="absolute -bottom-4 -right-6 w-24 h-24 bg-blue-400/40 rounded-full blur-2xl"></div>
                  </div>
                </div>
              </div>
              
              {/* Card Title and Description */}
              <div className="mt-8 md:mt-10">
                <h3 className="text-gray-900 text-2xl md:text-3xl font-bold mb-3 md:mb-4">Hiring</h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  We help businesses find candidates who are not just qualified, but aligned with their culture, goals, and long-term vision
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 md:space-y-8">
            {/* Description Box */}
            <div className="bg-gray-100 rounded-3xl p-6 md:p-8 lg:p-10">
              <p className="text-gray-800 text-base md:text-lg lg:text-xl leading-relaxed">
                Experience how our people-first recruitment approach simplifies hiring for companies and supports professionals through meaningful career moves.
              </p>
            </div>

            {/* Career Guidance Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 lg:p-10 shadow-lg">
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
                  <div className="grid grid-cols-2 gap-2 mb-5">
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
                  <div className="space-y-2 mb-5">
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-gray-900 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div className="h-1.5 bg-gray-300 rounded flex-1"></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-gray-900 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div className="h-1.5 bg-gray-300 rounded flex-1"></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-gray-900 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div className="h-1.5 bg-gray-300 rounded w-4/5"></div>
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
                <h3 className="text-gray-900 text-2xl md:text-3xl font-bold mb-3 md:mb-4">Career Guidance</h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Guidance to strengthen profiles, improve visibility, and move toward meaningful opportunities.
                </p>
              </div>
            </div>

            {/* Explore More Link */}
            <div className="flex justify-end pt-4">
              <a href="#" className="group inline-flex items-center gap-2 text-gray-900 text-lg md:text-xl font-semibold border-b-2 border-gray-900 pb-1 hover:text-indigo-600 hover:border-indigo-600 transition-colors">
                Explore More
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}