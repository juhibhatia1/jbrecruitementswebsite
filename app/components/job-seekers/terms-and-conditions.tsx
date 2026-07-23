"use client";

import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

const TERMS: { title: string; body: string }[] = [
  {
    title: "No Refund Policy",
    body: "All services are non-refundable once payment has been made, as work begins immediately on strategy, review, and documentation.",
  },
  {
    title: "Revision Window",
    body: "Revision requests must be shared within 10 days of receiving the first edited draft (or within 10 days of LinkedIn optimization for LinkedIn services). Requests after this period may require an additional fee.",
  },
  {
    title: "Client Responsibility",
    body: "Clients are responsible for providing accurate information, career details, and required documents on time. Delays in sharing information may impact turnaround time.",
  },
  {
    title: "Service Scope",
    body: "Services include editing, optimization, and professional structuring of provided information. We do not guarantee job placement, interview calls, or hiring outcomes.",
  },
];

export default function TermsAndConditions() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-gray-500 underline underline-offset-4 transition-colors hover:text-[#5a58ab] sm:text-base"
      >
        Read our Terms & Conditions{" "}
        <span className="font-semibold text-[#5a58ab]">*</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Terms and Conditions"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[#e6eefc] bg-white text-left shadow-[0_24px_50px_-12px_rgba(37,55,77,0.25)]">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-[#fcfdfe] p-6 pb-4">
              <div>
                <h3
                  className="text-xl font-bold text-[#252e3d]"
                  style={{ fontFamily: "Crimson Text, serif" }}
                >
                  Terms & Conditions
                </h3>
                <p className="mt-0.5 text-xs text-gray-400">
                  Please review carefully before making a purchase.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <IoClose className="h-5 w-5" />
              </button>
            </div>

            <ol className="list-decimal space-y-4 overflow-y-auto p-6 pl-9 text-sm leading-relaxed text-gray-700 sm:text-base">
              {TERMS.map((term) => (
                <li key={term.title}>
                  <span className="font-semibold text-[#252e3d]">
                    {term.title}:
                  </span>{" "}
                  {term.body}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
