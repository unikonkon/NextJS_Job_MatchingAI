"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Loading } from "@/components/common/Loading";
import { JobCard } from "@/components/results/JobCard";
import { MatchResult } from "@/types/match";
import { ResumeProfile } from "@/types/resume";

export default function ResultsPage() {
    const router = useRouter();
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ResumeProfile | null>(null);

    useEffect(() => {
        // 1. Get profile from session storage
        const storedProfile = sessionStorage.getItem("resumeProfile");

        if (!storedProfile) {
            router.push("/");
            return;
        }

        const parsedProfile = JSON.parse(storedProfile) as ResumeProfile;
        setProfile(parsedProfile);

        // 2. Fetch matches using the profile
        const fetchMatches = async () => {
            try {
                const response = await fetch("/api/match", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ profile: parsedProfile, limit: 10 }),
                });

                if (!response.ok) throw new Error("Failed to fetch matches");

                const data = await response.json();
                setMatches(data.matches);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black">
                <Header />
                <div className="flex h-[calc(100vh-64px)]flex-col items-center justify-center space-y-4 pt-32">
                    <Loading />
                    <p className="text-zinc-500 animate-pulse">Finding best matches for you...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                        Matched Jobs
                    </h1>
                    <p className="text-zinc-500 mt-2">
                        Found {matches.length} jobs matching your skills and experience.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {matches.map((match) => (
                        <JobCard key={match.job.id} match={match} />
                    ))}
                </div>
            </main>
        </div>
    );
}
