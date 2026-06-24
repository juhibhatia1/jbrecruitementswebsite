import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin-auth";
import { extractTextFromFile } from "@/lib/rag/document-parsers";
import { chunkDocument } from "@/lib/rag/chunker";
import { upsertDocumentChunks } from "@/lib/rag/vector-store";

/**
 * Admin Knowledge endpoint
 * GET: Lists all documents
 * POST: Uploads a file (PDF, DOCX, TXT, MD) or text, chunks, embeds, and saves
 */

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!isValidAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const documents = await prisma.knowledgeDocument.findMany({
      include: {
        _count: {
          select: { chunks: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Failed to fetch knowledge documents:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!isValidAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const file = formData.get("file") as File | null;
    const rawText = formData.get("text") as string | null;

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    let content = "";
    let sourceType = "UPLOAD_TEXT";
    let fileName = null;

    if (file && file.size > 0) {
      fileName = file.name;
      const buffer = Buffer.from(await file.arrayBuffer());
      content = await extractTextFromFile(buffer, fileName);

      const ext = fileName.split(".").pop()?.toLowerCase();
      if (ext === "pdf") sourceType = "UPLOAD_PDF";
      else if (ext === "docx") sourceType = "UPLOAD_DOCX";
      else if (ext === "md" || ext === "markdown") sourceType = "UPLOAD_MD";
      else sourceType = "UPLOAD_TEXT";
    } else if (rawText) {
      content = rawText;
      sourceType = "UPLOAD_TEXT";
    } else {
      return NextResponse.json(
        { error: "Please upload a file or enter text content." },
        { status: 400 }
      );
    }

    if (!content || content.trim().length < 5) {
      return NextResponse.json(
        { error: "Document content is empty or too short to index." },
        { status: 400 }
      );
    }

    // 1. Create document entry
    const document = await prisma.knowledgeDocument.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        sourceType,
        fileName,
        isActive: true,
      },
    });

    // 2. Chunk text
    const chunks = chunkDocument(content);

    // 3. Generate embeddings and save chunks
    await upsertDocumentChunks(document.id, chunks);

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        chunkCount: chunks.length,
      },
    });
  } catch (error: any) {
    console.error("Failed to process document upload:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process document upload." },
      { status: 500 }
    );
  }
}
