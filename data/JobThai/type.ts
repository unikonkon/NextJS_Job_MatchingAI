export type JobThaiDetail = {
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
}

export type JobThai = {
    metadata: {
        totalJobs: number;
        lastUpdated: string;
        version: string;
    };
    jobs: JobThaiDetail[];
}