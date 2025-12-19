import { JobThaiDetail } from "@/data/JobThai/type";

export interface MatchResult {
  job: JobThaiDetail;
  overallScore: number;
  skillMatch: number;
  semanticMatch?: number;
  experienceMatch: number;
  locationMatch: boolean;
  salaryMatch: boolean;
  matchedSkills: string[];
  missingSkills: string[];
  reasoning: string;
}

export interface MatchFilters {
  minScore?: number;
  location?: string;
  minSalary?: number;
  limit?: number;
}
