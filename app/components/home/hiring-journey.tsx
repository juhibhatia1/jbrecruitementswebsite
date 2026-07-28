"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CiRoute } from "react-icons/ci";
import { RxArrowTopRight } from "react-icons/rx";
import { IoBriefcaseOutline } from "react-icons/io5";
import { motion, useScroll, useSpring } from "framer-motion";
import ScrollAnimation from "../ui/scroll-animation";

const steps = [
  {
    id: "01",
    title: "Discover & Understand",
    description:
      "We begin by understanding role needs, team culture, and goals - along with a candidate’s experience, strengths, and career direction - to create clarity before moving forward.",
  },
  {
    id: "02",
    title: "Source & Evaluate",
    description:
      "We source talent thoughtfully, evaluating skills, mindset, cultural fit, and growth potential - going beyond resumes to identify candidates who align with both role and organisation.",
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
      "We coordinate interviews, communication, and next steps while staying involved through decisions and onboarding - ensuring a smooth, transparent, and supportive hiring experience.",
  },
];

export default function HiringJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 50%"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

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
      },
    );

    items.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-white py-12 md:py-16 lg:py-20 border-t border-[#bababa]">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:gap-12 lg:gap-14 lg:grid-cols-12">
          {/* LEFT (Sticky) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <ScrollAnimation variant="fadeUp">
                <div
                  className="mb-3 flex items-center gap-2 text-[#605dba] text-base md:text-lg font-medium"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  <CiRoute size={24} />
                  Our Process
                </div>

                <h2 className="text-[#252e3d] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  The Hiring Journey
                </h2>

                <p className="mt-4 md:mt-6 max-w-md text-base md:text-lg leading-relaxed text-[#252e3d]">
                  We follow a clear, structured recruitment process designed to
                  create alignment, clarity, and meaningful outcomes for both
                  companies and professionals.
                </p>

                <div className="hidden lg:block relative mt-8 max-w-md overflow-hidden rounded-2xl border border-[#d9d5f7] border-l-4 border-l-[#5a58ab] bg-linear-to-br from-[#eeecff] via-[#f5f4ff] to-white p-6 shadow-[0_18px_45px_rgba(96,93,186,0.18)] sm:p-8">
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e7e4ff] text-[#5a58ab] shadow-sm">
                      <IoBriefcaseOutline size={24} />
                    </div>

                    <p className="mt-5 text-base font-semibold uppercase tracking-[0.18em] text-[#605dba]">
                      Areas of specialization
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2.5">
                      <span className="inline-flex items-center rounded-full border border-[#dcd8f8] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#5a58ab] shadow-sm">
                        IT
                      </span>
                      <span className="inline-flex items-center rounded-full border border-[#dcd8f8] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#5a58ab] shadow-sm">
                        Technology
                      </span>
                      <span className="inline-flex items-center rounded-full border border-[#dcd8f8] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#5a58ab] shadow-sm">
                        Finance
                      </span>
                    </div>

                    <div className="mt-7 h-px w-full bg-[#e3e0f7]" />

                    <p className="mt-7 text-base leading-relaxed text-[#3d4557] md:text-lg">
                      <span className="font-semibold text-[#252e3d]">
                        Our expertise lies in IT, Tech and Finance recruitment,
                        helping businesses access top talent across global
                        markets.
                      </span>{" "}<br/><br/>
                      Beyond our core expertise, we support organizations across a wide range of industries with their recruitment needs.
                    </p>
                  </div>
                </div>
              </ScrollAnimation>

              {/* Hiring image + CTA — fills the sticky space beside the timeline (desktop) */}
              {/* <div className="mt-8 hidden lg:block">
                <div className="relative h-95 w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 shadow-[0_16px_50px_rgba(37,55,77,0.1)]">
                  <Image
                    src="/home/image.jpg"
                    alt="A recruitment team collaborating and shaking hands during a hiring meeting"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover object-[center_28%]"
                  />
                </div>

                <div className="mt-6 max-w-md">
                  <p className="text-lg font-semibold text-[#252e3d]">
                    Ready to find your next great hire?
                  </p>
                  <Link
                    href="/contact-us"
                    className="group mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#252e3d] px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1f2733] hover:shadow-[0_10px_20px_rgba(0,0,0,0.12)]"
                  >
                    Start hiring with us
                    <RxArrowTopRight className="h-4 w-4 transform transition-transform duration-300 group-hover:rotate-45 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div> */}
            </div>
          </div>

          {/* RIGHT (Scrollable Timeline) */}
          <div ref={containerRef} className="relative lg:col-span-7">
            {/* Background Line */}
            <div className="absolute left-[20px] md:left-[28px] top-0 bottom-0 w-px bg-gray-200" />

            {/* Progress Line */}
            <motion.div
              className="absolute left-[20px] md:left-[28px] top-0 w-px bg-black origin-top p-[0.75px]"
              style={{ scaleY, height: "100%" }}
            />

            <div className="space-y-16 md:space-y-16">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  data-step={index}
                  className="relative flex gap-6 md:gap-8 lg:gap-10"
                >
                  {/* Mask the line for the last item */}
                  {index === steps.length - 1 && (
                    <div className="absolute left-[20px] md:left-[28px] top-10 bottom-0 w-1 bg-white z-20" />
                  )}

                  {/* Number */}
                  <div className="w-10 md:w-14 shrink-0 text-right z-10">
                    <span
                      className={`relative inline-block text-3xl md:text-4xl font-semibold bg-white py-1 px-2 transition-colors duration-300 ${
                        activeIndex === index
                          ? "text-[#4e6bcd]"
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
                    <h3 className="text-md md:text-xl lg:text-3xl font-semibold text-slate-900">
                      {step.title}
                    </h3>

                    <p className="mt-3 md:mt-4 text-sm md:text-base lg:text-lg leading-relaxed text-[#252e3d]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* White overlay for the bottom part of the last item to stop the line cleanly if desired, 
                but with progress line it might look better continuous. 
                I removed the separate white cutout div to rely on z-index or just letting it flow. 
                The user asked for "darkened as we go down", which implies filling up.
            */}
          </div>
        </div>

        {/* MOBILE ONLY SPECIALIZATION CARD */}
        <ScrollAnimation variant="fadeUp" className="block lg:hidden mt-10">
          <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-[#d9d5f7] border-l-4 border-l-[#5a58ab] bg-linear-to-br from-[#eeecff] via-[#f5f4ff] to-white p-6 shadow-[0_18px_45px_rgba(96,93,186,0.18)] sm:p-8">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e7e4ff] text-[#5a58ab] shadow-sm">
                <IoBriefcaseOutline size={24} />
              </div>

              <p className="mt-5 text-base font-semibold uppercase tracking-[0.18em] text-[#605dba]">
                Areas of specialization
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <span className="inline-flex items-center rounded-full border border-[#dcd8f8] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#5a58ab] shadow-sm">
                  IT
                </span>
                <span className="inline-flex items-center rounded-full border border-[#dcd8f8] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#5a58ab] shadow-sm">
                  Technology
                </span>
                <span className="inline-flex items-center rounded-full border border-[#dcd8f8] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#5a58ab] shadow-sm">
                  Finance
                </span>
              </div>

              <div className="mt-7 h-px w-full bg-[#e3e0f7]" />

              <p className="mt-7 text-base leading-relaxed text-[#3d4557] md:text-lg">
                <span className="font-semibold text-[#252e3d]">
                  Our expertise lies in IT, Tech and Finance recruitment,
                  helping businesses access top talent across global
                  markets.
                </span>{" "}<br/><br/>
                Beyond our core expertise, we support organizations across a wide range of industries with their recruitment needs.
              </p>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
