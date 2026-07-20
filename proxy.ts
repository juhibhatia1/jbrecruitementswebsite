import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Centralised authentication guard for all admin routes.
 *
 * Runs at the Edge before any API route or page handler fires, so no
 * individual route can accidentally skip the auth check.
 *
 * Full JWT HMAC-SHA256 verification still happens inside each API route handler;
 * this proxy only checks for cookie presence + valid 3-part JWT shape so it
 * remains edge-compatible (no Node.js crypto needed here).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Guard all admin paths
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // Always allow the login page and login API through unauthenticated
    if (
      pathname === "/admin" ||
      pathname === "/api/admin/login" ||
      pathname === "/api/admin/auth/login"
    ) {
      return NextResponse.next();
    }

    const session = request.cookies.get("jb_admin_session")?.value;

    // Reject if cookie is missing or not a valid 3-part JWT
    if (!session || session.split(".").length !== 3) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized. Admin session required." },
          { status: 401 },
        );
      }
      const loginUrl = new URL("/admin", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
