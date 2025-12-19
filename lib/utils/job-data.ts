import fs from "fs";
import path from "path";

// Define the Job interface based on the JSON structure
export interface Job {
  id: string;
  url: string;
  previewText: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  salary: string;
  description: string;
  requirements: string;
  benefits: string;
  jobUrl: string;
  postedDate: string;
  scrapedAt: string;

  // Parsed fields
  parsedDate?: Date;
  minSalary?: number;
  maxSalary?: number;
}

interface JobsData {
  metadata: {
    totalJobs: number;
    lastUpdated: string;
    version: string;
  };
  jobs: Job[];
}

// Helper to parse Thai date string "2 ธ.ค. 68" -> Date object
function parseThaiDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;

  try {
    const parts = dateStr.trim().split(" ");
    if (parts.length < 3) return undefined;

    const day = parseInt(parts[0], 10);
    const monthStr = parts[1];
    const yearTh = parseInt(parts[2], 10);

    // Map Thai months to 0-indexed month numbers
    const thaiMonths: Record<string, number> = {
      "ม.ค.": 0,
      "ก.พ.": 1,
      "มี.ค.": 2,
      "เม.ย.": 3,
      "พ.ค.": 4,
      "มิ.ย.": 5,
      "ก.ค.": 6,
      "ส.ค.": 7,
      "ก.ย.": 8,
      "ต.ค.": 9,
      "พ.ย.": 10,
      "ธ.ค.": 11,
    };

    const month = thaiMonths[monthStr];
    if (month === undefined) return undefined;

    // Convert Thai year to AD (assuming 2-digit BE year 68 = 2568, 2568 - 543 = 2025)
    // If it's a 2 digit year, add 2500 then subtract 543.
    // Example: 68 -> 2568 -> 2025
    let yearAD = 0;
    if (yearTh < 100) {
      yearAD = 2500 + yearTh - 543;
    } else {
      yearAD = yearTh - 543;
    }

    return new Date(yearAD, month, day);
  } catch (e) {
    console.error(`Failed to parse date: ${dateStr}`, e);
    return undefined;
  }
}

// Helper to parse salary string "18,000 - 23,000 บาท" or "25,000 - 35,000 บาท"
function parseSalary(salaryStr: string): { min?: number; max?: number } {
  if (
    !salaryStr ||
    salaryStr.includes("ระบุ") ||
    salaryStr.includes("โครงสร้าง")
  ) {
    return {};
  }

  try {
    // Remove non-numeric chars except hyphen
    const cleanStr = salaryStr.replace(/[^\d\-]/g, "");
    const parts = cleanStr.split("-").filter((p) => p.trim() !== "");

    if (parts.length === 2) {
      return {
        min: parseInt(parts[0], 10),
        max: parseInt(parts[1], 10),
      };
    } else if (parts.length === 1) {
      return {
        min: parseInt(parts[0], 10),
      };
    }

    return {};
  } catch (e) {
    return {};
  }
}

export async function getJobs(): Promise<Job[]> {
  const filePath = path.join(process.cwd(), "data/JobThai/jobs.json");
  const fileContents = fs.readFileSync(filePath, "utf8");
  const data: JobsData = JSON.parse(fileContents);

  return data.jobs
    .map((job) => {
      const parsedSalary = parseSalary(job.salary);
      return {
        ...job,
        parsedDate: parseThaiDate(job.postedDate),
        minSalary: parsedSalary.min,
        maxSalary: parsedSalary.max,
      };
    })
    .sort((a, b) => {
      // Sort by date desc
      const dateA = a.parsedDate?.getTime() || 0;
      const dateB = b.parsedDate?.getTime() || 0;
      return dateB - dateA;
    });
}

export type JobFilterParams = {
  query?: string;
  location?: string;
  minSalary?: number;
  maxSalary?: number;
};

export async function getFilteredJobs(params: JobFilterParams): Promise<Job[]> {
  // Artificial delay to show loading state
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  const jobs = await getJobs();

  return jobs.filter((job) => {
    // 1. Text Search (Title or Company)
    if (params.query) {
      const q = params.query.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchCompany = job.company.toLowerCase().includes(q);
      if (!matchTitle && !matchCompany) return false;
    }

    // 2. Location
    if (params.location) {
      if (!job.location.toLowerCase().includes(params.location.toLowerCase())) {
        return false;
      }
    }

    // 3. Min Salary
    // If job has minSalary, check if it's >= param.minSalary
    // If job has maxSalary but no min, assume it might fall in range?
    // Let's stick to strict: if user wants 20k, job must explicitly have a min >= 20k or max >= 20k.
    // If job says "Negotiable" (no salary), we might exclude it if filter is active.
    if (params.minSalary) {
      if (!job.minSalary && !job.maxSalary) return false; // Exclude unknown salary if filtering

      const jobHigh = job.maxSalary || job.minSalary || 0;
      if (jobHigh < params.minSalary) return false;
    }

    // 4. Max Salary
    if (params.maxSalary) {
        if (!job.minSalary && !job.maxSalary) return false;
        
        // If job starts at 50k, and user says max 40k, it's a mismatch.
        // Job min salary should be <= param.maxSalary
        const jobLow = job.minSalary || job.maxSalary || 0;
        if (jobLow > params.maxSalary) return false;
    }

    return true;
  });
}

export async function getJobById(id: string): Promise<Job | undefined> {
  const jobs = await getJobs();
  return jobs.find(job => job.id === id);
}
