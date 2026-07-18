import { prisma } from "../lib/prisma";
import { generateEmbedding } from "../lib/rag/embeddings";

async function main() {
  const chunks = await prisma.knowledgeChunk.findMany({
    select: {
      id: true,
      content: true,
      documentId: true,
      chunkIndex: true,
    },
    orderBy: [{ documentId: "asc" }, { chunkIndex: "asc" }],
  });

  console.log(`Rebuilding embeddings for ${chunks.length} knowledge chunks...`);

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.content);
    const vectorString = `[${embedding.join(",")}]`;

    await prisma.$executeRawUnsafe(
      `UPDATE "KnowledgeChunk"
       SET "embedding" = $1::vector
       WHERE "id" = $2`,
      vectorString,
      chunk.id,
    );
  }

  console.log("Knowledge embeddings refreshed successfully.");
}

main()
  .catch((error) => {
    console.error("Failed to rebuild knowledge embeddings:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
