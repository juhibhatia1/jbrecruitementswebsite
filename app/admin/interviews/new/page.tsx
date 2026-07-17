import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin-auth";
import TemplateForm from "@/app/components/admin/interview-template-form";

export const dynamic = "force-dynamic";

export default async function NewAdminInterviewPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSessionToken(token)) redirect("/admin");

  return (
    <div
      className="min-h-screen bg-[#f4f6fb]"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <div className="mx-auto max-w-3xl px-4 md:px-6 py-8">
        <div className="mb-6">
          <a
            href="/admin/interviews"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#252e3d] transition"
          >
            ← Back to Templates
          </a>
        </div>
        <h1 className="text-2xl font-bold text-[#252e3d] mb-6">New Interview Template</h1>
        <TemplateForm ownerRole="ADMIN" apiBase="/api/admin/interviews/templates" redirectTo="/admin/interviews" />
      </div>
    </div>
  );
}
