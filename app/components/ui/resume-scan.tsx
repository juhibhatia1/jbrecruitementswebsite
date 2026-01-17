"use client";

import { motion, Transition } from "framer-motion";
import Image from "next/image";

export default function ResumeScanner() {
  return (
    <div className="relative w-[180px] h-[220px] sm:w-[200px] sm:h-[250px] md:w-[220px] md:h-[270px] mx-auto overflow-hidden bg-white shadow-lg z-10">
      {/* Resume Image Container */}
      {/* Static Resume Image (fixed at initial position) */}
      <div className="w-full will-change-transform">
        {/* Replace src with your actual resume image path */}
        <Image
          src="/home/resume.avif"
          alt="Resume"
          width={600}
          height={1000}
          priority
          className="w-full h-auto block select-none"
        />
      </div>

      {/* The Scanning Beam & Gradient Overlay */}
      <motion.div
        className="absolute left-0 w-full h-[150px] pointer-events-none z-10"
        initial={{ top: "100%" }}
        animate={{ top: "0%" }}
        transition={scanTransition}
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500 shadow-[0_0_10px_5px_rgba(99,102,241,0.8)] z-20" />
      </motion.div>
    </div>
  );
}

/* =========================
   Animation Configuration
   ========================= */

const scanTransition: Transition = {
  duration: 10,
  ease: "easeInOut",
  repeat: Infinity,
  repeatType: "loop",
  repeatDelay: 0, // Continuous flow
};
