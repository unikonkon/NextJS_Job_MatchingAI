
export function JobSkeleton() {
    return (
        <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 w-full">
                    {/* Logo Skeleton */}
                    <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />

                    <div className="w-full space-y-2">
                        {/* Title Skeleton */}
                        <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />

                        {/* Company & Location Skeleton */}
                        <div className="flex flex-wrap gap-4">
                            <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-50 dark:bg-zinc-800/50" />
                            <div className="h-4 w-1/4 animate-pulse rounded bg-zinc-50 dark:bg-zinc-800/50" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    <div className="h-4 w-24 animate-pulse rounded bg-zinc-50 dark:bg-zinc-800/50" />
                    <div className="h-4 w-20 animate-pulse rounded bg-zinc-50 dark:bg-zinc-800/50" />
                </div>
                <div className="h-9 w-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            </div>
        </div>
    );
}

export function JobsSkeletonList() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <JobSkeleton key={i} />
            ))}
        </div>
    );
}
