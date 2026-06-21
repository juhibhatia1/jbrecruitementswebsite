"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IoCheckmarkCircle, IoArrowBack } from "react-icons/io5";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent");

  return (
    <div className="max-w-md w-full mx-4 bg-white rounded-3xl border border-[#e6eefc] p-8 shadow-[0_12px_40px_rgba(37,55,77,0.06)] text-center relative overflow-hidden">
      {/* Decorative background blur */}
      <div
        className="absolute inset-0 -z-10 blur-2xl bg-gradient-to-r from-[#e6eefc]/40 via-[#dfe8fb]/30 to-[#f8fafc]/20"
        aria-hidden="true"
      />

      <div className="flex justify-center mb-6 animate-bounce">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 shadow-inner">
          <IoCheckmarkCircle className="w-12 h-12" />
        </div>
      </div>

      <h1
        className="text-2xl sm:text-3xl font-bold text-[#252e3d] mb-3 leading-tight"
        style={{ fontFamily: "Crimson Text, serif" }}
      >
        Payment Successful!
      </h1>
      <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
        Thank you for your purchase. Your payment has been verified. We've sent
        a PDF receipt and details to your email. Our team will contact you
        shortly to coordinate the next steps.
      </p>

      {paymentIntent && (
        <div className="bg-[#f8fafc] border border-gray-100 rounded-xl p-3 mb-6 text-left">
          <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-1 tracking-wider">
            Transaction Reference:
          </span>
          <code className="text-xs font-mono break-all text-gray-700">
            {paymentIntent}
          </code>
        </div>
      )}

      <div className="space-y-3 mb-8">
        <Link
          href="/job-seekers"
          className="group w-full flex items-center justify-center gap-2 bg-[#5a58ab] hover:bg-[#4a489b] text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
        >
          <IoArrowBack className="w-5 h-5 transform transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Career Guidance Page
        </Link>
      </div>

      <div className="border-t border-gray-100 pt-5 text-xs text-gray-400">
        Have questions? Reply to your confirmation email or contact us at
        contact@jbrecruitments.com.
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div
      className="min-h-screen bg-[#F9F9FB] text-[#252E3D] flex items-center justify-center pt-24 pb-16"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <Suspense
        fallback={
          <div className="text-[#252e3d] text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5a58ab] mx-auto mb-4"></div>
            <p>Loading payment details...</p>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
