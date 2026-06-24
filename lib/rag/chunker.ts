/**
 * Splits text into chunks with a specified size and overlap.
 * Tries to split on paragraph or sentence boundaries instead of in the middle of words.
 */
export function chunkDocument(
  text: string,
  options: { maxChunkSize?: number; overlap?: number } = {}
): string[] {
  const maxChunkSize = options.maxChunkSize || 600; // ~150-200 words
  const overlap = options.overlap || 100;

  if (!text || text.trim().length === 0) {
    return [];
  }

  // Split by double newlines to find paragraphs
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    const trimmedPara = paragraph.trim();
    if (!trimmedPara) continue;

    // If paragraph itself is too large, split it by sentences
    if (trimmedPara.length > maxChunkSize) {
      // If we have text in the current chunk, save it first
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }

      // Split large paragraph into sentences
      const sentences = trimmedPara.split(/(?<=[.!?])\s+/);
      let sentenceChunk = "";

      for (const sentence of sentences) {
        if (sentence.length > maxChunkSize) {
          // Sentence itself is massive (e.g. no punctuation), chunk it by character count
          if (sentenceChunk.trim()) {
            chunks.push(sentenceChunk.trim());
            sentenceChunk = "";
          }

          let index = 0;
          while (index < sentence.length) {
            const part = sentence.substring(index, index + maxChunkSize);
            chunks.push(part.trim());
            index += maxChunkSize - overlap;
          }
        } else if ((sentenceChunk + " " + sentence).length > maxChunkSize) {
          chunks.push(sentenceChunk.trim());
          // Start next chunk with overlap from the end of the previous sentence chunk if possible
          const overlapStart = Math.max(0, sentenceChunk.length - overlap);
          sentenceChunk = sentenceChunk.substring(overlapStart) + " " + sentence;
        } else {
          sentenceChunk = sentenceChunk ? `${sentenceChunk} ${sentence}` : sentence;
        }
      }

      if (sentenceChunk.trim()) {
        currentChunk = sentenceChunk;
      }
    } else if ((currentChunk + "\n\n" + trimmedPara).length > maxChunkSize) {
      chunks.push(currentChunk.trim());
      // Create new chunk with overlap
      const overlapStart = Math.max(0, currentChunk.length - overlap);
      currentChunk = currentChunk.substring(overlapStart) + "\n\n" + trimmedPara;
    } else {
      currentChunk = currentChunk ? `${currentChunk}\n\n${trimmedPara}` : trimmedPara;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((c) => c.length > 10); // ignore extremely short noise chunks
}
