"use client";

import Image from "next/image";
import { PiBrain, PiBrainLight } from "react-icons/pi";
import { RxArrowTopRight } from "react-icons/rx";
import React from "react";

export default function WhyJBSection() {
  const [hoveredLink, setHoveredLink] = React.useState(false);
  return (
    <section className="w-full bg-white py-20 border-t border-slate-200" style={{ fontFamily: 'Palatino Linotype, sans-serif' }}>
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-[#605dc8]" style={{ fontFamily: 'Geist, sans-serif' }}>
            <PiBrainLight size={24} />
            <span className="text-[#605dba] text-base md:text-lg font-medium">
              Why JB
            </span>
          </p>

          <h2 className="mx-auto max-w-3xl text-[#252e3d] text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-semibold leading-tight">
            The Challenges behind hiring and career moves.
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-[#252e3d]" style={{ fontFamily: 'Palatino Linotype, sans-serif' }}>
            We deliver people-first recruitment support that balances speed,
            clarity, and long-term alignment — helping companies hire better and
            professionals move forward with confidence.
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-16 lg:gap-8">
          {/* Left Image Card */}
          <div className="relative h-64 overflow-hidden rounded-2xl md:h-full md:col-span-2 lg:col-span-4 lg:row-span-2">
            <Image
              src="/home/imgg.png"
              alt="Abstract visual"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Clear & Thoughtful Hiring */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-2 md:p-4 lg:p-6 md:col-span-2 lg:col-span-8">
            <p className="text-6xl font-semibold text-[#252e3d]">
              Clear
              <span className="block text-3xl font-semibold text-slate-800" style={{ fontFamily: 'Geist, sans-serif' }}>
                & Thoughtful Hiring
              </span>
            </p>

            <p className="mt-6 text-lg text-bottom leading-relaxed text-[#252e3d]">
              Built on transparent communication, realistic expectations, and
              carefully evaluated profiles.
            </p>
          </div>

          {/* 3x Faster Hiring */}
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#5f5dbb] to-[#4077de] p-2 md:p-4 lg:p-6 text-white md:col-span-2 lg:col-span-4">
            <p className="text-6xl font-semibold">3x</p>
            <p className="mt-1 text-3xl font-medium" style={{ fontFamily: 'Geist, sans-serif' }}>Faster Hiring Cycles</p>

            <p className="mt-6 text-lg leading-relaxed text-white">
              Reduced time-to-hire through structured screening and role-aligned
              shortlisting.
            </p>

            {/* Subtle background arrow */}
            <div className="pointer-events-none absolute bottom-6 right-6 text-indigo-500 opacity-30">
              ➜
            </div>
          </div>

          {/* 120+ Proven Hiring Outcomes (left bottom) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-2 md:p-4 lg:p-6 md:col-span-2 lg:col-span-4">
            <p className="text-6xl font-semibold text-[#252e3d]">120+</p>
            <p className="mt-1 text-3xl font-semibold text-[#252e3d]" style={{ fontFamily: 'Geist, sans-serif' }}>
              Proven Hiring Outcomes
            </p>

            <p className="mt-6 text-lg leading-relaxed text-[#252e3d]">
              Consistent placements across roles, industries, and experience
              levels.
            </p>
          </div>

          {/* Support That Evolves Over Time (right bottom) */}
          <div className="flex flex-col justify-between rounded-2xl bg-slate-800 p-2 md:p-4 lg:p-6 text-white md:col-span-2 lg:col-span-8">
            <p className="text-5xl font-semibold">
              Support That Evolves Over Time
            </p>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white">
              We stay involved beyond a single hire — adapting our support as
              teams grow and careers progress.
            </p>
          </div>
          {/* Proven Hiring Outcomes */}
        </div>

        {/* CTA */}
        <div className="mt-12 text-right">
          <a
            href="#"
            className="inline-flex items-center gap-1 text-[#2c3543] border-b border-slate-900 transition duration-300 ease-in-out text-2xl"
            onMouseEnter={() => setHoveredLink(true)}
            onMouseLeave={() => setHoveredLink(false)}
            style={{ fontFamily: 'Geist, sans-serif' }}
          >
            Get to Know Us
            <RxArrowTopRight
              size={20}
              className={`transform transition-transform duration-300 ${
                hoveredLink ? "rotate-45 translate-x-1" : "rotate-0"
              }`}
            />
          </a>
        </div>
      </div>
    </section>
  );
}
