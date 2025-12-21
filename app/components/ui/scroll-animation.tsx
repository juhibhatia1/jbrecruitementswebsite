"use client";

import { motion, useInView, UseInViewOptions } from "framer-motion";
import { useRef, ReactNode } from "react";

type AnimationVariant = 
  | "fadeUp" 
  | "fadeIn" 
  | "slideLeft" 
  | "slideRight" 
  | "scaleUp"
  | "none";

interface ScrollAnimationProps {
  children: ReactNode;
  className?: string;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  viewport?: UseInViewOptions;
  once?: boolean;
}

export default function ScrollAnimation({
  children,
  className = "",
  variant = "fadeUp",
  delay = 0,
  duration = 0.5,
  viewport = { amount: 0.3, margin: "0px 0px -50px 0px" },
  once = true,
}: ScrollAnimationProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, ...viewport });

  const variants = {
    hidden: {
      opacity: 0,
      y: variant === "fadeUp" ? 30 : 0,
      x: variant === "slideLeft" ? -50 : variant === "slideRight" ? 50 : 0,
      scale: variant === "scaleUp" ? 0.9 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.25, 0.25, 0.75] as const, // Smooth easing
      },
    },
  };

  if (variant === "none") {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
