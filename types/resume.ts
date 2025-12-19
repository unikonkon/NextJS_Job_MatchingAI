export interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
  skills: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  field: string;
}

export interface ResumeProfile {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  preferredLocations: string[];
  expectedSalary: string;
  keywords: string[];
  summary: string;
  rawText?: string;
}
