import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  EMPLOYEE_SESSION_COOKIE,
  isValidEmployeeSessionToken,
} from "@/lib/employee-auth";
import TemplateForm from "@/app/components/admin/interview-template-form";

export const dynamic = "force-dynamic";

export default async function NewEmployeeInterviewPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(EMPLOYEE_SESSION_COOKIE)?.value;
  if (!isValidEmployeeSessionToken(token)) redirect("/employee");

  return (
    <div
      className="min-h-screen bg-[#f4f6fb]"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <div className="mx-auto max-w-3xl px-4 md:px-6 py-8">
        <div className="mb-6">
          <a
            href="/employee/interviews"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#252e3d] transition"
          >
            ← Back to Templates
          </a>
        </div>
        <h1 className="text-2xl font-bold text-[#252e3d] mb-6">New Interview Template</h1>
        <TemplateForm
          ownerRole="EMPLOYEE"
          apiBase="/api/employee/interviews/templates"
          redirectTo="/employee/interviews"
        />
      </div>
    </div>
  );
}
