
import { getJobById } from "@/lib/utils/job-data";
import { Header } from "@/components/common/Header";
import { Building2, MapPin, Banknote, Calendar, ArrowLeft, ExternalLink, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function JobDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const job = await getJobById(id);

    if (!job) {
        notFound();
    }

    const dateDisplay = job.parsedDate
        ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(job.parsedDate)
        : job.postedDate;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-4">
                    <Link
                        href="/jobs"
                        className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Jobs
                    </Link>

                    <Link
                        href={job.url || "#"}
                        target="_blank"
                        className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-blue-500/25 dark:bg-blue-600 dark:hover:bg-blue-500"
                    >
                        Apply Now
                        <ExternalLink className="ml-2 h-5 w-5" />
                    </Link>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 lg:p-10">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white lg:text-3xl">
                                {job.title}
                            </h1>
                            {job.previewText && (
                                <span className="flex items-center gap-1.5 pt-2">
                                    <p className="text-zinc-600 dark:text-zinc-400">{job.previewText}</p>
                                </span>
                            )}
                            <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">

                                <span className="flex items-center gap-1.5">
                                    <Building2 className="h-4 w-4" />
                                    {job.company || "Unknown Company"}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    {job.location}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Banknote className="h-4 w-4" />
                                    {job.salary}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    {dateDisplay}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Users className="h-4 w-4" />
                                    {job.positions}
                                </span>
                            </div>
                        </div>

                    </div>

                    <hr className="my-8 border-zinc-100 dark:border-zinc-800" />

                    <div className="space-y-8">
                        {job.companyHistory && (
                            <section>
                                <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                                    Company History
                                </h3>
                                <div className="prose prose-zinc max-w-none text-zinc-600 dark:prose-invert dark:text-zinc-400">
                                    <p>{job.companyHistory}</p>
                                </div>
                            </section>
                        )}

                        {job.previewText && (
                            <section>
                                <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                                    Job Description
                                </h3>
                                <div className="prose prose-zinc max-w-none text-zinc-600 dark:prose-invert dark:text-zinc-400">
                                    <p>{job.previewText}</p>
                                </div>
                            </section>
                        )}

                        {job.contact && (
                            <section>
                                <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                                    Contact
                                </h3>
                                <div className="prose prose-zinc max-w-none text-zinc-600 dark:prose-invert dark:text-zinc-400">
                                    <p>{job.contact}</p>
                                </div>
                            </section>
                        )}

                        {job.benefits && (
                            <section>
                                <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                                    Benefits
                                </h3>
                                <div className="prose prose-zinc max-w-none text-zinc-600 dark:prose-invert dark:text-zinc-400">
                                    <p>{job.benefits}</p>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
