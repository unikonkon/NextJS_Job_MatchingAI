export const RESUME_ANALYSIS_PROMPT = `
Analyze the attached resume (PDF) and extract structured data in strict JSON format.
Do not include any markdown formatting or explanations, just the raw JSON object.

Extract the following fields:
1. name (string)
2. email (string)
3. phone (string)
4. skills (array of strings) - List all technical and soft skills found. Extract from:
   - Technical skills mentioned in resume
   - Skills demonstrated in work experience
   - Tools and technologies used
   - Certifications and training
5. experience (array of objects) - { title, company, duration, description, skills }
   - Extract job titles that will be used for keyword matching with job titles
6. education (array of objects) - { degree, institution, year, field }
7. preferredLocations (array of strings) - Inferred from current location or explicit preference.
8. expectedSalary (string) - IMPORTANT:
   - If mentioned explicitly in resume, use that value
   - If NOT mentioned, estimate appropriate salary range based on:
     * Job title/position level (entry/mid/senior)
     * Years of experience
     * Technical skills and expertise level
     * Industry standards in Thailand
   - Format as number without commas (e.g., "35000" not "35,000")
   - Provide realistic Thai market rates (e.g., Junior: 15000-25000, Mid: 25000-45000, Senior: 45000-80000+)
9. keywords (array of strings) - CRITICAL for job matching:
   - Extract job titles and position names from experience
   - Include role-specific keywords (e.g., "developer", "engineer", "designer", "manager")
   - Include seniority level (e.g., "junior", "senior", "lead")
   - Include specializations (e.g., "frontend", "backend", "full-stack", "mobile")
   - These keywords will be matched against job titles in database
10. summary (string) - A brief professional summary (2-3 sentences) including:
    - Current role/level
    - Key expertise areas
    - Years of experience
    - Career focus

Ensure the output matches the TypeScript interface:
interface ResumeProfile {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: { title: string; company: string; duration: string; description: string; skills: string[] }[];
  education: { degree: string; institution: string; year: string; field: string }[];
  preferredLocations: string[];
  expectedSalary: string;
  keywords: string[];
  summary: string;
}
`;
