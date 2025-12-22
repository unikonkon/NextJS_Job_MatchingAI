
import { getFilteredJobs, JobFilterParams } from "@/lib/utils/job-data";
import { JobCard } from "@/components/jobs/JobCard";
import { JobSkeleton } from "./JobSkeleton";

interface JobResultsProps {
    params: JobFilterParams;
}

export async function JobResults({ params }: JobResultsProps) {
    const jobs = await getFilteredJobs(params);

    if (jobs.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
                <p className="text-zinc-500 dark:text-zinc-400">No jobs found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-md text-zinc-500 dark:text-zinc-400">
                    Showing <span className="font-medium text-zinc-900 dark:text-white">{jobs.length}</span> jobs
                </p>
            </div>
            <div className="space-y-4">
                {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}
            </div>
        </div>
    );
}
