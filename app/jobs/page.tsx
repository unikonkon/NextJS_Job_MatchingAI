
import { Suspense } from "react";
import { JobFilters } from "@/components/jobs/JobFilters";
import { Header } from "@/components/common/Header";
import { JobResults } from "@/components/jobs/JobResults";
import { JobsSkeletonList } from "@/components/jobs/JobSkeleton";

// Force dynamic since searchParams are used
export const dynamic = 'force-dynamic';

export default async function JobsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // Resolve params first (Next 15 requirement)
    const params = await searchParams;

    // Parse individual params
    const query = typeof params.query === 'string' ? params.query : undefined;
    const location = typeof params.location === 'string' ? params.location : undefined;
    const minSalaryStr = typeof params.minSalary === 'string' ? params.minSalary : undefined;
    const minSalary = minSalaryStr ? parseInt(minSalaryStr, 10) : undefined;
    const maxSalaryStr = typeof params.maxSalary === 'string' ? params.maxSalary : undefined;
    const maxSalary = maxSalaryStr ? parseInt(maxSalaryStr, 10) : undefined;
    const noSalarySpec = params.noSalarySpec === 'true';

    // Use a unique key based on params to force Suspense to re-trigger
    const suspenseKey = JSON.stringify({ query, location, minSalary, maxSalary, noSalarySpec });

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">All Jobs
                        <span className="text-orange-600 dark:text-orange-400"> in jobthai</span>
                    </h1>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                        Find your next opportunity from our curated list of positions.
                    </p>
                </div>

                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-80 shrink-0">
                        <div className="sticky top-24">
                            <JobFilters />
                        </div>
                    </aside>

                    {/* Job List */}
                    <div className="flex-1 min-h-[500px]">
                        <Suspense key={suspenseKey} fallback={<JobsSkeletonList />}>
                            <JobResults params={{ query, location, minSalary, maxSalary, noSalarySpec }} />
                        </Suspense>
                    </div>
                </div>
            </main>
        </div>
    );
}
