"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    id: "01",
    title: "Discover & Understand",
    description:
      "We begin by understanding role needs, team culture, and goals — along with a candidate’s experience, strengths, and career direction — to create clarity before moving forward.",
  },
  {
    id: "02",
    title: "Source & Evaluate",
    description:
      "We source talent thoughtfully, evaluating skills, mindset, cultural fit, and growth potential — going beyond resumes to identify candidates who align with both role and organisation.",
  },
  {
    id: "03",
    title: "Review & Align",
    description:
      "We review shortlisted profiles in depth, aligning expectations, fit, and direction on both sides to ensure focused interviews and confident, informed hiring decisions.",
  },
  {
    id: "04",
    title: "Connect & Support",
    description:
      "We coordinate interviews, communication, and next steps while staying involved through decisions and onboarding — ensuring a smooth, transparent, and supportive hiring experience.",
  },
];

export default function HiringJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const items = containerRef.current?.querySelectorAll("[data-step]");
    if (!items) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-step"));
            setActiveIndex(index);
          }
        });
      },
      {
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      }
    );

    items.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 md:gap-14 lg:gap-16 lg:grid-cols-12">
          {/* LEFT (Sticky) */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-indigo-600">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100">
                  ⇄
                </span>
                Our Process
              </div>

              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                The Hiring Journey
              </h2>

              <p className="mt-4 md:mt-6 max-w-md text-base md:text-lg leading-relaxed text-slate-600">
                We follow a clear, structured recruitment process designed to
                create alignment, clarity, and meaningful outcomes for both
                companies and professionals.
              </p>
            </div>
          </div>

          {/* RIGHT (Scrollable Timeline) */}
          <div ref={containerRef} className="relative lg:col-span-8">
            {/* Vertical line */}
            <div className="absolute left-[20px] md:left-[28px] top-0 h-full w-px bg-slate-200" />

            <div className="space-y-16 md:space-y-20 lg:space-y-24">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  data-step={index}
                  className="relative flex gap-6 md:gap-8 lg:gap-10"
                >
                  {/* Number */}
                  <div className="w-10 md:w-14 shrink-0 text-right">
                    <span
                      className={`text-3xl md:text-4xl font-semibold transition-colors duration-300 ${
                        activeIndex === index
                          ? "text-indigo-600"
                          : "text-indigo-300"
                      }`}
                    >
                      {step.id}
                    </span>
                  </div>

                  {/* Content */}
                  <div
                    className={`max-w-xl transform transition-all duration-500 ${
                      activeIndex === index
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-40"
                    }`}
                  >
                    <h3 className="text-lg md:text-xl font-semibold text-slate-900">
                      {step.title}
                    </h3>

                    <p className="mt-3 md:mt-4 text-sm md:text-base leading-relaxed text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline end dot */}
            <div className="absolute bottom-0 left-[18px] md:left-[26px] h-2 w-2 rounded-full bg-slate-400" />
          </div>
        </div>
      </div>
    </section>
  );
}
