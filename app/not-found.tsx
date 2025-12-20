"use client";

import Link from "next/link";
import NavigationMenu from "./components/ui/navbar";
import Footer from "./components/footer";
import FloatingNavbar from "./components/floating-navbar";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <FloatingNavbar />
      {/* Subtle diagonal background */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#f5f6f8_0%,#ffffff_40%)]" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* 404 */}
        <h1 className="text-[96px] leading-none font-semibold text-slate-800 md:text-[120px]">
          404
        </h1>

        {/* Title */}
        <h2 className="mt-4 text-xl font-semibold text-slate-800 md:text-2xl">
          Oops! something off
        </h2>

        {/* Description */}
        <p className="mt-2 max-w-md text-sm text-slate-500 md:text-base">
          The page you were looking for can't be found.
        </p>

        {/* CTA */}
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Sip &amp; Restart
          <span className="text-base">↗</span>
        </Link>
      </div>
      <Footer />
    </div>
  );
}
