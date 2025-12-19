import jobsData from "@/data/JobThai/jobs.json";
import { JobThai, JobThaiDetail } from "@/data/JobThai/type";
import { generateEmbedding } from "./embeddings";

// Type assertion since we are importing JSON
const jobsDB = jobsData as unknown as JobThai;

export interface IndexedJob {
  job: JobThaiDetail;
  embedding: number[];
}

// In-memory cache
let jobIndexCache: IndexedJob[] | null = null;

export async function getJobIndex(): Promise<IndexedJob[]> {
  if (jobIndexCache) {
    return jobIndexCache;
  }

  console.log("Building job index...");
  
  // For demo purposes, we'll limit to first 50 jobs to speed up startup
  // In production, this should be pre-computed
  const jobsToIndex = jobsDB.jobs.slice(0, 50);
  
  const indexedJobs: IndexedJob[] = [];

  for (const job of jobsToIndex) {
    const textToEmbed = `
      Title: ${job.title}
      Description: ${job.description}
      Requirements: ${job.requirements}
      Location: ${job.location}
    `.trim();

    const embedding = await generateEmbedding(textToEmbed);
    indexedJobs.push({ job, embedding });
  }

  jobIndexCache = indexedJobs;
  console.log(`Indexed ${indexedJobs.length} jobs.`);
  
  return indexedJobs;
}
