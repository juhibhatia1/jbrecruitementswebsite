import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mock Interview Sessions | JB Recruitment Solutions",
  description:
    "Browse available mock interview practice sessions and book your slot. AI-powered or coach-led sessions available.",
};

export const dynamic = "force-dynamic";

export default async function MockInterviewsPage() {
  const templates = await prisma.interviewTemplate.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      jobRole: true,
      experienceLevel: true,
      techStack: true,
      requiredSkills: true,
      durationMinutes: true,
      difficultyLevel: true,
      interviewDescription: true,
      createdAt: true,
    },
  });

  return (
    <div
      className="min-h-screen bg-[#F9F9FB] text-[#252E3D]"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <main className="mx-auto max-w-7xl px-4 md:px-6 pt-28 sm:pt-36 md:pt-32 pb-16 md:pb-24">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-[#252e3d] mb-4">
            Mock Interview Sessions
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
            Browse available practice sessions and book your slot. Choose AI-powered
            or coach-led interview practice to sharpen your skills.
          </p>
        </div>

        {/* Role cards */}
        {templates.length === 0 ? (
          <div className="rounded-2xl border border-[#e0e0e0] bg-white px-8 py-16 text-center">
            <p
              className="text-xl font-semibold text-[#252e3d] mb-2"
              style={{ fontFamily: "Crimson Text, serif" }}
            >
              No sessions available right now
            </p>
            <p className="text-sm text-gray-500">
              Check back soon or{" "}
              <Link
                href="/job-seekers"
                className="text-[#5a58ab] underline underline-offset-2"
              >
                explore our career services
              </Link>{" "}
              to start preparing for your next interview.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {templates.map((template) => (
              <RoleCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

type Template = {
  id: string;
  jobRole: string;
  experienceLevel: string;
  techStack: string[];
  requiredSkills: string[];
  durationMinutes: number;
  difficultyLevel: string;
  interviewDescription: string | null;
};

function RoleCard({ template }: { template: Template }) {
  const difficultyColor: Record<string, string> = {
    Easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Hard: "bg-red-50 text-red-700 border-red-200",
  };
  const diffClass =
    difficultyColor[template.difficultyLevel] ??
    "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <div className="flex flex-col rounded-2xl border border-[#e0e0e0] bg-white p-6 transition hover:shadow-md hover:border-[#5a58ab]/30">
      {/* Title row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2
          className="text-lg font-semibold text-[#252e3d] leading-snug"
          style={{ fontFamily: "Crimson Text, serif" }}
        >
          {template.jobRole}
        </h2>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${diffClass}`}
        >
          {template.difficultyLevel}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-4">
        <span>{template.experienceLevel}</span>
        <span>·</span>
        <span>{template.durationMinutes} min session</span>
      </div>

      {/* Description */}
      {template.interviewDescription && (
        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
          {template.interviewDescription}
        </p>
      )}

      {/* Tech tags */}
      {template.techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {template.techStack.slice(0, 5).map((t) => (
            <span
              key={t}
              className="rounded-md bg-[#f0efff] text-[#5a58ab] px-2 py-0.5 text-xs font-medium"
            >
              {t}
            </span>
          ))}
          {template.techStack.length > 5 && (
            <span className="rounded-md bg-gray-100 text-gray-500 px-2 py-0.5 text-xs">
              +{template.techStack.length - 5}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto">
        <Link
          href={`/mock-interviews/${template.id}`}
          className="inline-block w-full rounded-xl bg-[#252e3d] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#2d3645]"
        >
          Book Session
        </Link>
      </div>
    </div>
  );
}
