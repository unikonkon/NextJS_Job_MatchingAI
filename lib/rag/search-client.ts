"use client";

import { JobThaiDetail } from "@/data/JobThai/type";
import { ResumeProfile } from "@/types/resume";
import { generateEmbedding } from "./embeddings-client";
import { getJobIndex, IndexedJob } from "./indexer-client";
import { normalizeSkill, extractSkillsFromText } from "./skills";
import { similarity } from "ml-distance";

export interface SearchResult {
  job: JobThaiDetail;
  score: number;
}

/**
 * Search jobs prioritizing KEYWORDS in job title first, then SKILLS
 * 1. Keyword-Title matching (PRIMARY - 60% weight)
 * 2. Skills matching (SECONDARY - 30% weight)
 * 3. Semantic search (TERTIARY - 10% weight)
 */
export async function searchJobs(
  profile: ResumeProfile,
  limit: number = 50,
  onProgress?: (current: number, total: number) => void
): Promise<SearchResult[]> {

  // Get job index with progress callback
  const index = await getJobIndex(onProgress);

  // Prepare search inputs
  const userKeywords = (profile.keywords || []).map(k => k.toLowerCase().trim());
  const userSkills = profile.skills.map(normalizeSkill);

  // Execute parallel searches with KEYWORDS as PRIMARY
  const [keywordResults, skillResults, semanticResults] = await Promise.all([
    keywordTitleSearch(userKeywords, index),
    skillBenefitsSearch(userSkills, index),
    semanticVectorSearch(profile, index)
  ]);

  // Fuse results with KEYWORDS having highest priority
  const fusedResults = fuseResultsMulti(
    keywordResults,
    skillResults,
    semanticResults,
    0.60, // Keywords weight
    0.30, // Skills weight
    0.10  // Semantic weight
  );

  // Return top K
  return fusedResults.slice(0, limit);
}

/**
 * PRIMARY SEARCH: Keyword matching in job TITLE
 */
function keywordTitleSearch(
  userKeywords: string[],
  index: IndexedJob[]
): SearchResult[] {

  const results = index.map(item => {
    const jobTitle = item.job.title.toLowerCase();

    if (userKeywords.length === 0) {
      return { job: item.job, score: 0.5 }; // Neutral if no keywords
    }

    let totalScore = 0;
    let exactMatches = 0;
    let partialMatches = 0;

    for (const keyword of userKeywords) {
      // Exact match
      const exactRegex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'i');
      if (exactRegex.test(jobTitle)) {
        exactMatches++;
        totalScore += 1.0;
        continue;
      }

      // Partial match
      if (jobTitle.includes(keyword)) {
        partialMatches++;
        totalScore += 0.5;
        continue;
      }

      // Similar words (fuzzy match)
      const words = jobTitle.split(/\s+/);
      for (const word of words) {
        const similarity = calculateStringSimilarity(keyword, word);
        if (similarity > 0.7) {
          totalScore += similarity * 0.3;
          break;
        }
      }
    }

    // Calculate final score (normalize by number of keywords)
    const score = totalScore / userKeywords.length;

    return { job: item.job, score };
  });

  return results.sort((a, b) => b.score - a.score);
}

/**
 * SECONDARY SEARCH: Skills matching in job fields
 */
