export const RESUME_ANALYSIS_PROMPT = `
Analyze the attached resume (PDF) and extract structured data in strict JSON format.
Do not include any markdown formatting or explanations, just the raw JSON object.

Extract the following fields:
1. name (string)
2. email (string)
3. phone (string)
4. skills (array of strings) - List all technical and soft skills found.
5. experience (array of objects) - { title, company, duration, description, skills }
6. education (array of objects) - { degree, institution, year, field }
7. preferredLocations (array of strings) - Inferred from current location or explicit preference.
8. expectedSalary (string) - If mentioned, otherwise null.
9. keywords (array of strings) - Professional keywords for job matching.
10. summary (string) - A brief professional summary generated from the resume.

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
