import { prisma } from "../prisma";
import { generateEmbedding } from "./embeddings";

/**
 * Deletes all chunks associated with a specific KnowledgeDocument.
 */
export async function deleteDocumentChunks(documentId: string): Promise<void> {
  await prisma.$executeRawUnsafe(
    `DELETE FROM "KnowledgeChunk" WHERE "documentId" = $1`,
    documentId
  );
}

/**
 * Generates embeddings for chunks and saves them in the database using pgvector.
 */
export async function upsertDocumentChunks(
  documentId: string,
  chunks: string[]
): Promise<void> {
  // First, clean out any existing chunks for this document
  await deleteDocumentChunks(documentId);

  if (chunks.length === 0) return;

  // Insert each chunk with its generated vector embedding
  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i];
    const embedding = await generateEmbedding(chunkText);
    const id = `chunk_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    const vectorString = `[${embedding.join(",")}]`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO "KnowledgeChunk" ("id", "documentId", "content", "embedding", "chunkIndex", "createdAt")
       VALUES ($1, $2, $3, $4::vector, $5, NOW())`,
      id,
      documentId,
      chunkText,
      vectorString,
      i
    );
  }
}

export interface SearchResult {
  content: string;
  score: number;
  documentTitle: string;
}

/**
 * Performs similarity search against active knowledge chunks using cosine distance (<=>).
 * Distance values range from 0 (identical) to 2 (opposite).
 * Similarity score is computed as (1 - distance).
 */
export async function searchSimilarChunks(
  query: string,
  topK: number = 4
): Promise<SearchResult[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);
    const vectorString = `[${queryEmbedding.join(",")}]`;

    // Query chunks using pgvector cosine distance.
    // Neon PostgreSQL has the pgvector extension preinstalled.
    const results = await prisma.$queryRawUnsafe<any[]>(
      `SELECT 
         c."content", 
         (c."embedding" <=> $1::vector) as distance,
         d."title" as "documentTitle"
       FROM "KnowledgeChunk" c
       JOIN "KnowledgeDocument" d ON c."documentId" = d."id"
       WHERE d."isActive" = true
       ORDER BY c."embedding" <=> $1::vector
       LIMIT $2`,
      vectorString,
      topK
    );

    return results.map((row) => {
      const distance = parseFloat(row.distance || "1");
      const score = Math.max(0, 1 - distance); // transform distance to similarity score
      return {
        content: row.content,
        score,
        documentTitle: row.documentTitle || "Untitled Document",
      };
    });
  } catch (error) {
    console.error("Vector similarity search error:", error);
    return searchSimilarChunksLexical(query, topK);
  }
}

async function searchSimilarChunksLexical(query: string, topK: number): Promise<SearchResult[]> {
  const terms = Array.from(
    new Set((query.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((term) => term.length > 2))
  ).slice(0, 8);

  const candidateRows = await prisma.$queryRawUnsafe<
    Array<{ content: string; documentTitle: string }>
  >(
    terms.length > 0
      ? `SELECT
           c."content",
           d."title" as "documentTitle"
         FROM "KnowledgeChunk" c
         JOIN "KnowledgeDocument" d ON c."documentId" = d."id"
         WHERE d."isActive" = true
           AND (
             ${terms
               .map(
                 (_, index) =>
                   `LOWER(c."content") LIKE $${index + 1} OR LOWER(d."title") LIKE $${index + 1}`,
               )
               .join(" OR ")}
           )
         LIMIT 50`
      : `SELECT
           c."content",
           d."title" as "documentTitle"
         FROM "KnowledgeChunk" c
         JOIN "KnowledgeDocument" d ON c."documentId" = d."id"
         WHERE d."isActive" = true
         ORDER BY c."createdAt" DESC
         LIMIT 50`,
    ...(terms.length > 0 ? terms.map((term) => `%${term}%`) : [])
  );

  const scoredRows = candidateRows
    .map((row) => {
      const haystack = `${row.documentTitle} ${row.content}`.toLowerCase();
      const score = terms.length
        ? terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0) / terms.length
        : 0.1;

      return {
        content: row.content,
        documentTitle: row.documentTitle || "Untitled Document",
        score,
      };
    })
    .sort((left, right) => right.score - left.score || right.content.length - left.content.length)
    .slice(0, topK);

  return scoredRows;
}
