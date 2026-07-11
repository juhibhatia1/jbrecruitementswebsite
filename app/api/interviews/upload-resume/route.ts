import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import { extractTextFromFile } from "@/lib/rag/document-parsers";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

const LOCAL_RESUME_DIRECTORY = path.join(
  process.cwd(),
  "storage",
  "job-seekers-resumes",
);

function sanitizeFileName(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName, extension);

  const sanitizedBaseName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${sanitizedBaseName || "resume"}-${randomUUID()}${extension}`;
}

async function saveResumeLocally(fileName: string, buffer: Buffer) {
  await mkdir(LOCAL_RESUME_DIRECTORY, { recursive: true });
  const storedFileName = sanitizeFileName(fileName);
  const storedFilePath = path.join(LOCAL_RESUME_DIRECTORY, storedFileName);
  await writeFile(storedFilePath, buffer);
  return `/api/admin/resumes?file=${storedFileName}`;
}

export async function POST(request: Request) {
  try {
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

    // Upload to ImageKit (fall back to local storage)
    let resumeUrl = "";
    try {
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: file.name,
        folder: "/job-seekers-resumes",
      });
      resumeUrl = uploadResponse.url;
    } catch (uploadError) {
      console.warn("[Upload Resume] ImageKit upload failed, saving locally:", uploadError);
      try {
        resumeUrl = await saveResumeLocally(file.name, buffer);
      } catch (localError) {
        console.error("[Upload Resume] Local save failed:", localError);
        return NextResponse.json({ error: "Failed to save resume file" }, { status: 500 });
      }
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
