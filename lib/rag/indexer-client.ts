"use client";

import jobsData from "@/data/JobThai/jobs.json";
import { JobThai, JobThaiDetail } from "@/data/JobThai/type";
import { generateEmbedding } from "./embeddings-client";

// Type assertion since we are importing JSON
const jobsDB = jobsData as unknown as JobThai;

export interface IndexedJob {
  job: JobThaiDetail;
  embedding: number[];
}

// Browser IndexedDB for caching
const DB_NAME = 'job-matcher-db';
const STORE_NAME = 'job-index';
const DB_VERSION = 1;

// In-memory cache
let jobIndexCache: IndexedJob[] | null = null;

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function loadFromIndexedDB(): Promise<IndexedJob[] | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get('job-index');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result || null);
      };
    });
  } catch (error) {
    console.error('Failed to load from IndexedDB:', error);
    return null;
  }
}

async function saveToIndexedDB(index: IndexedJob[]): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.put(index, 'job-index');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Failed to save to IndexedDB:', error);
  }
}

export async function getJobIndex(
  onProgress?: (current: number, total: number) => void
): Promise<IndexedJob[]> {
  // Return cache if available
  if (jobIndexCache) {
    return jobIndexCache;
  }

  // Try to load from IndexedDB
  const cachedIndex = await loadFromIndexedDB();
  if (cachedIndex && cachedIndex.length > 0) {
    console.log(`Loaded ${cachedIndex.length} jobs from cache`);
    jobIndexCache = cachedIndex;
    return cachedIndex;
  }

  console.log("Building job index...");

  // For demo purposes, we'll limit to first 50 jobs to speed up startup
  // In production, this should be pre-computed
  const jobsToIndex = jobsDB.jobs.slice(0, 50);
  const total = jobsToIndex.length;

  const indexedJobs: IndexedJob[] = [];

  for (let i = 0; i < jobsToIndex.length; i++) {
    const job = jobsToIndex[i];

    // Use available fields from JobThaiDetail
    const textToEmbed = `
      Title: ${job.title}
      Preview: ${job.previewText}
      Company: ${job.company}
      Company History: ${job.companyHistory}
      Benefits: ${job.benefits}
      Location: ${job.location}
      Salary: ${job.salary}
    `.trim();

    const embedding = await generateEmbedding(textToEmbed);
    indexedJobs.push({ job, embedding });

    // Report progress
    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  // Cache the results
  jobIndexCache = indexedJobs;
  await saveToIndexedDB(indexedJobs);

  console.log(`Indexed ${indexedJobs.length} jobs.`);

  return indexedJobs;
}

// Clear cache (useful for debugging)
export async function clearJobIndexCache(): Promise<void> {
  jobIndexCache = null;
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const request = store.delete('job-index');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(undefined);
    });
    console.log('Job index cache cleared');
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}
