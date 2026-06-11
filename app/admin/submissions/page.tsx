import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SubmissionsDashboard from "@/app/components/admin/submissions-dashboard";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin-auth";
import { getAllSubmissions } from "@/lib/submissions-store";

import type { AdminSubmission } from "@/lib/submission-types";

export default async function AdminSubmissionsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!isValidAdminSessionToken(token)) {
    redirect("/admin");
  }

  let submissions: AdminSubmission[] = [];
  let dbError: string | null = null;

  try {
    submissions = await getAllSubmissions();
  } catch (err: any) {
    console.error("Database connection error in admin submissions:", err);
    dbError = "Database server is currently offline or sleeping. Please refresh in a few seconds to retry.";
  }

  return <SubmissionsDashboard submissions={submissions} dbError={dbError} />;
}
