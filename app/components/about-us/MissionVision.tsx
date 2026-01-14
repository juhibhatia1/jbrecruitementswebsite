"use client";

import Image from "next/image";
import ScrollAnimation from "../ui/scroll-animation";

export default function MissionVision() {
  return (
    <section className="w-full bg-[#FAFAFA] pb-12 md:pb-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
          {/* Left: Large Image */}
          <ScrollAnimation
            variant="scaleUp"
            className="relative min-h-[300px] md:min-h-[400px] lg:h-full w-full rounded-3xl overflow-hidden shadow-sm"
          >
            <Image
              src="/about-us/about-us.svg" // Note: Need to make sure this image exists or use placeholder
              alt="Team collaborating in a modern office"
              fill
              className="object-contain"
            />
          </ScrollAnimation>

          {/* Right: Mission & Vision Cards */}
          <div className="flex flex-col gap-4 lg:gap-6 h-full">
            {/* Our Mission Card */}
            <ScrollAnimation
              variant="fadeUp"
              delay={0.2}
              className="flex-1 bg-gradient-to-br from-white to-[#E6E6FA] p-6 md:p-10 rounded-3xl shadow-sm border border-white/50"
            >
              <h2
                className="text-[#252E3D] text-2xl md:text-3xl font-bold mb-4"
                style={{ fontFamily: "Geist, sans-serif" }}
              >
                Our Mission
              </h2>
              <p
                className="text-[#252E3D] text-[15px] md:text-base leading-relaxed"
                style={{ fontFamily: "Palatino Linotype, serif" }}
              >
                JB is a recruitment agency dedicated to creating meaningful
                connections between companies and talented professionals. We
                believe hiring should feel thoughtful, structured, and
                positively human - not rushed or transactional.
              </p>
            </ScrollAnimation>

            {/* Our Vision Card */}
            <ScrollAnimation
              variant="fadeUp"
              delay={0.3}
              className="flex-1 bg-[#252E3D] relative overflow-hidden p-6 md:p-10 rounded-3xl shadow-lg"
            >
              {/* Abstract checkerboard pattern overlay (CSS/SVG) */}
              <div
                className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)",
                  backgroundSize: "40px 40px",
                  backgroundPosition: "0 0, 20px 20px",
                }}
              />

              <h2
                className="text-white text-2xl md:text-3xl font-bold mb-4 relative z-10"
                style={{ fontFamily: "Geist, sans-serif" }}
              >
                Our Vision
              </h2>
              <p
                className="text-gray-200 text-[15px] md:text-base leading-relaxed relative z-10"
                style={{ fontFamily: "Palatino Linotype, serif" }}
              >
                To be the trusted bridge between growing companies and ambitious
                professionals, setting new standards for recruitment excellence.
              </p>
            </ScrollAnimation>
          </div>
        </div>
      </div>
    </section>
  );
}
