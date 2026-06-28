import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import EmployeeLoginForm from "../components/employee/employee-login-form";
import {
  EMPLOYEE_SESSION_COOKIE,
  isValidEmployeeSessionToken,
} from "@/lib/employee-auth";

export default async function EmployeeLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(EMPLOYEE_SESSION_COOKIE)?.value;

  if (isValidEmployeeSessionToken(token)) {
    redirect("/employee/directory");
  }

  return <EmployeeLoginForm />;
}
