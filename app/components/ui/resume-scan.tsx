"use client";

import { motion, Transition } from "framer-motion";
import Image from "next/image";

export default function ResumeScanner() {
  return (
    <div className="relative w-[220px] h-[270px] mx-auto overflow-hidden bg-white shadow-lg z-10">
      {/* Resume Image Container */}
      <motion.div
        className="w-full will-change-transform"
        // Resume starts at 0 and slides UP to -95%
        initial={{ y: "0%" }}
        animate={{ y: "-100%" }}
        transition={scanTransition}
      >
        {/* Replace src with your actual resume image path */}
        <Image
          src="/home/resume.jpg"
          alt="Animated Resume"
          width={600}
          height={1000}
          priority
          className="w-full h-auto block select-none"
        />
      </motion.div>

      {/* The Scanning Beam & Gradient Overlay */}
      <motion.div
        className="absolute left-0 w-full h-[150px] pointer-events-none z-10"
        // CALCULATION FOR SYNC:
        // Container H=275px. Image W=280px. Image Ratio=1000/600.
        // Image H = 280 * (10/6) = ~466.67px.
        // Image Travel (95%) = 0.95 * 466.67 = 443.33px.
        // Beam Travel Needed = 443.33px. 
        // Beam Start = 275px (100%). Target = 275 - 443.33 = -168.33px.
        // Target % = -168.33 / 275 = -61.21%.
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
