import Module from "module";

// Mock 'server-only' to allow Next.js server files to load in tsx / node environment
const originalRequire = (Module.prototype as any).require;
(Module.prototype as any).require = function (id: string) {
  if (id === "server-only") {
    return {};
  }
  return originalRequire.apply(this, arguments);
};

import { PrismaClient } from "@prisma/client";
import { getSystemContextText } from "../lib/rag/system-context";
import { chunkDocument } from "../lib/rag/chunker";
import { upsertDocumentChunks } from "../lib/rag/vector-store";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting knowledge base seeding...");

  try {
    // 1. Check if System Context already exists
    const existingSystemDoc = await prisma.knowledgeDocument.findFirst({
      where: { sourceType: "SYSTEM" },
    });

    const systemContent = getSystemContextText();

    let docId = "";
    if (existingSystemDoc) {
      console.log("System Context document already exists. Updating contents...");
      const updated = await prisma.knowledgeDocument.update({
        where: { id: existingSystemDoc.id },
        data: {
          content: systemContent,
          updatedAt: new Date(),
        },
      });
      docId = updated.id;
    } else {
      console.log("Creating default System Context document...");
      const created = await prisma.knowledgeDocument.create({
        data: {
          title: "System Site Context",
          content: systemContent,
          sourceType: "SYSTEM",
          isActive: true,
        },
      });
      docId = created.id;
    }

    // 2. Re-chunk the updated/created document
    console.log("Chunking document contents...");
    const chunks = chunkDocument(systemContent);
    console.log(`Generated ${chunks.length} chunks.`);

    // 3. Upsert chunks & generate vector embeddings
    console.log("Generating embeddings and writing to pgvector...");
    await upsertDocumentChunks(docId, chunks);
    console.log("Successfully stored embeddings in pgvector!");

    console.log("Knowledge base seeding completed successfully! 🚀");
  } catch (error) {
    console.error("Error seeding knowledge base:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
