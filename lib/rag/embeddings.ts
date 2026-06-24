import { pipeline, env } from "@xenova/transformers";

// Disable checking for local models in the filesystem to avoid Webpack/Next.js bundle resolution issues.
// Transformers.js will download the model weights dynamically on first run and cache them in the system cache directory.
env.allowLocalModels = false;

let extractorInstance: any = null;

async function getExtractor() {
  if (!extractorInstance) {
    try {
      extractorInstance = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );
    } catch (error) {
      console.error("Failed to load Xenova embedding pipeline:", error);
      throw error;
    }
  }
  return extractorInstance;
}

/**
 * Generates a 384-dimensional vector embedding for the given text.
 * Uses the popular and lightweight all-MiniLM-L6-v2 model.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  // We clean up the text slightly (e.g. replace newlines with spaces) as is standard practice for embeddings
  const cleanText = text.replace(/\s+/g, " ").trim();
  
  if (!cleanText) {
    return new Array(384).fill(0);
  }

  const output = await extractor(cleanText, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
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
