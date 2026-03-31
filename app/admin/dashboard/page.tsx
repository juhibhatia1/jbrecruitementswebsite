import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AnalyticsDashboard from "@/app/components/admin/analytics-dashboard";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin-auth";
import { getAllSubmissions } from "@/lib/submissions-store";

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!isValidAdminSessionToken(token)) {
    redirect("/admin");
  }

  const submissions = await getAllSubmissions();

  return <AnalyticsDashboard submissions={submissions} />;
}
