"use client";

import React from "react";

interface InfoTooltipProps {
  text: string;
  title?: string;
  position?: "top" | "bottom" | "left" | "right";
  align?: "center" | "start" | "end";
  className?: string;
}

export default function InfoTooltip({
  text,
  title,
  position = "bottom",
  align = "start",
  className = "",
}: InfoTooltipProps) {
  // Positioning classes based on position and alignment
  let posClass = "top-full mt-2";
  let arrowClass = "bottom-full border-4 border-transparent border-b-[#1e232d]";

  if (position === "top") {
    posClass = "bottom-full mb-2";
    arrowClass = "top-full border-4 border-transparent border-t-[#1e232d]";
  } else if (position === "left") {
    posClass = "right-full mr-2 top-1/2 -translate-y-1/2";
    arrowClass = "left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-[#1e232d]";
  } else if (position === "right") {
    posClass = "left-full ml-2 top-1/2 -translate-y-1/2";
    arrowClass = "right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1e232d]";
  }

  // Horizontal alignment for top/bottom
  if (position === "top" || position === "bottom") {
    if (align === "center") {
      posClass += " left-1/2 -translate-x-1/2";
      arrowClass += " left-1/2 -translate-x-1/2";
    } else if (align === "start") {
      posClass += " left-0";
      arrowClass += " left-2.5";
    } else if (align === "end") {
      posClass += " right-0";
      arrowClass += " right-2.5";
    }
  }

  return (
    <span
      className={`group/tooltip relative inline-flex items-center align-middle hover:z-[9999] normal-case tracking-normal ${className}`}
      onClick={(e) => {
        // Prevent clicking tooltip from triggering parent button/card click actions
        e.stopPropagation();
      }}
    >
      <span
        tabIndex={0}
        aria-label={title || text}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:text-[#5a58ab] hover:bg-[#5a58ab]/10 transition-colors duration-150 cursor-help focus:outline-hidden focus:ring-1 focus:ring-[#5a58ab]"
      >
        <svg
          className="w-3.5 h-3.5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      </span>

      {/* Floating tooltip popover */}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-[9999] w-64 max-w-xs rounded-xl bg-[#1e232d] p-3 text-xs font-normal leading-relaxed text-slate-100 shadow-xl border border-slate-700/60 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-150 transform scale-95 group-hover/tooltip:scale-100 normal-case tracking-normal text-left ${posClass}`}
      >
        {title && (
          <span className="block font-semibold text-white text-xs mb-1 border-b border-white/10 pb-1">
            {title}
          </span>
        )}
        <span className="block text-slate-300 font-normal leading-relaxed text-[11px]">{text}</span>
        <span className={`absolute ${arrowClass}`} />
      </span>
    </span>
  );
}
