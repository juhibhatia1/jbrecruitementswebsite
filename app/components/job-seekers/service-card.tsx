"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { IoCheckmark } from "react-icons/io5";

type ServiceCardProps = {
  title: string;
  amount: number; // base USD amount (kept for legacy use)
  localAmount: number; // amount in selected currency
  currency: string; // e.g. "USD", "AED", "INR"
  description?: string;
  iconPath: string;
  features?: string[];
  backDescription?: string;
  shouldFlip?: boolean;
  onManualFlip?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  onBuyClick?: () => void;
  buyLabel?: string;
  // Multi-select props
  isSelected?: boolean;
  onToggleSelect?: () => void;
};

export default function ServiceCard({
  title,
  amount,
  localAmount,
  currency,
  description,
  iconPath,
  features = [],
  backDescription,
  shouldFlip = false,
  onManualFlip,
  onHoverStart,
  onHoverEnd,
  onBuyClick,
  buyLabel = "Buy Now",
  isSelected = false,
  onToggleSelect,
}: ServiceCardProps) {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isManualFlip, setIsManualFlip] = useState<boolean>(false);

  // Auto-flip based on parent control
  useEffect(() => {
    if (!isHovered && shouldFlip && !isManualFlip) {
      setIsFlipped(true);
      const timer = setTimeout(() => {
        setIsFlipped(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else if (!isHovered && !shouldFlip) {
      setIsFlipped(false);
    }
  }, [shouldFlip, isHovered, isManualFlip]);

  // Trigger VIEW funnel event on card flip
  useEffect(() => {
    if (isFlipped) {
      fetch("/api/analytics/funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceName: title, eventType: "VIEW" }),
      }).catch((e) => console.error("Telemetry failed:", e));
    }
  }, [isFlipped, title]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsFlipped(true);
    if (onHoverStart) onHoverStart();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsFlipped(false);
    if (onHoverEnd) onHoverEnd();
  };

  const handleClick = () => {
    setIsFlipped((prev) => !prev);
    setIsManualFlip(true);
    if (onManualFlip) onManualFlip();
    setTimeout(() => setIsManualFlip(false), 6000);
  };

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
      className="relative w-full h-[340px] sm:h-80 md:h-[340px] lg:h-80 group"
      style={{ perspective: "1200px" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Checkbox / select toggle — top-right corner */}
      {onToggleSelect && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          aria-label={isSelected ? `Deselect ${title}` : `Select ${title}`}
          className={`absolute top-3 right-3 z-30 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-sm
            ${
              isSelected
                ? "bg-[#5a58ab] border-[#5a58ab]"
                : "bg-white border-gray-300 hover:border-[#5a58ab]"
            }`}
        >
          {isSelected && <IoCheckmark className="text-white w-3.5 h-3.5" />}
        </button>
      )}

      <div
        className="relative w-full h-full transition-all duration-1000 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front Side */}
        <div
          className={`absolute inset-0 w-full h-full bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-500 flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 border border-gray-100 group-hover:border-[#5a58ab]/30 antialiased
            ${isSelected ? "bg-[#faf9ff]" : ""}`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "translate3d(0,0,0)",
          }}
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
            style={{ fontFamily: "Crimson Text, serif" }}
          >
            {title}
          </h3>

          {/* Price badge */}
          <span className="text-xs font-semibold text-[#5a58ab] bg-[#f0effd] px-2.5 py-0.5 rounded-full mb-2">
            {currency} {localAmount.toLocaleString()}
          </span>

          {description && (
            <p className="text-sm sm:text-base md:text-[15px] text-gray-600 text-center transition-colors duration-300 group-hover:text-gray-700 leading-relaxed">
              {description}
            </p>
          )}

          <div className="mt-2 transition-opacity duration-300">
            <span className="text-xs text-gray-400 sm:hidden">
              Tap to see more
            </span>
            <span className="hidden sm:inline-block text-xs text-gray-400 group-hover:text-[#5a58ab]">
              Hover to see more
            </span>
          </div>
        </div>

        {/* Back Side */}
        <div
          className={`absolute inset-0 w-full h-full bg-white rounded-2xl shadow-lg flex flex-col justify-between p-4 sm:p-5 border border-gray-100 antialiased
            ${isSelected ? "bg-[#faf9ff]" : ""}`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg) translate3d(0,0,0)",
          }}
        >
          <div className="flex-grow flex flex-col justify-center">
            <div className="text-[#252e3d] text-xs sm:text-sm text-center leading-relaxed mb-3 font-medium">
              {backDescription ||
                description ||
                "Get expert assistance tailored to your career goals."}
            </div>

            <div className="space-y-1.5 px-1 sm:px-3 mb-3">
              {displayFeatures.map((feature, index) => (
                <div key={index} className="flex items-center text-gray-700">
                  <div className="w-1.5 h-1.5 bg-[#5a58ab] rounded-full mr-2.5 flex-shrink-0"></div>
                  <span className="text-xs sm:text-[13px] leading-snug">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-row gap-2">
            {/* Add to Cart / Remove toggle */}
            {onToggleSelect && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect();
                }}
                className={`flex-1 text-[11px] sm:text-xs md:text-sm font-semibold py-2 px-1.5 rounded-xl transition-all duration-300 shadow-sm active:scale-[0.98] cursor-pointer border whitespace-nowrap overflow-hidden text-ellipsis
                  ${
                    isSelected
                      ? "bg-[#f0effd] text-[#5a58ab] border-[#5a58ab]/30 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      : "bg-white text-[#5a58ab] border-[#5a58ab]/30 hover:bg-[#5a58ab]/5"
                  }`}
              >
                {isSelected ? (
                  "✓ Added"
                ) : (
                  <>
                    <span className="text-lg sm:text-base md:text-lg align-middle">
                      +
                    </span>{" "}
                    <span className="align-middle">Add to cart</span>
                  </>
                )}
              </button>
            )}

            {/* Buy Now (single purchase) */}
            {onBuyClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetch("/api/analytics/funnel", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      serviceName: title,
                      eventType: "CLICK_BUY",
                    }),
                  }).catch((e) => console.error("Telemetry failed:", e));
                  onBuyClick();
                }}
                className="flex-1 bg-[#5a58ab] hover:bg-[#4a489b] text-white text-[11px] sm:text-xs md:text-sm font-semibold py-2 px-1.5 rounded-xl transition-all duration-300 shadow-sm active:scale-[0.98] cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis text-center"
              >
                {buyLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
