import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import ApplyForm from "./apply-form";

type Props = { params: Promise<{ roleId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { roleId } = await params;
  const template = await prisma.interviewTemplate.findUnique({
    where: { id: roleId, isActive: true },
    select: { jobRole: true },
  });
  if (!template) return { title: "Opportunity Not Found" };
  return {
    title: `${template.jobRole} | Mock Interview Sessions — JB Recruitment Solutions`,
    description: `Book a mock interview practice session for ${template.jobRole}. AI-powered or coach-led sessions available.`,
  };
}

export const dynamic = "force-dynamic";

export default async function RoleDetailPage({ params }: Props) {
  const { roleId } = await params;

  const template = await prisma.interviewTemplate.findUnique({
    where: { id: roleId, isActive: true },
    select: {
      id: true,
      jobRole: true,
      experienceLevel: true,
      techStack: true,
      requiredSkills: true,
      durationMinutes: true,
      difficultyLevel: true,
      interviewDescription: true,
    },
  });

  if (!template) notFound();

  const difficultyColor: Record<string, string> = {
    Easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Hard: "bg-red-50 text-red-700 border-red-200",
  };
  const diffClass =
    difficultyColor[template.difficultyLevel] ??
    "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <div
      className="min-h-screen bg-[#F9F9FB] text-[#252E3D]"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <main className="mx-auto max-w-7xl px-4 md:px-6 pt-28 sm:pt-36 md:pt-32 pb-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12 items-start">
          {/* Left: role info */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${diffClass}`}
              >
                {template.difficultyLevel}
              </span>
              <span className="text-xs text-gray-400">{template.experienceLevel}</span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-400">
                ~{template.durationMinutes} min interview
              </span>
            </div>

            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-[#252e3d] mb-6"
            >
              {template.jobRole}
            </h1>

            {template.interviewDescription && (
              <div className="mb-8">
                <h2
                  className="text-xl font-semibold text-[#252e3d] mb-2"
                  style={{ fontFamily: "Crimson Text, serif" }}
                >
                  About This Interview
                </h2>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {template.interviewDescription}
                </p>
              </div>
            )}

            {template.techStack.length > 0 && (
              <div className="mb-6">
                <h3
                  className="text-base font-semibold text-[#252e3d] mb-2"
                  style={{ fontFamily: "Crimson Text, serif" }}
                >
                  Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {template.techStack.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-[#f0efff] text-[#5a58ab] px-2.5 py-1 text-sm font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {template.requiredSkills.length > 0 && (
              <div className="mb-6">
                <h3
                  className="text-base font-semibold text-[#252e3d] mb-2"
                  style={{ fontFamily: "Crimson Text, serif" }}
                >
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {template.requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-gray-100 text-gray-700 px-2.5 py-1 text-sm"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-[#e0e0e0] bg-white p-5 mb-6">
              <h3
                className="text-base font-semibold text-[#252e3d] mb-3"
                style={{ fontFamily: "Crimson Text, serif" }}
              >
                Interview Format
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-[#5a58ab]">✦</span>
                  <span>
                    <strong>AI Interview:</strong> Conduct your interview
                    immediately via voice with our AI interviewer. You'll receive a
                    secure link by email valid for 7 days.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-[#5a58ab]">✦</span>
                  <span>
                    <strong>Coach Session:</strong> A coach will reach out to
                    schedule a personal practice session at a convenient time.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: application form */}
          <div className="lg:col-span-1">
            <ApplyForm templateId={template.id} jobRole={template.jobRole} />
          </div>
        </div>
      </main>
    </div>
  );
}
