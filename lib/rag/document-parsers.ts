import pdf from "pdf-parse";
import mammoth from "mammoth";

/**
 * Extracts plain text content from various file formats based on file extension and/or mimeType.
 * Supports PDF, DOCX, TXT, and MD.
 */
export async function extractTextFromFile(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "pdf":
      return await parsePDF(buffer);
    case "docx":
      return await parseDocx(buffer);
    case "txt":
    case "md":
    case "markdown":
      return parseText(buffer);
    default:
      // Fallback: try parsing as text
      return parseText(buffer);
  }
}

/**
 * Parses a PDF buffer and returns its text contents.
 */
async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text || "";
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF document. Ensure the file is not corrupted.");
  }
}

/**
 * Parses a Word document (.docx) buffer and returns its text contents.
 */
async function parseDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } catch (error) {
    console.error("Error parsing Word docx:", error);
    throw new Error("Failed to parse Word (.docx) document. Ensure the file is not corrupted.");
  }
}

/**
 * Decodes a text or markdown buffer as a UTF-8 string.
 */
function parseText(buffer: Buffer): string {
  try {
    return buffer.toString("utf8");
  } catch (error) {
    console.error("Error decoding text file:", error);
    throw new Error("Failed to decode text file. Ensure it is encoded in UTF-8.");
  }
}
