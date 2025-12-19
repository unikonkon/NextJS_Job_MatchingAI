
import { Job } from "@/lib/utils/job-data";
import { MapPin, Building2, Banknote, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface JobCardProps {
    job: Job;
}

export function JobCard({ job }: JobCardProps) {
    // Format date if parsed, otherwise use original string
    const dateDisplay = job.parsedDate
        ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(job.parsedDate)
        : job.postedDate;

    return (
        <Link
            href={`/job/${job.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-3 transition-all hover:bg-zinc-50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 dark:hover:border-zinc-700"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        {/* Placeholder for logo since most are empty strings in JSON */}
                        <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-zinc-400 dark:bg-zinc-800">
                            <Building2 className="h-6 w-6" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                            {job.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5" />
                                {job.company || "Unknown Company"}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                {job.location}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                        <Banknote className="h-4 w-4" />
                        {job.salary}
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-500">
                        <Calendar className="h-4 w-4" />
                        {dateDisplay}
                    </span>
                </div>

                <span
                    className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors group-hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-zinc-700"
                >
                    View Details
                </span>
            </div>
        </Link>
    );
}
