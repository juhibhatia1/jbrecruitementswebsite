"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";

type ServiceCardProps = {
  title: string;
  description?: string;
  iconPath: string;
  features?: string[];
  backDescription?: string;
  shouldFlip?: boolean;
  onManualFlip?: () => void;
};

export default function ServiceCard({
  title,
  description,
  iconPath,
  features = [],
  backDescription,
  shouldFlip = false,
  onManualFlip,
}: ServiceCardProps) {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Auto-flip based on parent control
  useEffect(() => {
    if (!isHovered && shouldFlip) {
      setIsFlipped(true);
      const timer = setTimeout(() => {
        setIsFlipped(false);
      }, 5000); // Show back for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [shouldFlip, isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsFlipped(true);
    if (onManualFlip) onManualFlip();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsFlipped(false);
  };

  // Default features if not provided
  const displayFeatures =
    features.length > 0
      ? features
      : [
          "Professional guidance",
          "Expert feedback",
          "Quick turnaround",
          "Personalized approach",
        ];

  return (
    <div
      className="relative w-full h-44 sm:h-64 md:h-60 lg:h-56 group"
      style={{ perspective: "1200px" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="relative w-full h-full transition-all duration-1000 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front Side */}
        <div
          className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-500 flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 border border-gray-100 group-hover:border-[#5a58ab]/30"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="mb-3 transition-all duration-500 group-hover:scale-110 group-hover:rotate-2">
            <Image
              src={iconPath}
              width={40}
              height={40}
              alt="icon"
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10"
            />
          </div>

          <h3
            className="text-base sm:text-lg md:text-xl font-semibold text-[#252e3d] mb-1.5 text-center transition-all duration-300 group-hover:text-[#5a58ab] leading-snug"
            style={{ fontFamily: "Palatino Linotype, serif" }}
          >
            {title}
          </h3>

          {description && (
            <p className="text-sm sm:text-base md:text-[15px] text-gray-600 text-center transition-colors duration-300 group-hover:text-gray-700 leading-relaxed">
              {description}
            </p>
          )}

          <div className="mt-2 text-xs text-gray-400 transition-opacity duration-300 group-hover:text-[#5a58ab]">
            Hover to see more
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-lg flex flex-col justify-center p-4 sm:p-5 md:p-6 border border-gray-100"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Description */}
          <div className="text-gray-600 text-sm sm:text-base md:text-[15px] text-center leading-relaxed mb-4">
            {backDescription ||
              description ||
              "Get expert assistance tailored to your career goals."}
          </div>

          {/* Feature List */}
          <div className="space-y-2">
            {displayFeatures.map((feature, index) => (
              <div key={index} className="flex items-center text-gray-700 py-1">
                <div className="w-1.5 h-1.5 bg-[#5a58ab] rounded-full mr-2.5 flex-shrink-0"></div>
                <span className="text-xs sm:text-sm md:text-[13px] leading-snug">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
