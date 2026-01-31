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
            className="relative min-h-[300px] md:min-h-[400px] lg:h-full w-full rounded-3xl overflow-hidden"
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
              className="flex-1 bg-gradient-to-br from-white to-[#E6E6FA] p-6 md:p-10 rounded-3xl border border-[#E6E6FA]"
            >
              <h2 className="text-[#252E3D] text-xl sm:text-2xl md:text-3xl font-bold mb-4">
                Our Mission
              </h2>
              <p className="text-[#252E3D] text-[15px] md:text-base leading-relaxed">
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
              className="flex-1 bg-[#252E3D] relative overflow-hidden p-6 md:p-10 rounded-3xl"
            >
              {/* Grid of squares pattern overlay with gradient fade */}
              <div
                className="absolute top-0 right-0 w-2/3 h-full pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                  maskImage:
                    "linear-gradient(to left, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to left, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
                }}
              />

              <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-4 relative z-10">
                Our Vision
              </h2>
              <p className="text-gray-200 text-[15px] md:text-base leading-relaxed relative z-10">
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
