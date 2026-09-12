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
  let posClass = "top-full mt-2.5";
  let arrowClass = "bottom-full border-4 border-transparent border-b-slate-900";

  if (position === "top") {
    posClass = "bottom-full mb-2.5";
    arrowClass = "top-full border-4 border-transparent border-t-slate-900";
  } else if (position === "left") {
    posClass = "right-full mr-2.5 top-1/2 -translate-y-1/2";
    arrowClass = "left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900";
  } else if (position === "right") {
    posClass = "left-full ml-2.5 top-1/2 -translate-y-1/2";
    arrowClass = "right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900";
  }

  // Horizontal alignment for top/bottom
  if (position === "top" || position === "bottom") {
    if (align === "center") {
      posClass += " left-1/2 -translate-x-1/2";
      arrowClass += " left-1/2 -translate-x-1/2";
    } else if (align === "start") {
      posClass += " left-0";
      arrowClass += " left-3";
    } else if (align === "end") {
      posClass += " right-0";
      arrowClass += " right-3";
    }
  }

  return (
    <span
      className={`group/tooltip relative inline-flex items-center align-middle hover:z-[9999] ${className}`}
      onClick={(e) => {
        // Prevent clicking tooltip from triggering parent button/card click actions
        e.stopPropagation();
      }}
    >
      <span
        tabIndex={0}
        aria-label={title || text}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-200/90 text-slate-700 group-hover/tooltip:bg-[#5a58ab] group-hover/tooltip:text-white transition-colors duration-150 text-[11px] font-bold cursor-help focus:outline-hidden focus:ring-1 focus:ring-[#5a58ab] shadow-2xs"
      >
        i
      </span>

      {/* Floating tooltip popover */}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-[9999] w-72 rounded-xl bg-slate-900 p-3.5 text-xs font-normal leading-relaxed text-slate-100 shadow-2xl border border-slate-700/80 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 transform scale-95 group-hover/tooltip:scale-100 text-left ${posClass}`}
      >
        {title && (
          <span className="block font-bold text-white text-xs mb-1.5 border-b border-slate-700/80 pb-1">
            {title}
          </span>
        )}
        <span className="block text-slate-200 font-normal leading-normal">{text}</span>
        <span className={`absolute ${arrowClass}`} />
      </span>
    </span>
  );
}
