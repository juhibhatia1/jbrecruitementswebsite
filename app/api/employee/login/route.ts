import { NextResponse } from "next/server";
import {
  EMPLOYEE_SESSION_COOKIE,
  generateEmployeeSessionToken,
  isValidEmployeeCredentials,
} from "@/lib/employee-auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!isValidEmployeeCredentials(username, password)) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const token = generateEmployeeSessionToken(username);
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
