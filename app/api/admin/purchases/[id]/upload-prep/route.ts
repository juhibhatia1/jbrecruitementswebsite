import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ImageKit from "imagekit";
import { extractTextFromFile } from "@/lib/rag/document-parsers";
import path from "path";

let imagekitClient: ImageKit | null = null;
function getImageKit(): ImageKit {
  if (!imagekitClient) {
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
    if (!publicKey || !privateKey || !urlEndpoint) {
      throw new Error("ImageKit is not configured");
    }
    imagekitClient = new ImageKit({ publicKey, privateKey, urlEndpoint });
  }
  return imagekitClient;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: purchaseId } = await params;

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });
    }

    const allowedExtensions = [".pdf", ".doc", ".docx", ".txt", ".md"];
    const extension = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json({ error: "Invalid file type. Only PDF/Word/Text allowed." }, { status: 400 });
    }

    // Verify Purchase exists and is an Interview Prep purchase
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId }
    });

    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    if (!purchase.serviceName.toLowerCase().includes("interview prep")) {
      return NextResponse.json({ error: "Purchase is not for Interview Prep" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let prepText = "";
    try {
      prepText = await extractTextFromFile(buffer, file.name);
    } catch (parseError) {
      console.error("[Upload Prep] Failed to extract text:", parseError);
      return NextResponse.json(
        { error: "Failed to extract text from document" },
        { status: 422 }
      );
    }

    let fileUrl = "";
    try {
      const uploadResponse = await getImageKit().upload({
        file: buffer,
        fileName: file.name,
        folder: "/interview-prep-docs",
      });
      fileUrl = uploadResponse.url;
    } catch (uploadError) {
      console.error("[Upload Prep] ImageKit upload failed:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload to cloud storage" },
        { status: 500 }
      );
    }

    // Update purchase record
    const updatedPurchase = await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        interviewPrepUrl: fileUrl,
        interviewPrepText: prepText,
        deliveryStatus: "COMPLETED",
      }
    });

    return NextResponse.json({
      success: true,
      fileUrl,
      purchase: updatedPurchase
    });
  } catch (error) {
    console.error("[Upload Prep] Unexpected error:", error);
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
  }
}
