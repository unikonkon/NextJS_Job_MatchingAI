"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/common/Header";
import { getAllHistory, deleteHistoryItem } from "@/lib/db";
import { ResumeProfile } from "@/types/resume";
import { Trash2, ExternalLink, Calendar, Briefcase, FileText } from "lucide-react";

interface HistoryItem {
    id: string;
    profile: ResumeProfile;
    createdAt: number;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await getAllHistory();
            // Sort by createdAt desc
            const sorted = data.sort((a, b) => b.createdAt - a.createdAt);
            setHistory(sorted);
        } catch (error) {
            console.error("Failed to load history:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation if button is inside link (though it isn't here)
        if (!confirm("Are you sure you want to delete this history item?")) return;

        try {
            await deleteHistoryItem(id);
            setHistory(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error("Failed to delete item:", error);
            alert("Failed to delete item");
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Analysis History</h1>
                    <p className="text-muted-foreground mt-2">
                        View your past resume analyses and job matches.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading history...</div>
                ) : history.length === 0 ? (
                    <div className="text-center py-12 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
                        <FileText className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
                        <h3 className="text-lg font-medium">No history found</h3>
                        <p className="text-muted-foreground mt-2 mb-6">
                            Upload a resume to get started.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                            Upload Resume
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {history.map((item) => (
                            <div
                                key={item.id}
                                className="group relative flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-blue-400/50"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                                                {item.profile.name || "Unnamed Profile"}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(item.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                                            <Briefcase className="h-4 w-4 text-zinc-400" />
                                            <span className="line-clamp-1">
                                                {item.profile.experience?.[0]?.title || "No experience listed"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                            {item.profile.summary || "No summary available"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        onClick={(e) => handleDelete(item.id, e)}
                                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </button>
                                    <Link
                                        href={`/results?id=${item.id}`}
                                        className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                                    >
                                        View Results
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
