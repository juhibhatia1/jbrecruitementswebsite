import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readFile } from "fs/promises";
import path from "path";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin-auth";

const LOCAL_RESUME_DIRECTORY = path.join(
  process.cwd(),
  "storage",
  "job-seekers-resumes",
);

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

    if (!isValidAdminSessionToken(token)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("file");

    if (!fileName) {
      return new NextResponse("File parameter is required", { status: 400 });
    }

    // Path traversal prevention: extract base filename
    const safeFileName = path.basename(fileName);
    const filePath = path.resolve(LOCAL_RESUME_DIRECTORY, safeFileName);

    // Verify target file lies strictly inside the private directory
    if (!filePath.startsWith(LOCAL_RESUME_DIRECTORY)) {
      return new NextResponse("Access Denied", { status: 403 });
    }

    const fileBuffer = await readFile(filePath);

    let contentType = "application/octet-stream";
    const extension = path.extname(safeFileName).toLowerCase();
    if (extension === ".pdf") {
      contentType = "application/pdf";
    } else if (extension === ".docx") {
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (extension === ".doc") {
      contentType = "application/msword";
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${safeFileName}"`,
      },
    });
  } catch (err) {
    console.error("Error reading secure file:", err);
    return new NextResponse("File not found", { status: 404 });
  }
}
