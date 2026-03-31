import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getSessionToken,
  isValidAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };

    const username = body?.username?.trim() || "";
    const password = body?.password || "";

    if (!isValidAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ success: true }, { status: 200 });

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: getSessionToken(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 },
    );
  }
}
