"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();
  return (
    <>
      <div className="relative w-full min-h-[100dvh] flex items-center overflow-hidden">
        {/* Background Images - Responsive */}
        {/* Mobile Image */}
        <Image
          src="/home/hero1.avif"
          alt="JB Recruitments - Top Recruitment Agency and HR Consulting Workspace"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 w-full h-full object-cover object-[75%_70%] block sm:hidden"
        />
        {/* XL+ AVIF Image (visible only on xl and above) */}
        <Image
          src="/home/xl-background.avif"
          alt="JB Recruitments - Top Recruitment Agency and HR Consulting Workspace"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 w-full h-full object-cover xl:object-[75%_55%] hidden xl:block"
        />
        {/* Desktop/Tablet Image */}
        <Image
          src="/home/background-image.avif"
          alt="Professional recruitment and HR consulting services - JB Recruitments"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 w-full h-full object-cover object-[80%_100%] sm:object-[85%_90%] md:object-[80%_90%] lg:object-[80%_100%] xl:object-[80%_98%] hidden sm:block xl:hidden"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />

        {/* Content (positioned over the image) */}
        <div className="relative w-full z-10">
          {/* Hero Content */}
          <div className="flex items-center justify-center px-4 sm:px-6 md:px-12 lg:px-36 py-8 md:py-12 mt-16 sm:mt-20 pb-8 sm:pb-16">
            <div className="w-full max-w-7xl mx-auto">
              {/* ... content remains ... */}
              <div className="max-w-2xl lg:max-w-3xl">
                {/* Main Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  {/* Non-mobile brand label: visible from sm and up, hidden on mobile */}
                  <div className="hidden sm:block">
                    <span
                      className="inline-flex items-center gap-3 bg-white/2 border border-[#caa42b] text-[#e1b223] px-4 max-h-[650px]:px-3 py-2 max-h-[650px]:py-1.5 rounded-full text-xs max-h-[650px]:text-[11px] sm:text-base font-semibold shadow-[0_0px_60px_rgba(202,164,43,0.14)] transform transition-all duration-300 ring-1 ring-[#caa42b]/25 backdrop-blur-md mb-2 max-h-[650px]:mb-1"
                      aria-label="JB - A brand by Juhi Bhatia"
                    >
                      JB - A brand by Juhi Bhatia
                    </span>
                  </div>

                  <h1 className="text-white text-2xl max-h-[650px]:text-xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.1] max-h-[650px]:leading-[1.05] mb-3 max-h-[650px]:mb-2 sm:mb-6 md:my-4 crimson">
                    {/* Layout for small screens and xl+ */}
                    <div className="block md:hidden xl:block">
                      <div className="">Thoughtful</div>
                      <div className="">Hiring. Real</div>
                      <div className="">Outcomes.</div>
                    </div>
                    {/* Layout for md and lg screens */}
                    <div className="hidden md:block xl:hidden">
                      <div className="">Thoughtful Hiring.</div>
                      <div className="">Real Outcomes.</div>
                    </div>
                  </h1>
                </motion.div>

                {/* Subtext */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <p className="text-[#D6D6D6] text-sm max-h-[650px]:text-xs md:text-lg 2xl:text-xl leading-relaxed max-h-[650px]:leading-snug mb-3 max-h-[650px]:mb-2 sm:mb-6 md:mb-10 max-w-xl md:max-w-3xl w-full raleway">
                    JB is more than a recruitment agency - we’re a brand built
                    on trust, visibility & lasting impact. We help companies
                    hire the right people, fast, and help job seekers land their
                    next role faster.
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
                      className="bg-[#3399FE] text-white px-5 max-h-[650px]:px-4 py-2.5 max-h-[650px]:py-2 md:px-8 md:py-4 rounded-full text-sm max-h-[650px]:text-xs md:text-lg font-medium hover:bg-[#285b8d] transition-all shadow-lg cursor-pointer"
                      onClick={() => router.push("/companies")}
                    >
                      I Need to Hire Talent
                    </button>

                    <button
                      className="bg-transparent border border-white/80 text-white px-5 max-h-[650px]:px-4 py-2.5 max-h-[650px]:py-2 md:px-8 md:py-4 rounded-full text-sm max-h-[650px]:text-xs md:text-lg font-medium hover:scale-105 transform transition-all backdrop-blur-sm ease-in-out duration-300 cursor-pointer"
                      onClick={() => router.push("/job-seekers")}
                    >
                      I Need Career Support
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
