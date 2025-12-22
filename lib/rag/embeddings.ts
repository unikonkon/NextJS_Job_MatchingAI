// Hugging Face Inference API for embeddings (Vercel-compatible)
const HF_API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!HF_API_KEY) {
    throw new Error("HUGGINGFACE_API_KEY environment variable is not set");
  }

  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: text,
      options: { wait_for_model: true }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Hugging Face API error: ${response.status} - ${error}`);
  }

  const embedding = await response.json();

  // HF API returns array directly or nested array
  const flatEmbedding = Array.isArray(embedding[0]) ? embedding[0] : embedding;

  return flatEmbedding;
}
