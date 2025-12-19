import { MatchResult } from "@/types/match";
import { ResumeProfile } from "@/types/resume";
import { SearchResult } from "./search";

// Weights for different scoring components
const WEIGHTS = {
  SKILL: 0.40,
  SEMANTIC: 0.30,
  EXPERIENCE: 0.15,
  LOCATION: 0.10,
  SALARY: 0.05
};

export function rankResults(searchResults: SearchResult[], profile: ResumeProfile): MatchResult[] {
  return searchResults.map(result => {
    const { job, score: semanticScore } = result;
    
    // 1. Skill Match
    const jobText = (job.title + " " + job.description + " " + job.requirements).toLowerCase();
    const userSkills = profile.skills.map(s => s.toLowerCase());
    
    const matchedSkills = userSkills.filter(skill => jobText.includes(skill));
    const missingSkills = userSkills.filter(skill => !jobText.includes(skill));
    
    const skillScore = userSkills.length > 0 
      ? matchedSkills.length / userSkills.length 
      : 0;

    // 2. Experience Match (Simple keyword matching in title)
    // In a real system, this would be more sophisticated
    let experienceScore = 0;
    const hasRoleMatch = profile.experience.some(exp => 
      job.title.toLowerCase().includes(exp.title.toLowerCase()) || 
      exp.title.toLowerCase().includes(job.title.toLowerCase())
    );
    if (hasRoleMatch) experienceScore = 1;

    // 3. Location Match
    const locationMatch = profile.preferredLocations.some(loc => 
      job.location.includes(loc) || loc === "Any"
    ) || job.location.includes("ไม่ระบุ"); // Give benefit of doubt

    const locationScore = locationMatch ? 1 : 0;

    // 4. Salary Match (Parsing would be needed for real logic, simple check here)
    // Assume match if not specified or simple text match
    const salaryMatch = profile.expectedSalary 
      ? job.salary.includes(profile.expectedSalary) || job.salary.includes("ตามตกลง") || job.salary.includes("โครงสร้างบริษัท")
      : true;
    
    const salaryScore = salaryMatch ? 1 : 0;

    // Calculate Overall Score
    const overallScore = (
      (skillScore * WEIGHTS.SKILL) +
      (semanticScore * WEIGHTS.SEMANTIC) +
      (experienceScore * WEIGHTS.EXPERIENCE) +
      (locationScore * WEIGHTS.LOCATION) +
      (salaryScore * WEIGHTS.SALARY)
    ) * 100; // Convert to 0-100

    // Generate Reasoning
    const reasoning = `Matches ${matchedSkills.length} skills. ${locationMatch ? "Location matches." : ""} ${hasRoleMatch ? "Experience aligns." : ""}`;

    return {
      job,
      overallScore: Math.round(overallScore),
      skillMatch: Math.round(skillScore * 100),
      semanticMatch: Math.round(semanticScore * 100),
      experienceMatch: Math.round(experienceScore * 100),
      locationMatch,
      salaryMatch,
      matchedSkills: profile.skills.filter(s => matchedSkills.includes(s.toLowerCase())), // Restore original case if possible, here using user's list
      missingSkills: profile.skills.filter(s => missingSkills.includes(s.toLowerCase())),
      reasoning: reasoning.trim()
    };
  }).sort((a, b) => b.overallScore - a.overallScore);
}
