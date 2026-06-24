import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin-auth";

/**
 * Admin Knowledge operations by ID
 * GET /api/admin/knowledge/[id] -> Preview content
 * PATCH /api/admin/knowledge/[id] -> Toggle status
 * DELETE /api/admin/knowledge/[id] -> Delete document (Cascade deletes chunks)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!isValidAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const document = await prisma.knowledgeDocument.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Failed to fetch single document:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!isValidAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { title, isActive } = body;

    const currentDoc = await prisma.knowledgeDocument.findUnique({
      where: { id },
    });

    if (!currentDoc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Don't allow changing system context documents' activity or title
    if (currentDoc.sourceType === "SYSTEM" && (isActive === false || title !== undefined)) {
      return NextResponse.json(
        { error: "The System Context document cannot be edited or deactivated." },
        { status: 400 }
      );
    }

    const updatedDocument = await prisma.knowledgeDocument.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("Failed to update document:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!isValidAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const document = await prisma.knowledgeDocument.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (document.sourceType === "SYSTEM") {
      return NextResponse.json(
        { error: "The default System Context document cannot be deleted." },
        { status: 400 }
      );
    }

    // KnowledgeChunk rows will be deleted automatically due to relation CASCADE
    await prisma.knowledgeDocument.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
