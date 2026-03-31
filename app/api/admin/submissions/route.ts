import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin-auth";
import { getSubmissionStore } from "@/lib/submissions-store";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!isValidAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await getSubmissionStore();

  return NextResponse.json({
    contactSubmissions: store.contactSubmissions,
    jobSeekerSubmissions: store.jobSeekerSubmissions,
  });
}
