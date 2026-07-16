import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  EMPLOYEE_SESSION_COOKIE,
  isValidEmployeeSessionToken,
} from "@/lib/employee-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EmployeeInterviewsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(EMPLOYEE_SESSION_COOKIE)?.value;
  if (!isValidEmployeeSessionToken(token)) redirect("/employee");

  const templates = await prisma.interviewTemplate.findMany({
    where: { ownerRole: "EMPLOYEE" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div
      className="min-h-screen bg-[#f4f6fb]"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-8">
        {/* Header nav */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#252e3d]">Interview Templates</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage AI interview configurations</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/employee/directory"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Candidate Directory
            </Link>
            <Link
              href="/employee/interviews"
              className="rounded-xl bg-[#252e3d] px-4 py-2 text-sm font-semibold text-white"
            >
              Interviews
            </Link>
          </div>
        </header>

        {/* Template list */}
        {templates.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-base font-semibold text-slate-600 mb-1">No templates yet</p>
            <p className="text-sm text-slate-400">
              Template creation is temporarily disabled for employee accounts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-slate-100 bg-white p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#252e3d]">{t.jobRole}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t.experienceLevel} · {t.durationMinutes} min · {t.difficultyLevel}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        t.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {t.isActive ? "Active" : "Draft"}
                    </span>
                    {!t.systemInstructions && (
                      <span className="rounded-full bg-orange-50 text-orange-600 px-2.5 py-0.5 text-xs font-medium">
                        Needs Generation
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {t.techStack.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-[#f0efff] text-[#5a58ab] px-2 py-0.5 text-xs"
                    >
                      {s}
                    </span>
                  ))}
                  {t.techStack.length > 4 && (
                    <span className="rounded-md bg-gray-100 text-gray-500 px-2 py-0.5 text-xs">
                      +{t.techStack.length - 4}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                  <span className="text-xs text-slate-400">
                    {t._count.applications} booking{t._count.applications !== 1 ? "s" : ""}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      href={`/employee/interviews/${t.id}/results`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                    >
                      Results
                    </Link>
                    <Link
                      href={`/employee/interviews/${t.id}`}
                      className="rounded-lg bg-[#252e3d] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2d3645] transition"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
