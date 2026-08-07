"use client";

import { useEffect, useState } from "react";
import { detectCurrencyFromBrowser } from "@/lib/geo-utils";

export function UpiCardNotice() {
  const [isIndianUser, setIsIndianUser] = useState(false);

  useEffect(() => {
    setIsIndianUser(detectCurrencyFromBrowser() === "INR");
  }, []);

  if (!isIndianUser) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mb-6 rounded-2xl bg-[#f0efff] border border-[#dcd9ff] p-3.5 text-xs text-slate-700 leading-relaxed"
    >
      💡 <strong>Paying via UPI?</strong> Please{" "}
      <a
        href={process.env.NEXT_PUBLIC_UPI_GOOGLE_FORM_URL || "https://forms.google.com"}
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold text-[#5a58ab] underline hover:text-[#4a489b]"
      >
        fill out this Google Form
      </a>
      {" "}and scan the QR code inside to pay.
    </div>
  );
}
