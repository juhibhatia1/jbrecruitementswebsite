import { NextResponse } from "next/server";
import { EMPLOYEE_SESSION_COOKIE } from "@/lib/employee-auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(EMPLOYEE_SESSION_COOKIE, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  return response;
}
