import { pipeline, FeatureExtractionPipeline, PipelineType } from "@xenova/transformers";

// Use a more generic approach for the singleton to avoid complex type matching issues with the library
// Use a more generic approach for the singleton to avoid complex type matching issues with the library
class PipelineInstance {
  static task: PipelineType = "feature-extraction";
  static model = "Xenova/all-MiniLM-L6-v2";
  static instance: Promise<FeatureExtractionPipeline> | null = null;

  static async getInstance() {
    if (this.instance === null) {
      // Cast the result to FeatureExtractionPipeline to satisfy TypeScript
      this.instance = pipeline(this.task, this.model) as Promise<FeatureExtractionPipeline>;
    }
    return this.instance;
  }
}

// Global declaration for development hot-reloading
declare global {
  var PipelineSingleton: typeof PipelineInstance | undefined;
}

const GlobalPipeline = global.PipelineSingleton || PipelineInstance;

if (process.env.NODE_ENV !== "production") {
  global.PipelineSingleton = GlobalPipeline;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await GlobalPipeline.getInstance();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  // Ensure we return a number array
  return Array.from(output.data);
}
