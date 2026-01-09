"use client";

import Image from "next/image";
import Link from "next/link";
import { RxArrowTopRight } from "react-icons/rx";
import { BiWorld } from "react-icons/bi";
import ScrollAnimation from "../ui/scroll-animation";

export default function RecognizedSection() {
  return (
    <section className="w-full bg-[#F9F9FB] py-12 md:py-16 lg:py-20 pb-20 md:pb-28">
      <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
        <ScrollAnimation variant="fadeUp">
          <div className="bg-[#18181b] rounded-[40px] p-10 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              ></div>
            </div>
            {/* Subtle Gradient Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#605dba]/10 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3"></div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 mb-10 backdrop-blur-sm">
                <BiWorld size={18} className="text-white/80" />
                <span
                  className="text-sm font-medium tracking-wide text-white/90"
                  style={{ fontFamily: "Geist, sans-serif" }}
                >
                  Global Recognition
                </span>
              </div>

              {/* Title */}
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold leading-tight mb-6 md:mb-8 tracking-tight"
                style={{ fontFamily: "Geist, sans-serif" }}
              >
                Recognized for People-First Recruitment
              </h2>

              {/* Description */}
              <p
                className="text-base md:text-xl lg:text-2xl text-white/80 leading-relaxed mb-12 max-w-3xl mx-auto"
                style={{ fontFamily: "Palatino Linotype, serif" }}
              >
                Juhi Bhatia brings 11+ years of global recruitment experience
                across the UK, Europe, the Middle East, and the USA — building
                people-first hiring systems that align talent, culture, and
                long-term growth
              </p>

              {/* Founder Section */}
              <div className="flex flex-col items-center gap-4 mb-12">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 shadow-xl">
                  <Image
                    src="/founder.jpeg"
                    alt="Juhi Bhatia - Founder of JB"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-center">
                  <p
                    className="font-semibold text-lg text-white"
                    style={{ fontFamily: "Geist, sans-serif" }}
                  >
                    Juhi Bhatia
                  </p>
                  <p
                    className="text-white/60 text-sm font-medium tracking-wide"
                    style={{ fontFamily: "Geist, sans-serif" }}
                  >
                    Founder of JB
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href="/about"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#605dba] hover:bg-[#534eb8] text-white font-medium rounded-full transition-all duration-300 text-lg shadow-[0_10px_20px_rgba(96,93,186,0.3)] hover:shadow-[0_15px_25px_rgba(96,93,186,0.4)] hover:-translate-y-1 group"
                style={{ fontFamily: "Geist, sans-serif" }}
              >
                Explore the Journey
                <RxArrowTopRight
                  size={20}
                  className="transform group-hover:rotate-45 group-hover:translate-x-1 transition-transform duration-300"
                />
              </Link>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
