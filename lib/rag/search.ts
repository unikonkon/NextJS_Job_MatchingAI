import { JobThaiDetail } from "@/data/JobThai/type";
import { ResumeProfile } from "@/types/resume";
import { generateEmbedding } from "./embeddings";
import { getJobIndex } from "./indexer";
import { similarity } from "ml-distance";

export interface SearchResult {
  job: JobThaiDetail;
  score: number;
}

export async function searchJobs(profile: ResumeProfile, limit: number = 50): Promise<SearchResult[]> {
  // Generate embedding for the resume (combine skills, summary, and experience)
  const queryText = `
    Skills: ${profile.skills.join(", ")}
    Keywords: ${profile.keywords.join(", ")}
    Summary: ${profile.summary}
    Experience: ${profile.experience.map(e => `${e.title} at ${e.company}`).join("; ")}
  `.trim();

  const queryEmbedding = await generateEmbedding(queryText);
  const index = await getJobIndex();

  // Calculate cosine similarity for all jobs
  const results = index.map(item => {
    const score = similarity.cosine(queryEmbedding, item.embedding);
    return {
      job: item.job,
      score: score
    };
  });

  // Sort by score descending and take top K
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
