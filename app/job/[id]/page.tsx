"use client";

import { useEffect, useState, use } from "react";
import { Header } from "@/components/common/Header";
import { Loading } from "@/components/common/Loading";
import { JobThaiDetail } from "@/data/JobThai/type";
import { MapPin, DollarSign, Building2, Calendar, Globe, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [job, setJob] = useState<JobThaiDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await fetch(`/api/jobs/${id}`);
                if (!response.ok) {
                    if (response.status === 404) return notFound();
                    throw new Error("Failed to fetch job");
                }
                const data = await response.json();
                setJob(data.job);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-zinc-50 dark:bg-black"><Header /><div className="pt-32"><Loading /></div></div>;
    if (!job) return null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <Link href="/results" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-600 mb-6 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Results
                </Link>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{job.title}</h1>
                            <div className="flex items-center gap-2 text-lg text-blue-600 dark:text-blue-400 font-medium">
                                <Building2 className="h-5 w-5" />
                                {job.company}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400 border-y border-zinc-100 dark:border-zinc-800 py-6">
                            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-full">
                                <MapPin className="h-4 w-4" />
                                {job.location}
                            </div>
                            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-full">
                                <DollarSign className="h-4 w-4" />
                                {job.salary}
                            </div>
                            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-full">
                                <Calendar className="h-4 w-4" />
                                Posted: {job.postedDate}
                            </div>
                        </div>

                        <div className="space-y-6 pb-6">
                            <Section title="Description" content={job.description} />
                            <Section title="Requirements" content={job.requirements} />
                            <Section title="Benefits" content={job.benefits} />
                        </div>

                        <div className="flex justify-center pt-6 border-t border-zinc-100 dark:border-zinc-800">
                            <a
                                href={job.jobUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 active:scale-[0.98]"
                            >
                                Apply Now <Globe className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Section({ title, content }: { title: string; content: string }) {
    if (!content) return null;
    return (
        <div className="space-y-2">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{title}</h3>
            <div className="prose prose-zinc dark:prose-invert max-w-none whitespace-pre-line text-zinc-600 dark:text-zinc-400">
                {content}
            </div>
        </div>
    );
}
