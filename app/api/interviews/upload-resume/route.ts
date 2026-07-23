import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import { extractTextFromFile } from "@/lib/rag/document-parsers";
import { getClientIp, isRateLimited } from "@/lib/rate-limiter";
import path from "path";

function isImageKitQuotaError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message =
    "message" in error && typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message
      : "";
  const help =
    "help" in error && typeof (error as { help?: unknown }).help === "string"
      ? (error as { help: string }).help
      : "";

  return /upload limit exceeded/i.test(message) || /upload limit exceeded/i.test(help);
}

// Lazily construct ImageKit on first request. Constructing at module scope would
// run during `next build` page-data collection, where the ImageKit constructor
// throws "Missing publicKey" and fails the whole build.
let imagekitClient: ImageKit | null = null;
function getImageKit(): ImageKit {
  if (!imagekitClient) {
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
    if (!publicKey || !privateKey || !urlEndpoint) {
      throw new Error(
        "ImageKit is not configured: set NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT.",
      );
    }
    imagekitClient = new ImageKit({ publicKey, privateKey, urlEndpoint });
  }
  return imagekitClient;
}

export async function POST(request: Request) {
  try {
    // Rate limit: 3 resume uploads per hour per IP to prevent storage exhaustion
    const ip = getClientIp(request);
    if (isRateLimited(ip, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many upload attempts. Please try again in an hour." },
        { status: 429 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json({ error: "No resume file uploaded" }, { status: 400 });
    }

    // Size limit check (5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Resume file exceeds the maximum allowed size of 5MB" },
        { status: 400 },
      );
    }

    // Extension verification
    const allowedExtensions = [".pdf", ".doc", ".docx", ".txt", ".md"];
    const extension = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, Word, and text documents (.pdf, .doc, .docx, .txt, .md) are allowed." },
        { status: 400 },
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from the file
    let resumeText = "";
    try {
      resumeText = await extractTextFromFile(buffer, file.name);
    } catch (parseError) {
      console.error("[Upload Resume] Failed to extract text:", parseError);
      return NextResponse.json(
        { error: parseError instanceof Error ? parseError.message : "Failed to extract text from resume" },
        { status: 422 },
      );
    }

    // Upload to ImageKit (no local storage fallback)
    let resumeUrl = "";
    try {
      const uploadResponse = await getImageKit().upload({
        file: buffer,
        fileName: file.name,
        folder: "/job-seekers-resumes",
      });
      resumeUrl = uploadResponse.url;
    } catch (uploadError) {
      console.error("[Upload Resume] ImageKit upload failed:", uploadError);
      if (isImageKitQuotaError(uploadError)) {
        return NextResponse.json(
          {
            error:
              "Resume storage is temporarily full on our cloud provider. Please try again later or contact support if the issue persists.",
          },
          { status: 507 },
        );
      }
      return NextResponse.json(
        { error: "Failed to upload resume to cloud storage. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      resumeUrl,
      resumeText,
    });
  } catch (error) {
    console.error("[Upload Resume] Unexpected error:", error);
    return NextResponse.json({ error: "Failed to process resume upload" }, { status: 500 });
  }
}
