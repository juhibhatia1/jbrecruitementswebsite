import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ApplyForm from "../[roleId]/apply-form";

export const metadata: Metadata = {
  title: "Book Human Interview | JB Recruitment Solutions",
  description:
    "Book a human-led mock interview using the in-app form and payment flow.",
};

export const dynamic = "force-dynamic";

export default async function CoachInterviewPage() {
  const template = await prisma.interviewTemplate.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      jobRole: true,
    },
  });

  return (
    <div
      className="min-h-screen bg-[#f4f6fb]"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <div className="mx-auto max-w-4xl px-4 md:px-6 pt-28 sm:pt-36 md:pt-24 pb-16 md:pb-24">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5a58ab]">
              Human Interview
            </p>
            <h1 className="text-2xl font-bold text-[#252e3d]">
              Book a human-led mock interview
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Use the in-app booking form and payment flow below.
            </p>
          </div>
        </div>

        {!template ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-[#252e3d]">No coach session is configured yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Please check back later or return to the mock interview options.
            </p>
          </div>
        ) : (
          <ApplyForm
            templateId={template.id}
            jobRole={template.jobRole}
            defaultPreference="MANUAL"
            hidePreferenceSelection
          />
        )}
      </div>
    </div>
  );
}
