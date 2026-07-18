import OpenAI from "openai";

const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 384;

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }

  return openaiClient;
}

function createFallbackEmbedding(text: string): number[] {
  const vector = new Array(EMBEDDING_DIMENSIONS).fill(0);
  const tokens = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];

  if (tokens.length === 0) {
    return vector;
  }

  for (const token of tokens) {
    let hash = 2166136261;
    for (let index = 0; index < token.length; index++) {
      hash ^= token.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    const bucket = Math.abs(hash) % EMBEDDING_DIMENSIONS;
    vector[bucket] += 1;
  }

  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  return magnitude > 0 ? vector.map((value) => value / magnitude) : vector;
}

/**
 * Generates a 384-dimensional vector embedding for the given text.
 * Uses OpenAI's `text-embedding-3-small` by default and keeps the current pgvector schema unchanged.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const cleanText = text.replace(/\s+/g, " ").trim();

  if (!cleanText) {
    return new Array(EMBEDDING_DIMENSIONS).fill(0);
  }

  const client = getOpenAIClient();
  if (!client) {
    return createFallbackEmbedding(cleanText);
  }

  try {
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: cleanText,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    const embedding = response.data[0]?.embedding ?? [];
    if (!embedding.length) {
      return createFallbackEmbedding(cleanText);
    }

    if (embedding.length === EMBEDDING_DIMENSIONS) {
      return embedding;
    }

    if (embedding.length > EMBEDDING_DIMENSIONS) {
      return embedding.slice(0, EMBEDDING_DIMENSIONS);
    }

    return [...embedding, ...new Array(EMBEDDING_DIMENSIONS - embedding.length).fill(0)];
  } catch (error) {
    console.error("OpenAI embedding generation failed, using lexical fallback:", error);
    return createFallbackEmbedding(cleanText);
  }
}

/**
 * Generates embeddings for a list of texts (helper utility).
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (const text of texts) {
    const emb = await generateEmbedding(text);
    embeddings.push(emb);
  }
  return embeddings;
}
