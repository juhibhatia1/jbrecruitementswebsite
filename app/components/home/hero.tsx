"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();
  return (
    <>
      {/* Fixed hero that stays in place while content scrolls over it on desktop, relative on mobile */}
      <div className="relative md:fixed top-0 left-0 w-full h-screen z-0">
        {/* Background Image */}
        <img
          src="/home/hero-background.avif"
          alt="Professional recruitment and HR consulting services - JB Recruitment Solutions team"
          className="absolute inset-0 w-full h-full object-cover object-right md:object-fill"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />

        {/* Content (positioned over the image) */}
        <div className="absolute inset-0 flex flex-col">
          {/* Hero Content */}
          <div className="flex-1 flex items-center px-4 sm:px-6 md:px-12 lg:px-36 py-8 md:py-0 mt-16 sm:mt-20">
            <div className="w-full max-w-7xl mx-auto">
              <div className="max-w-2xl lg:max-w-3xl">
                {/* Main Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-semibold leading-[1.1] mb-6 md:my-8">
                    <div className="">Thoughtful</div>
                    <div className="">Hiring. Real</div>
                    <div className="">Outcomes</div>
                  </h1>
                </motion.div>

                {/* Subtext */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <p
                    className="text-[#D6D6D6] text-base md:text-lg 2xl:text-xl leading-relaxed mb-8 md:mb-10 max-w-2xl w-full"
                    style={{ fontFamily: "Geist, sans-serif" }}
                  >
                    At JB, we help companies hire the right people, fast. Our
                    process is simple, people-first, and built to deliver the
                    talent you need, exactly when you need it.
                  </p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      className="bg-[#3399FE] text-white px-7 py-3.5 md:px-8 md:py-4 rounded-full text-base md:text-lg font-medium hover:bg-[#285b8d] transition-all shadow-lg cursor-pointer"
                      onClick={() => router.push("/companies")}
                    >
                      Build Your Team
                    </button>

                    <button
                      className="bg-transparent border border-white/80 text-white px-7 py-3.5 md:px-8 md:py-4 rounded-full text-base md:text-lg font-medium hover:scale-105 transform transition-all backdrop-blur-sm ease-in-out duration-300 cursor-pointer"
                      onClick={() => router.push("/job-seekers")}
                    >
                      Explore Opportunities
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to push content below the fixed hero (only needed on desktop) */}
      <div className="hidden md:block h-screen" aria-hidden />
    </>
  );
}
