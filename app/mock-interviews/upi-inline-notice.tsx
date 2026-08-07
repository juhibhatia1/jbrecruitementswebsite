"use client";

import { useEffect, useState } from "react";
import { detectCurrencyFromBrowser } from "@/lib/geo-utils";

export function UpiInlineNotice() {
  const [isIndianUser, setIsIndianUser] = useState(false);

  useEffect(() => {
    setIsIndianUser(detectCurrencyFromBrowser() === "INR");
  }, []);

  if (!isIndianUser) return null;

  return (
    <p className="mt-1 text-xs text-gray-500">
      💡 Want to pay via UPI? Please{" "}
      <a
        href={process.env.NEXT_PUBLIC_UPI_GOOGLE_FORM_URL || "https://forms.google.com"}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-[#5a58ab] underline hover:text-[#4a489b]"
      >
        fill out this Google Form
      </a>{" "}
      and scan the QR code inside to pay.
    </p>
  );
}
