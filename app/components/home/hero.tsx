"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();
  return (
    <>
      {/* Fixed hero that stays in place while content scrolls over it on desktop, relative on mobile */}
      {/* Fixed hero that stays in place while content scrolls over it on desktop, relative on mobile -> Now FIXED always */}
      <div className="fixed top-0 left-0 w-screen h-[100dvh] z-0 overflow-hidden">
        {/* Background Images - Responsive */}
        {/* Mobile Image */}
        <img
          src="/home/hero1.png"
          alt="Professional recruitment and HR consulting services - JB Recruitments"
          className="absolute inset-0 w-full h-full object-cover object-[75%_70%] block sm:hidden"
        />
        {/* Desktop/Tablet Image */}
        <img
          src="/home/hero-background.png"
          alt="Professional recruitment and HR consulting services - JB Recruitments"
          className="absolute inset-0 w-full h-full object-cover object-[80%_100%] sm:object-[85%_90%] md:object-[80%_90%] lg:object-[80%_100%] xl:object-[900%_45%] hidden sm:block"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />

        {/* Content (positioned over the image) */}
        <div className="absolute inset-0 flex flex-col">
          {/* Hero Content */}
          <div className="flex-1 flex items-center px-4 sm:px-6 md:px-12 lg:px-36 py-8 md:py-0 mt-16 sm:mt-20">
            <div className="w-full max-w-7xl mx-auto">
              {/* ... content remains ... */}
              <div className="max-w-2xl lg:max-w-3xl">
                {/* Main Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-semibold leading-[1.1] mb-6 md:my-8 crimson">
                    <div className="">Thoughtful</div>
                    <div className="">Hiring. Real</div>
                    <div className="">Outcomes.</div>
                  </h1>
                </motion.div>

                {/* Subtext */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <p className="text-[#D6D6D6] text-base md:text-lg 2xl:text-xl leading-relaxed mb-4 md:mb-10 max-w-xl md:max-w-3xl w-full raleway">
                    JB is more than a recruitment agency - we’re a brand
                    defining trust, visibility & lasting impact. At JB, we help
                    companies hire the right people, fast. Our process is
                    simple, people-first & built to deliver the talent you need,
                    exactly when you need it.
                  </p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="block sm:hidden items-center mx-auto">
                      <motion.span
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: [8, 0, 8] }}
                        transition={{ duration: 3.2, ease: "easeInOut" }}
                        whileHover={{ scale: 1.06 }}
                        className="inline-flex items-center gap-3 bg-white/2 border border-[#caa42b] text-[#e1b223] px-6 py-3 rounded-full text-sm sm:text-base font-semibold shadow-[0_0px_60px_rgba(202,164,43,0.14)] transform transition-all duration-300 ring-1 ring-[#caa42b]/25 backdrop-blur-md mb-2"
                        aria-label="JB - A brand by Juhi Bhatia"
                      >
                        <span className="leading-tight drop-shadow-[0_6px_12px_rgba(0,0,0,0.25)]">
                          JB - A brand by Juhi Bhatia
                        </span>
                      </motion.span>
                    </div>
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

      {/* Spacer to push content below the fixed hero (always needed now that hero is fixed) */}
      <div className="block h-[100dvh]" aria-hidden />
    </>
  );
}
