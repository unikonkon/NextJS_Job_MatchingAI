import { MatchResult } from "@/types/match";
import { ResumeProfile } from "@/types/resume";
import { SearchResult } from "./search";
import { normalizeSkill, extractSkillsFromText } from "./skills";

// ============================================
// KEYWORD-PRIORITY WEIGHT CONFIGURATION
// ============================================

// Weights prioritizing KEYWORDS > SKILLS
const WEIGHTS = {
  KEYWORD: 0.50,     // PRIMARY - Keywords in title
  SKILL: 0.35,       // SECONDARY - Skills in benefits/requirements
  SEMANTIC: 0.10,    // TERTIARY - Context matching
  EXPERIENCE: 0.03,  // MINOR - Experience relevance
  LOCATION: 0.01,    // MINOR - Location preference
  SALARY: 0.01       // MINOR - Salary fit
};

/**
 * Rank results prioritizing KEYWORDS matching in title, then SKILLS
 */
export function rankResults(searchResults: SearchResult[], profile: ResumeProfile): MatchResult[] {
  return searchResults.map(result => {
    const { job, score: semanticScore } = result;

    // ========== PRIORITY 1: KEYWORD MATCH IN TITLE (50%) ==========
    const keywordScore = calculateKeywordScore(
      profile.keywords || [],
      job.title
    );

    // ========== PRIORITY 2: SKILL MATCH (35%) ==========
    const skillResult = calculateSkillScore(
      profile.skills,
      job
    );

    // ========== PRIORITY 3: EXPERIENCE MATCH (3%) ==========
    let experienceScore = 0;
    const hasRoleMatch = profile.experience.some(exp =>
      job.title.toLowerCase().includes(exp.title.toLowerCase()) ||
      exp.title.toLowerCase().includes(job.title.toLowerCase())
    );
    if (hasRoleMatch) experienceScore = 1;

    // ========== PRIORITY 4: LOCATION MATCH (1%) ==========
    const locationMatch = (profile.preferredLocations?.length ?? 0) === 0 ||
      profile.preferredLocations?.some(loc =>
        job.location.includes(loc) || loc === "Any"
      ) ||
      job.location.includes("ไม่ระบุ");
    const locationScore = locationMatch ? 1 : 0;

    // ========== PRIORITY 5: SALARY MATCH (1%) ==========
    const salaryMatch = !profile.expectedSalary ||
      job.salary.includes(profile.expectedSalary) ||
      job.salary.includes("ตามตกลง") ||
      job.salary.includes("โครงสร้างบริษัท");
    const salaryScore = salaryMatch ? 1 : 0;

    // ========== FINAL SCORE CALCULATION ==========
    const overallScore = (
      (keywordScore * WEIGHTS.KEYWORD) +
      (skillResult.score * WEIGHTS.SKILL) +
      (semanticScore * WEIGHTS.SEMANTIC) +
      (experienceScore * WEIGHTS.EXPERIENCE) +
      (locationScore * WEIGHTS.LOCATION) +
      (salaryScore * WEIGHTS.SALARY)
    ) * 100; // Convert to 0-100

    // Generate reasoning focused on keywords and skills
    const keywordCount = calculateKeywordMatches(profile.keywords || [], job.title);
    const skillCount = skillResult.matchedSkills.length;
    const totalSkills = skillResult.totalJobSkills;

    const reasoning = [
      keywordCount > 0 ? `พบคีย์เวิร์ดตรงกัน ${keywordCount}/${(profile.keywords || []).length} คำใน title` : null,
      skillCount > 0 ? `พบทักษะตรงกัน ${skillCount}/${totalSkills} รายการ (${Math.round(skillResult.precision * 100)}%)` : null,
      locationMatch ? "สถานที่ตรงกับต้องการ" : null,
      hasRoleMatch ? "ประสบการณ์สอดคล้อง" : null
    ].filter(Boolean).join(" • ") || "พบความเหมาะสมในระดับพื้นฐาน";

    return {
      job,
      overallScore: Math.round(overallScore),
      skillMatch: Math.round(skillResult.score * 100),
      semanticMatch: Math.round(semanticScore * 100),
      experienceMatch: Math.round(experienceScore * 100),
      locationMatch,
      salaryMatch,
      matchedSkills: skillResult.matchedSkills,
      missingSkills: skillResult.missingSkills,
      reasoning
    };
  }).sort((a, b) => b.overallScore - a.overallScore);
}

