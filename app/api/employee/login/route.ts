import { NextResponse } from "next/server";
import {
  EMPLOYEE_SESSION_COOKIE,
  authenticateEmployeeCredentials,
  generateEmployeeSessionToken,
} from "@/lib/employee-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      username?: string;
      password?: string;
    };
    const email = body?.email?.trim() || body?.username?.trim() || "";
    const password = body?.password || "";

    const session = await authenticateEmployeeCredentials(email, password);
    if (!session) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = generateEmployeeSessionToken(session);
    const response = NextResponse.json({ success: true });

    // Set secure HttpOnly session cookie
    response.cookies.set(EMPLOYEE_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Employee login error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
