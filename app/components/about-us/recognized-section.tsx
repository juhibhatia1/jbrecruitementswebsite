"use client";

import Image from "next/image";
import Link from "next/link";
import { RxArrowTopRight } from "react-icons/rx";
import { BiWorld } from "react-icons/bi";
import ScrollAnimation from "../ui/scroll-animation";

export default function RecognizedSection() {
  return (
    <section className="w-full relative py-12 md:py-16 lg:py-16 pb-20 md:pb-28 overflow-hidden">
      {/* Video Background for the entire section */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover scale-110 pointer-events-none z-0"
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
        <ScrollAnimation variant="fadeUp">
          <div
            className="rounded-[40px] p-6 sm:p-10 md:p-12 2xl:p-16 text-center text-white relative overflow-hidden shadow-2xl bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/about-us/card-bg-image.jpeg')" }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-[#414956]/60 rounded-[40px]"></div>
            {/* Dark square tiles pattern - top left corner */}
            {/* <div
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{
                background:
                  "repeating-conic-gradient(from 0deg, #1a222e 0deg 90deg, transparent 90deg 180deg) 0 0 / 52px 52px",
                maskImage:
                  "radial-gradient(ellipse 80% 80% at 0% 0%, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 80% 80% at 0% 0%, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)",
              }}
            ></div> */}
            {/* Dark square tiles pattern - bottom right corner */}
            {/* <div
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{
                background:
                  "repeating-conic-gradient(from 0deg, #1a222e 0deg 90deg, transparent 90deg 180deg) 0 0 / 52px 52px",
                maskImage:
                  "radial-gradient(ellipse 80% 80% at 100% 100%, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 80% 80% at 100% 100%, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)",
              }}
            ></div> */}

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
                Make Your Next Hire Count
              </h2>

              {/* Description */}
              <p
                className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 leading-relaxed mb-12 max-w-4xl mx-auto"
                style={{ fontFamily: "Palatino Linotype, serif" }}
              >
                We believe hiring should be fast, thoughtful, and human-centred.
                By focusing on quality, transparency, and real candidate
                potential not just resumes.We help businesses build strong teams
                and empower job seekers to move forward with confidence.
              </p>

              {/* Founder Section */}
              <div className="flex justify-center items-center gap-4 mb-12">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 shadow-xl">
                  <Image
                    src="/founder.avif"
                    alt="Juhi Bhatia - Founder of JB"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-center">
                  <p
                    className="font-semibold text-base sm:text-lg text-white"
                    style={{ fontFamily: "Geist, sans-serif" }}
                  >
                    Juhi Bhatia
                  </p>
                  <p
                    className="text-white/60 text-xs sm:text-sm font-medium tracking-wide"
                    style={{ fontFamily: "Geist, sans-serif" }}
                  >
                    Founder of JB
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href="/contact-us"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#605dba] hover:bg-[#534eb8] text-white font-medium rounded-full transition-all duration-300 text-lg shadow-[0_10px_20px_rgba(96,93,186,0.3)] hover:shadow-[0_15px_25px_rgba(96,93,186,0.4)] hover:-translate-y-1 group"
                style={{ fontFamily: "Geist, sans-serif" }}
              >
                Contact
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
