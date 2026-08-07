"use client";

import Image from "next/image";
import React from "react";
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
  shouldFlip,
  onManualFlip,
  onHoverStart,
  onHoverEnd,
  onBuyClick,
  buyLabel = "Buy Now",
  isSelected = false,
  onToggleSelect,
}: ServiceCardProps) {
  const displayFeatures =
    features.length > 0
      ? features
      : [
          "Professional guidance",
          "Expert feedback",
          "Quick turnaround",
          "Personalized approach",
        ];

  const isIndianUser = currency.toUpperCase() === "INR" || currency === "₹";

  return (
    <div
      className={`relative w-full h-full bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group overflow-hidden antialiased ${
        isSelected ? "bg-[#faf9ff] border-[#5a58ab]/20" : ""
      }`}
    >
      <div className="flex h-full flex-col p-4 sm:p-5 md:p-6">
        <div className="flex items-center gap-3">
          <div className="transition-all duration-300">
            <Image
              src={iconPath}
              width={40}
              height={40}
              alt={`${title} icon`}
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3
                className="text-base sm:text-lg md:text-xl font-semibold text-[#252e3d] transition-all duration-300 group-hover:text-[#5a58ab] leading-snug"
                style={{ fontFamily: "Crimson Text, serif" }}
              >
                {title}
              </h3>

              <span className="shrink-0 text-xs font-semibold text-[#5a58ab] bg-[#f0effd] px-2.5 py-1 rounded-full">
                {currency} {localAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex-1 space-y-2.5 overflow-hidden">
          {description && (
            <p className="mt-1.5 text-sm sm:text-base md:text-[15px] text-gray-600 transition-colors duration-300 group-hover:text-gray-700 leading-relaxed">
              {description}
            </p>
          )}
          {displayFeatures.map((feature, index) => (
            <div key={index} className="flex items-start gap-2 rounded-xl px-3">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-[#5a58ab] flex-shrink-0" />
              <span className="text-xs sm:text-[13px] leading-snug text-gray-700">
                {feature}
              </span>
            </div>
          ))}
        </div>

        {title === "Mock Interview" && isIndianUser && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#f0effd] border border-[#dcd9ff] text-[11px] leading-relaxed text-slate-700">
            <strong>Paying via UPI?</strong> Please{" "}
            <a
              href={process.env.NEXT_PUBLIC_UPI_GOOGLE_FORM_URL || "https://forms.google.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#5a58ab] underline hover:text-[#4a489b]"
              onClick={(e) => e.stopPropagation()}
            >
              fill out this Google Form
            </a>
            {" "}and scan the QR code inside to pay.
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {onToggleSelect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect();
              }}
              className={`flex-1 text-[11px] sm:text-xs md:text-sm font-semibold py-2.5 px-2 rounded-xl transition-all duration-300 shadow-sm active:scale-[0.98] cursor-pointer border whitespace-nowrap overflow-hidden text-ellipsis ${
                isSelected
                  ? "bg-[#f0effd] text-[#5a58ab] border-[#5a58ab]/30 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  : "bg-white text-[#5a58ab] border-[#5a58ab]/30 hover:bg-[#5a58ab]/5"
              }`}
            >
              {isSelected ? "✓ Added" : "Add to cart"}
            </button>
          )}

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
                }).catch((error) => console.error("Telemetry failed:", error));
                onBuyClick();
              }}
              className="flex-1 bg-[#5a58ab] hover:bg-[#4a489b] text-white text-[11px] sm:text-xs md:text-sm font-semibold py-2.5 px-2 rounded-xl transition-all duration-300 shadow-sm active:scale-[0.98] cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis text-center"
            >
              {buyLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
