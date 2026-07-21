import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  authenticateAdminCredentials,
  generateAdminSessionToken,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      username?: string;
      password?: string;
    };

    const email = body?.email?.trim() || body?.username?.trim() || "";
    const password = body?.password || "";

    const session = await authenticateAdminCredentials(email, password);
    if (!session) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const token = generateAdminSessionToken(session);
    const response = NextResponse.json({ success: true }, { status: 200 });

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: token,
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