/**
 * Calculate keyword matching score in job title
 * - Exact match = คะแนนสูง
 * - Partial match = คะแนนกลาง
 * - No match = คะแนนต่ำ
 */
function calculateKeywordScore(keywords: string[], jobTitle: string): number {
  if (keywords.length === 0) return 0.5; // Neutral if no keywords

  const title = jobTitle.toLowerCase();
  let totalScore = 0;

  for (const keyword of keywords) {
    const kw = keyword.toLowerCase().trim();

    // Exact word match (คำตรงทั้งคำ)
    const exactRegex = new RegExp(`\\b${escapeRegex(kw)}\\b`, 'i');
    if (exactRegex.test(title)) {
      totalScore += 1.0; // Full score
      continue;
    }

    // Partial match (มีคำบางส่วน)
    if (title.includes(kw)) {
      totalScore += 0.5; // Half score
      continue;
    }

    // Fuzzy match (คำใกล้เคียง)
    const words = title.split(/\s+/);
    for (const word of words) {
      if (calculateSimpleSimilarity(kw, word) > 0.7) {
        totalScore += 0.3;
        break;
      }
    }
  }

  return totalScore / keywords.length;
}

/**
 * Calculate skill matching score
 * Search in benefits (primary), then requirements/description (secondary)
 */
function calculateSkillScore(
  userSkills: string[],
  job: any
): {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  precision: number;
  totalJobSkills: number;
} {
  const normalizedUserSkills = userSkills.map(normalizeSkill);

  // Extract skills from job fields with priority
  const benefitsText = job.benefits?.toLowerCase() || "";
  const requirementsText = job.requirements?.toLowerCase() || "";
  const descriptionText = job.description?.toLowerCase() || "";
  const titleText = job.title?.toLowerCase() || "";

  const benefitsSkills = extractSkillsFromText(benefitsText);
  const otherSkills = extractSkillsFromText(
    `${requirementsText} ${descriptionText} ${titleText}`
  );

  // Count matches with priority weighting
  const matchedInBenefits: string[] = [];
  const matchedInOther: string[] = [];
  let totalScore = 0;

  for (const userSkill of normalizedUserSkills) {
    if (benefitsSkills.includes(userSkill)) {
      matchedInBenefits.push(userSkill);
      totalScore += 1.0; // Full score for benefits
    } else if (otherSkills.includes(userSkill)) {
      matchedInOther.push(userSkill);
      totalScore += 0.6; // Reduced for other fields
    }
  }

  const matchedSkills = [...matchedInBenefits, ...matchedInOther];
  const allJobSkills = [...new Set([...benefitsSkills, ...otherSkills])];
  const missingSkills = allJobSkills.filter(js => !normalizedUserSkills.includes(js));

  // Precision: how many job requirements does user have?
  const precision = allJobSkills.length > 0
    ? matchedSkills.length / allJobSkills.length
    : 0;

  // Recall: how many user skills does job need?
  const recall = normalizedUserSkills.length > 0
    ? totalScore / normalizedUserSkills.length
    : 0;

  // Combined score (favor precision)
  const score = (precision * 0.6) + (recall * 0.4);

  return {
    score,
    matchedSkills,
    missingSkills,
    precision,
    totalJobSkills: allJobSkills.length
  };
}

/**
 * Count keyword matches in title
 */
function calculateKeywordMatches(keywords: string[], jobTitle: string): number {
  const title = jobTitle.toLowerCase();
  let count = 0;

  for (const keyword of keywords) {
    const kw = keyword.toLowerCase().trim();
    if (title.includes(kw)) count++;
  }

  return count;
}

/**
 * Helper: Escape regex special characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Helper: Calculate simple string similarity
 */
function calculateSimpleSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;

  const set1 = new Set(str1.split(''));
  const set2 = new Set(str2.split(''));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}
