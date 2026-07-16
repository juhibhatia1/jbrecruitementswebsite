import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  EMPLOYEE_SESSION_COOKIE,
  isValidEmployeeSessionToken,
} from "@/lib/employee-auth";

export const dynamic = "force-dynamic";

export default async function NewEmployeeInterviewPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(EMPLOYEE_SESSION_COOKIE)?.value;
  if (!isValidEmployeeSessionToken(token)) redirect("/employee");

  redirect("/employee/interviews");
}
