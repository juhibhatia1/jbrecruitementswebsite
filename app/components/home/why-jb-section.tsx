"use client";

import Image from "next/image";
import { PiBrainLight } from "react-icons/pi";
import { BsCheckCircleFill } from "react-icons/bs";
import React from "react";
import ScrollAnimation from "../ui/scroll-animation";
import Link from "next/link";

export default function WhyJBSection() {
  const features = [
    "Thoughtful & Fast Hiring",
    "Insight-Led Recommendations",
    "Quality Over Volume",
    "Clear Communication",
    "Empowering Both Sides",
  ];

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 md:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left Image */}
          <ScrollAnimation
            variant="scaleUp"
            className="relative h-[200px] sm:h-[350px] md:h-[400px] lg:h-[450px] w-full overflow-hidden rounded-lg"
          >
            <Image
              src="/logo.avif"
              alt="Professional workspace with laptop and office supplies"
              fill
              className="object-contain"
              priority
            />
          </ScrollAnimation>

          {/* Right Content */}
          <ScrollAnimation variant="fadeUp" delay={0.2}>
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <PiBrainLight size={24} className="text-[#605dba]" />
                  <span
                    className="text-[#605dba] text-base md:text-lg font-semibold tracking-wide"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    Why JB
                  </span>
                </div>

                <h2
                  className="text-[#252E3D] text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-semibold leading-[1.1]"
                >
                  Why Choose Us
                </h2>

                <p
                  className="text-[#252E3D] text-base md:text-lg lg:text-xl leading-relaxed max-w-lg"
                  style={{ fontFamily: "Crimson Text, serif" }}
                >
                  Insight-driven recommendations that match role, culture &
                  long-term fit.
                </p>
              </div>

              {/* Features List - Pills */}
              <div className="flex flex-wrap gap-3">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm hover:border-[#605dba]/30 transition-colors duration-300"
                  >
                    <BsCheckCircleFill className="text-[#4CD964] text-xl flex-shrink-0" />
                    <span
                      className="text-[#3c4656] text-sm sm:text-base font-medium"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Link
                  href="/contact-us"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-radial-[at_50%_75%] from-[#5a58ab] to-[#5d8aba] text-white font-semibold rounded-full transition-all duration-300 text-lg hover:shadow-[0_6px_20px_rgba(74,144,226,0.23)] hover:scale-105 ease-in-out"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
