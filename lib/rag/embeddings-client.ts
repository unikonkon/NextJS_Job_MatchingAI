"use client";

import { pipeline } from '@huggingface/transformers';

// Client-side embedding generator using Hugging Face Transformers.js
// This runs in the browser using ONNX Runtime

let extractorPipeline: any = null;
let isLoading = false;
let loadingPromise: Promise<any> | null = null;

async function getExtractor() {
  // If already loaded, return it
  if (extractorPipeline) {
    return extractorPipeline;
  }

  // If currently loading, wait for it
  if (isLoading && loadingPromise) {
    await loadingPromise;
    return extractorPipeline;
  }

  // Start loading
  isLoading = true;
  loadingPromise = pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2',
    {
      // Use ONNX quantized model for faster loading on web
      // quantized: true,
    }
  );

  try {
    extractorPipeline = await loadingPromise;
    console.log('Embedding model loaded successfully');
    return extractorPipeline;
  } catch (error) {
    console.error('Failed to load embedding model:', error);
    throw error;
  } finally {
    isLoading = false;
    loadingPromise = null;
  }
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

// Pre-load the model when this module is imported
// This happens asynchronously in the background
if (typeof window !== 'undefined') {
  getExtractor().catch(err => {
    console.warn('Background model loading failed:', err);
  });
}
