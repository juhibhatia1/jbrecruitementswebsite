"use client";

import Image from "next/image";
import ScrollAnimation from "../ui/scroll-animation";
import { PiCubeLight } from "react-icons/pi";

export default function FounderSection() {
  return (
    <section className="w-full bg-[#FAFAFA] pb-12 md:pb-20">
      <div className="mx-auto max-w-4xl px-6 md:px-8 lg:px-12 text-center">
        <ScrollAnimation variant="fadeUp">
          {/* Label */}
          <div className="inline-flex items-center justify-center gap-2 mb-6">
            <PiCubeLight className="text-[#605dba] text-xl" />
            <span
              className="text-[#605dba] font-medium text-sm sm:text-base"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              Meet the Founder
            </span>
          </div>

          {/* Title */}
          <h2
            className="text-[#252E3D] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-6 md:mb-8 leading-tight"
          >
            Leadership Grounded in Experience
          </h2>

          {/* Bio Text */}
          <p
            className="text-[#252E3D] text-base md:text-lg leading-loose mb-12 text-justify md:text-center"
          >
            With over 11 years of international recruitment experience across
            the UK, Europe, the Middle East, and the USA, Juhi Bhatia brings a
            people-first, globally informed approach to talent acquisition.
            Recognised as one of the Arab Female Leaders, Juhi has led hiring
            across diverse industries and roles, helping organisations build
            aligned teams while guiding professionals toward meaningful career
            growth. Her work is rooted in a simple belief: when hiring is
            thoughtful and human, outcomes naturally improve - for businesses
            and for people.
          </p>

          {/* Profile Card */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mb-3">
              <Image
                src="/founder.avif"
                alt="Juhi Bhatia"
                fill
                className="object-cover"
              />
            </div>
            <h3
              className="text-[#252E3D] text-base sm:text-lg font-semibold mb-0.5"
            >
              Juhi Bhatia
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm">Founder of JB</p>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
