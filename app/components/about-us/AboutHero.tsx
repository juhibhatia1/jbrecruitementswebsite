"use client";

import ScrollAnimation from "../ui/scroll-animation";

export default function AboutHero() {
  return (
    <section className="relative w-full bg-[#FAFAFA] pt-20 sm:pt-24 pb-12 md:pb-16 overflow-hidden">
      {/* Background Gradient similar to design if needed, or keep clean white/gray */}

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <ScrollAnimation variant="fadeUp">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-12 items-start">
            {/* Left: Title */}
            <div className="col-span-1">
              <h1 className="text-[#252E3D] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                About Us
              </h1>
            </div>

            {/* Right: Text Content */}
            <div className="space-y-6 col-span-2">
              <p className="text-[#252E3D] text-base md:text-lg leading-loose">
                JB is a recruitment brand dedicated to creating meaningful
                connections between companies and talented professionals. We
                believe hiring should feel thoughtful, structured, and
                positively human - not rushed or transactional.
              </p>

              <blockquote className="relative">
                <p className="text-[#252E3D] text-lg md:text-xl font-bold leading-tight">
                  "Hiring can be efficient and humane at the same time."
                </p>
              </blockquote>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
