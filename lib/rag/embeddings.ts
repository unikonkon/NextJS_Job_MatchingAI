// Hugging Face Transformers.js for embeddings
import { pipeline } from '@huggingface/transformers';

// Cache the pipeline to avoid reloading the model
let extractorPipeline: any = null;

async function getExtractor() {
  if (!extractorPipeline) {
    extractorPipeline = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
  }
  return extractorPipeline;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await getExtractor();

  // Generate embedding with mean pooling and normalization
  const output = await extractor(text, {
    pooling: 'mean',
    normalize: true
  });

  // Convert tensor to array
  const embedding = output.tolist();

  // Handle nested array structure
  const flatEmbedding = Array.isArray(embedding[0]) ? embedding[0] : embedding;

  return flatEmbedding;
}
