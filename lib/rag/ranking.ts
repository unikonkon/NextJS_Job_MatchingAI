import { MatchResult } from "@/types/match";
import { ResumeProfile } from "@/types/resume";
import { SearchResult } from "./search";
import { normalizeSkill, extractSkillsFromText } from "./skills";

// ============================================
// PRIORITY WEIGHT CONFIGURATION
// ============================================

// Weights: Title (50%), Salary (35%), Skills (15%)
const WEIGHTS = {
  KEYWORD: 0.50,     // PRIORITY 1 - Keywords in title (50%)
  SALARY: 0.35,      // PRIORITY 2 - Salary matching (35%)
  SKILL: 0.15,       // PRIORITY 3 - Skills in benefits/fields (15%)
  SEMANTIC: 0.00,    // Not used in new priority model
  EXPERIENCE: 0.00,  // Not used in new priority model
  LOCATION: 0.00     // Not used in new priority model
};

/**
 * Rank results with priority: Title (50%), Salary (35%), Skills (15%)
 */
export function rankResults(searchResults: SearchResult[], profile: ResumeProfile): MatchResult[] {
  return searchResults.map(result => {
    const { job, score: semanticScore } = result;

    // ========== PRIORITY 1: KEYWORD MATCH IN TITLE (50%) ==========
    const keywordScore = calculateKeywordScore(
      profile.keywords || [],
      job.title
    );

    // ========== PRIORITY 2: SALARY MATCH (35%) ==========
    const salaryResult = calculateSalaryScore(
      profile.expectedSalary,
      job.salary
    );

    // ========== PRIORITY 3: SKILL MATCH (15%) ==========
    const skillResult = calculateSkillScore(
      profile.skills,
      job
    );

    // Additional info for display (not used in scoring)
    const hasRoleMatch = profile.experience.some(exp =>
      job.title.toLowerCase().includes(exp.title.toLowerCase()) ||
      exp.title.toLowerCase().includes(job.title.toLowerCase())
    );
    const locationMatch = (profile.preferredLocations?.length ?? 0) === 0 ||
      profile.preferredLocations?.some(loc =>
        job.location.includes(loc) || loc === "Any"
      ) ||
      job.location.includes("ไม่ระบุ");

    // ========== FINAL SCORE CALCULATION ==========
    const overallScore = (
      (keywordScore * WEIGHTS.KEYWORD) +
      (salaryResult.score * WEIGHTS.SALARY) +
      (skillResult.score * WEIGHTS.SKILL)
    ) * 100; // Convert to 0-100

    // Generate reasoning focused on title, salary, and skills
    const keywordCount = calculateKeywordMatches(profile.keywords || [], job.title);
    const skillCount = skillResult.matchedSkills.length;
    const totalSkills = skillResult.totalJobSkills;

    const reasoning = [
      keywordCount > 0 ? `พบคีย์เวิร์ดตรงกัน ${keywordCount}/${(profile.keywords || []).length} คำใน title` : null,
      salaryResult.match ? `เงินเดือนเหมาะสม (${salaryResult.description})` : null,
      skillCount > 0 ? `พบทักษะตรงกัน ${skillCount}/${totalSkills} รายการ (${Math.round(skillResult.precision * 100)}%)` : null,
    ].filter(Boolean).join(" • ") || "พบความเหมาะสมในระดับพื้นฐาน";

    return {
      job,
      overallScore: Math.round(overallScore),
      skillMatch: Math.round(skillResult.score * 100),
      semanticMatch: Math.round(semanticScore * 100),
      experienceMatch: hasRoleMatch ? 100 : 0,
      locationMatch,
      salaryMatch: salaryResult.match,
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
 * Calculate salary matching score (PRIORITY 2: 35%)
 * Parse and compare salary ranges from JobThaiDetail
 */
function calculateSalaryScore(
  expectedSalary: string | undefined | null,
  jobSalary: string
): {
  score: number;
  match: boolean;
  description: string;
} {
  // If no expected salary, neutral score
  if (!expectedSalary) {
    return { score: 0.5, match: true, description: "ไม่ระบุเงินเดือนที่ต้องการ" };
  }

  // Parse expected salary (assume format like "25000" or "25,000")
  const expectedAmount = parseInt(expectedSalary.replace(/[^\d]/g, ''), 10);
  if (isNaN(expectedAmount)) {
    return { score: 0.5, match: true, description: "ไม่สามารถอ่านเงินเดือนที่ต้องการได้" };
  }

  // Parse job salary range
  const salaryLower = jobSalary.toLowerCase();

  // Check if negotiable
  if (salaryLower.includes("ตามตกลง") || salaryLower.includes("โครงสร้าง")) {
    return { score: 0.7, match: true, description: "ตามตกลง" };
  }

  // Extract salary numbers from job salary string
  const salaryNumbers = jobSalary.match(/\d{1,3}(?:,\d{3})*(?:\.\d+)?/g);
  if (!salaryNumbers || salaryNumbers.length === 0) {
    return { score: 0.5, match: true, description: "ไม่ระบุเงินเดือนชัดเจน" };
  }

  const amounts = salaryNumbers.map(s => parseInt(s.replace(/,/g, ''), 10));
  const minSalary = Math.min(...amounts);
  const maxSalary = Math.max(...amounts);

  // Calculate score based on range overlap
  if (expectedAmount >= minSalary && expectedAmount <= maxSalary) {
    // Perfect match - expected salary within job range
    return {
      score: 1.0,
      match: true,
      description: `${minSalary.toLocaleString()}-${maxSalary.toLocaleString()} บาท`
    };
  } else if (expectedAmount < minSalary) {
    // Expected lower than job offers - still good match
    const diff = minSalary - expectedAmount;
    const score = Math.max(0.6, 1.0 - (diff / expectedAmount) * 0.5);
    return {
      score,
      match: true,
      description: `สูงกว่าที่คาดหวัง (${minSalary.toLocaleString()}-${maxSalary.toLocaleString()} บาท)`
    };
  } else {
    // Expected higher than job offers - poor match
    const diff = expectedAmount - maxSalary;
    const score = Math.max(0.2, 1.0 - (diff / maxSalary) * 0.8);
    return {
      score,
      match: false,
      description: `ต่ำกว่าที่คาดหวัง (${minSalary.toLocaleString()}-${maxSalary.toLocaleString()} บาท)`
    };
  }
}

/**
 * Calculate skill matching score (PRIORITY 3: 15%)
 * Search in benefits (primary), then previewText, title, contact, companyHistory (secondary)
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

  // Extract skills from JobThaiDetail fields with priority
  const benefitsText = job.benefits?.toLowerCase() || "";
  const previewText = job.previewText?.toLowerCase() || "";
  const titleText = job.title?.toLowerCase() || "";
  const contactText = job.contact?.toLowerCase() || "";
  const companyHistoryText = job.companyHistory?.toLowerCase() || "";

  const benefitsSkills = extractSkillsFromText(benefitsText);
  const otherSkills = extractSkillsFromText(
    `${previewText} ${titleText} ${contactText} ${companyHistoryText}`
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
