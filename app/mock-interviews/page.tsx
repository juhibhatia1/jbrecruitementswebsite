import Link from "next/link";
import type { Metadata } from "next";
import { IoArrowForwardOutline, IoSparkles } from "react-icons/io5";
import { UpiCardNotice } from "./upi-card-notice";

export const metadata: Metadata = {
  title: "Mock Interview Sessions | JB Recruitment Solutions",
  description:
    "Choose between an AI-based mock interview or an in-app human-led booking flow.",
};

export const dynamic = "force-dynamic";

export default function MockInterviewsPage() {
  return (
    <div
      className="min-h-screen bg-[#F9F9FB] text-[#252E3D]"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <main className="mx-auto max-w-6xl px-4 md:px-6 pt-28 sm:pt-36 md:pt-32 pb-16 md:pb-24">
        <div className="mb-10 md:mb-14 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f0efff] px-3 py-1 text-xs font-semibold text-[#5a58ab] mb-4">
            <IoSparkles className="w-3.5 h-3.5" />
            Mock Interview Options
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-[#252e3d] mb-4">
            Choose how you want to practice
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Pick an AI-based interview for instant practice, or book a human-led
            session through Cal.com when you want live coaching and feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
          <OptionCard
            eyebrow="Option 1"
            title="AI Based Interview"
            description="Start a tailored AI mock interview and practice immediately with voice-based prompts and structured feedback."
            ctaLabel="Start AI Interview"
            href="/mock-interviews/custom"
            primary
            upiFormNotice
          />

          <OptionCard
            eyebrow="Option 2"
            title="Human Based Interview"
            description="Use the in-app booking form and payment flow to schedule a live human-led mock interview."
            ctaLabel="Book Human Interview"
            href="/mock-interviews/coach"
          />
        </div>
      </main>
    </div>
  );
}

type OptionCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  primary?: boolean;
  upiFormNotice?: boolean;
};

function OptionCard({
  eyebrow,
  title,
  description,
  ctaLabel,
  href,
  primary = false,
  upiFormNotice = false,
}: OptionCardProps) {
  const cardClass = primary
    ? "border-[#5a58ab]/25 bg-gradient-to-br from-[#ffffff] to-[#f7f6ff]"
    : "border-slate-200 bg-white";

  const ctaClass = primary
    ? "bg-[#5a58ab] text-white hover:bg-[#4a489b]"
    : "bg-[#252e3d] text-white hover:bg-[#2d3645]";

  const content = (
    <div
      className={`group flex h-full flex-col rounded-3xl border p-6 sm:p-7 shadow-[0_8px_30px_rgb(37,46,61,0.04)] transition hover:shadow-[0_16px_40px_rgb(37,46,61,0.08)] ${cardClass}`}
    >
      <div className="mb-5">
        <div className="inline-flex rounded-full bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
          {eyebrow}
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-semibold text-[#252e3d] mb-3" style={{ fontFamily: "Crimson Text, serif" }}>
        {title}
      </h2>
      <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
        {description}
      </p>

      {upiFormNotice && <UpiCardNotice />}

      <div className="mt-auto">
        <span
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${ctaClass}`}
        >
          {ctaLabel}
          <IoArrowForwardOutline className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );

  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  );
}
