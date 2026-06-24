import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import KnowledgeDashboard from "@/app/components/admin/knowledge-dashboard";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin-auth";

export default async function AdminKnowledgePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  // Protect the route: redirect to login if not authorized
  if (!isValidAdminSessionToken(token)) {
    redirect("/admin");
  }

  return <KnowledgeDashboard />;
}
