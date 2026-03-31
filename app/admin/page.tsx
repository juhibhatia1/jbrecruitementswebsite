import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminLoginForm from "../components/admin/admin-login-form";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (isValidAdminSessionToken(token)) {
    redirect("/admin/dashboard");
  }

  return <AdminLoginForm />;
}
