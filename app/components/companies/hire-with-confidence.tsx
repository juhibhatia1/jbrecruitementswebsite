"use client";

import Image from "next/image";
import { BsCheckCircleFill } from "react-icons/bs";
import ScrollAnimation from "../ui/scroll-animation";

export default function HireWithConfidence() {
  return (
    <section className="w-full bg-white py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
        {/* Header */}
        <ScrollAnimation variant="fadeUp">
          <div className="text-center mb-10 md:mb-14">
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
              Hiring is one of the most crucial decisions a business makes. At
              JB Solutions, we treat it with the importance it deserves. Our
              recruitment approach goes beyond matching skills - we look at
              culture compatibility, long-term potential, and the real impact a
              candidate can bring to the team.
            </p>
          </div>
        </ScrollAnimation>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {/* Complete Recruitment Support Card */}
            <ScrollAnimation variant="fadeUp" delay={0.1}>
              <div className="bg-gradient-to-br from-[#4f46e5] to-[#3730a3] rounded-3xl p-8 md:p-12 text-white overflow-hidden relative min-h-[540px] flex flex-col justify-between shadow-2xl">
                {/* Background Image */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none mix-blend-overlay opacity-40">
                  <div className="relative w-full h-full">
                    <Image
                      src="/home/why-jb.png"
                      alt="Background"
                      fill
                      className="object-cover object-bottom"
                    />
                  </div>
                </div>

                <div className="relative z-10">
                  <h2
                    className="text-3xl md:text-4xl lg:text-[42px] font-bold mb-10 leading-tight"
                    style={{ fontFamily: "Geist, sans-serif" }}
                  >
                    Complete Recruitment Support
                  </h2>

                  <div className="space-y-8">
                    <div>
                      <div className="flex items-start gap-3 mb-2">
                        <BsCheckCircleFill
                          className="text-[#22c55e] mt-1.5 flex-shrink-0"
                          size={20}
                        />
                        <h3
                          className="text-xl font-bold"
                          style={{ fontFamily: "Geist, sans-serif" }}
                        >
                          Requirement-Led Hiring
                        </h3>
                      </div>
                      <p
                        className="ml-8 text-white/90 leading-relaxed text-base md:text-lg"
                        style={{ fontFamily: "Palatino Linotype, serif" }}
                      >
                        We begin by understanding your role, team dynamics, and
                        expectations — not just a job description.
                      </p>
                    </div>

                    <div>
                      <div className="flex items-start gap-3 mb-2">
                        <BsCheckCircleFill
                          className="text-[#22c55e] mt-1.5 flex-shrink-0"
                          size={20}
                        />
                        <h3
                          className="text-xl font-bold"
                          style={{ fontFamily: "Geist, sans-serif" }}
                        >
                          Role & Culture Alignment
                        </h3>
                      </div>
                      <p
                        className="ml-8 text-white/90 leading-relaxed text-base md:text-lg"
                        style={{ fontFamily: "Palatino Linotype, serif" }}
                      >
                        Candidates are shortlisted based on skill fit, mindset,
                        and long-term compatibility with your team.
                      </p>
                    </div>

                    <div>
                      <div className="flex items-start gap-3 mb-2">
                        <BsCheckCircleFill
                          className="text-[#22c55e] mt-1.5 flex-shrink-0"
                          size={20}
                        />
                        <h3
                          className="text-xl font-bold"
                          style={{ fontFamily: "Geist, sans-serif" }}
                        >
                          Dedicated Hiring Support
                        </h3>
                      </div>
                      <p
                        className="ml-8 text-white/90 leading-relaxed text-base md:text-lg"
                        style={{ fontFamily: "Palatino Linotype, serif" }}
                      >
                        A single point of contact guides the process end-to-end,
                        ensuring clarity and continuity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>

            {/* Industry-Aware Screening Card */}
            <ScrollAnimation variant="fadeUp" delay={0.2}>
              <div className="relative bg-[#1f2937] rounded-3xl p-8 md:p-12 text-white overflow-hidden min-h-[540px] flex flex-col justify-center shadow-xl">
                {/* Background Image Placeholder (Eye) */}
                <div className="absolute inset-0 opacity-40 pointer-events-none">
                  {/* Placeholder for Eye Image - leveraging imgg.png if why-jb didn't cover it, or using gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1f2937]/50 to-[#1f2937]"></div>
                  <Image
                    src="/home/hero-background.jpg" // Using available asset as placeholder for eye
                    alt="Eye Background"
                    fill
                    className="object-cover object-center mix-blend-overlay"
                  />
                </div>
                {/* Dark Overlay to ensure text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#1f2937] via-[#1f2937]/90 to-transparent pointer-events-none"></div>

                <div className="relative z-10 max-w-lg">
                  <h2
                    className="text-3xl md:text-4xl lg:text-[42px] font-bold mb-10 leading-tight"
                    style={{ fontFamily: "Geist, sans-serif" }}
                  >
                    Industry-Aware Screening
                  </h2>

                  <div className="space-y-8">
                    <div>
                      <div className="flex items-start gap-3 mb-2">
                        <BsCheckCircleFill
                          className="text-[#22c55e] mt-1.5 flex-shrink-0"
                          size={20}
                        />
                        <h3
                          className="text-xl font-bold"
                          style={{ fontFamily: "Geist, sans-serif" }}
                        >
                          Role & Team Clarity
                        </h3>
                      </div>
                      <p
                        className="ml-8 text-white/90 leading-relaxed text-base md:text-lg"
                        style={{ fontFamily: "Palatino Linotype, serif" }}
                      >
                        We help define what success looks like for the role —
                        skills, mindset, and team fit.
                      </p>
                    </div>

                    <div>
                      <div className="flex items-start gap-3 mb-2">
                        <BsCheckCircleFill
                          className="text-[#22c55e] mt-1.5 flex-shrink-0"
                          size={20}
                        />
                        <h3
                          className="text-xl font-bold"
                          style={{ fontFamily: "Geist, sans-serif" }}
                        >
                          Informed Shortlisting
                        </h3>
                      </div>
                      <p
                        className="ml-8 text-white/90 leading-relaxed text-base md:text-lg"
                        style={{ fontFamily: "Palatino Linotype, serif" }}
                      >
                        Every profile is reviewed with context, not keywords, so
                        decisions are thoughtful and relevant.
                      </p>
                    </div>

                    <div>
                      <div className="flex items-start gap-3 mb-2">
                        <BsCheckCircleFill
                          className="text-[#22c55e] mt-1.5 flex-shrink-0"
                          size={20}
                        />
                        <h3
                          className="text-xl font-bold"
                          style={{ fontFamily: "Geist, sans-serif" }}
                        >
                          Hiring With Perspective
                        </h3>
                      </div>
                      <p
                        className="ml-8 text-white/90 leading-relaxed text-base md:text-lg"
                        style={{ fontFamily: "Palatino Linotype, serif" }}
                      >
                        We consider immediate needs and long-term impact before
                        moving candidates forward.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {/* Tailored Role-Based Search */}
            <ScrollAnimation variant="fadeUp" delay={0.2}>
              <div className="bg-[#f3f4fd] border-2 border-[#8b5cf6] rounded-3xl p-8 md:p-12 h-full min-h-[540px] shadow-[0_0_40px_rgba(139,92,246,0.15)] flex flex-col relative overflow-hidden">
                {/* Glow Effect */}
                <div className="absolute right-0 top-1/2 w-64 h-64 bg-blue-400/20 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                <div className="mb-10 space-y-4 relative z-10">
                  {/* Chat 1 */}
                  <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 inline-block max-w-[85%]">
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
                  <div className="flex items-center gap-2">
                    <div className="bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm flex items-center gap-2">
                      <span
                        className="text-sm font-medium text-[#1f2937]"
                        style={{ fontFamily: "Geist, sans-serif" }}
                      >
                        Done
                      </span>
                      <div className="w-4 h-4 rounded bg-[#22c55e] flex items-center justify-center">
                        <BsCheckCircleFill className="text-white" size={10} />
                      </div>
                    </div>
                  </div>

                  {/* Chat 4 (Follow up) */}
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm inline-block max-w-[85%] relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-50/50"></div>
                    <p
                      className="text-[#1f2937] text-sm relative z-10"
                      style={{ fontFamily: "Geist, sans-serif" }}
                    >
                      We'll follow up shortly.
                    </p>
                  </div>
                </div>

                <div className="mt-auto">
                  <h3
                    className="text-2xl md:text-3xl font-bold text-[#1f2937] mb-4"
                    style={{ fontFamily: "Geist, sans-serif" }}
                  >
                    Tailored Role-Based Search
                  </h3>
                  <p
                    className="text-[#4b5563] leading-relaxed text-base md:text-lg"
                    style={{ fontFamily: "Palatino Linotype, serif" }}
                  >
                    We help businesses find candidates who aren't just qualified
                    - but aligned. Our hiring process is structured, efficient,
                    and tailored to each organisation's culture and goals.
                  </p>
                </div>
              </div>
            </ScrollAnimation>

            {/* Quality-Driven Selection */}
            <ScrollAnimation variant="fadeUp" delay={0.3}>
              <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 h-full min-h-[540px] flex flex-col justify-center shadow-lg">
                <div className="mb-10 w-full max-w-sm mx-auto bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 p-6">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
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
                    className="text-2xl md:text-3xl font-bold text-[#1f2937] mb-4"
                    style={{ fontFamily: "Geist, sans-serif" }}
                  >
                    Quality-Driven Selection
                  </h3>
                  <p
                    className="text-[#4b5563] leading-relaxed text-base md:text-lg"
                    style={{ fontFamily: "Palatino Linotype, serif" }}
                  >
                    Gain clear visibility into candidate fit, hiring progress,
                    and next steps — so decisions feel confident, not rushed.
                  </p>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </div>
    </section>
  );
}