function skillBenefitsSearch(
  userSkills: string[],
  index: IndexedJob[]
): SearchResult[] {

  const results = index.map(item => {
    // Search in available JobThaiDetail fields
    const benefitsText = item.job.benefits?.toLowerCase() || "";
    const previewText = item.job.previewText?.toLowerCase() || "";
    const titleText = item.job.title?.toLowerCase() || "";
    const contactText = item.job.contact?.toLowerCase() || "";
    const companyHistoryText = item.job.companyHistory?.toLowerCase() || "";

    // Priority: benefits (primary) > previewText, title, contact, companyHistory (secondary)
    const primaryText = benefitsText;
    const secondaryText = `${previewText} ${titleText} ${contactText} ${companyHistoryText}`;

    const primarySkills = extractSkillsFromText(primaryText);
    const secondarySkills = extractSkillsFromText(secondaryText);

    // Count matches with priority weighting
    let matchScore = 0;
    let matchedCount = 0;

    for (const userSkill of userSkills) {
      if (primarySkills.includes(userSkill)) {
        matchScore += 1.0;
        matchedCount++;
      } else if (secondarySkills.includes(userSkill)) {
        matchScore += 0.6;
        matchedCount++;
      }
    }

    // Precision: how many job requirements does user have?
    const allJobSkills = [...new Set([...primarySkills, ...secondarySkills])];
    const precision = allJobSkills.length > 0
      ? matchedCount / allJobSkills.length
      : 0;

    // Recall: how many user skills does job need?
    const recall = userSkills.length > 0
      ? matchScore / userSkills.length
      : 0;

    // Combined score favoring precision
    const score = (precision * 0.6) + (recall * 0.4);

    return { job: item.job, score };
  });

  return results.sort((a, b) => b.score - a.score);
}

/**
 * TERTIARY SEARCH: Semantic vector search
 */
async function semanticVectorSearch(
  profile: ResumeProfile,
  index: IndexedJob[]
): Promise<SearchResult[]> {

  const queryText = `
    Keywords: ${(profile.keywords || []).join(", ")}
    Skills: ${profile.skills.join(", ")}
    Summary: ${profile.summary || ""}
    Experience: ${profile.experience.map(e => `${e.title} at ${e.company}`).join("; ")}
  `.trim();

  const queryEmbedding = await generateEmbedding(queryText);

  const results = index.map(item => {
    const score = similarity.cosine(queryEmbedding, item.embedding);
    return { job: item.job, score };
  });

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Multi-source weighted fusion
 */
function fuseResultsMulti(
  keywordResults: SearchResult[],
  skillResults: SearchResult[],
  semanticResults: SearchResult[],
  keywordWeight: number,
  skillWeight: number,
  semanticWeight: number
): SearchResult[] {

  const scores = new Map<string, {
    job: JobThaiDetail;
    keyword: number;
    skill: number;
    semantic: number
  }>();

  // Normalize scores
  const maxKeyword = Math.max(...keywordResults.map(r => r.score), 0.001);
  const maxSkill = Math.max(...skillResults.map(r => r.score), 0.001);
  const maxSemantic = Math.max(...semanticResults.map(r => r.score), 0.001);

  // Add keyword results (PRIMARY)
  for (const result of keywordResults) {
    const normalized = result.score / maxKeyword;
    scores.set(result.job.id, {
      job: result.job,
      keyword: normalized,
      skill: 0,
      semantic: 0
    });
  }

  // Add skill results (SECONDARY)
  for (const result of skillResults) {
    const normalized = result.score / maxSkill;
    if (scores.has(result.job.id)) {
      scores.get(result.job.id)!.skill = normalized;
    } else {
      scores.set(result.job.id, {
        job: result.job,
        keyword: 0,
        skill: normalized,
        semantic: 0
      });
    }
  }

  // Add semantic results (TERTIARY)
  for (const result of semanticResults) {
    const normalized = result.score / maxSemantic;
    if (scores.has(result.job.id)) {
      scores.get(result.job.id)!.semantic = normalized;
    } else {
      scores.set(result.job.id, {
        job: result.job,
        keyword: 0,
        skill: 0,
        semantic: normalized
      });
    }
  }

  // Calculate weighted combined scores
  return Array.from(scores.values())
    .map(item => ({
      job: item.job,
      score: (item.keyword * keywordWeight) +
             (item.skill * skillWeight) +
             (item.semantic * semanticWeight)
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Helper: Escape regex special characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Helper: Calculate string similarity (simple Levenshtein-based)
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;

  // Simple character overlap ratio
  const set1 = new Set(str1.split(''));
  const set2 = new Set(str2.split(''));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}
