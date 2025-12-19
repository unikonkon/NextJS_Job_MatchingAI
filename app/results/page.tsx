"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Loading } from "@/components/common/Loading";
import { JobCard } from "@/components/results/JobCard";
import { MatchResult } from "@/types/match";
import { ResumeProfile } from "@/types/resume";
import { getProfile, saveMatches, getMatches } from "@/lib/db";
import { AnalysisViewer } from "@/components/results/AnalysisViewer";

function ResultsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ResumeProfile | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!id) {
                router.push("/");
                return;
            }

            try {
                // 1. Get profile from IndexedDB
                const cachedData = await getProfile(id);

                if (!cachedData || !cachedData.profile) {
                    router.push("/");
                    return;
                }

                const currentProfile = cachedData.profile;
                setProfile(currentProfile);

                // Check for existing matches
                const savedMatches = await getMatches(id);
                if (savedMatches && savedMatches.matches.length > 0) {
                    setMatches(savedMatches.matches);
                    setLoading(false);
                    return;
                }

                // 2. Fetch matches using the profile
                const response = await fetch("/api/match", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ profile: currentProfile, limit: 10 }),
                });

                if (!response.ok) throw new Error("Failed to fetch matches");

                const data = await response.json();
                setMatches(data.matches);

                // Save matches
                await saveMatches(id, data.matches);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [router, id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center space-y-4 pt-32">
                    <Loading />
                    <p className="text-muted-foreground animate-pulse">Finding best matches for you...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="space-y-8">
                    {/* Analysis Result */}
                    {profile && <AnalysisViewer profile={profile} />}

                    {/* Job Matches */}
                    <div>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-foreground">
                                Matched Jobs
                            </h2>
                            <p className="text-muted-foreground mt-2">
                                Found {matches.length} jobs matching your skills and experience.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {matches.map((match) => (
                                <JobCard key={match.job.id} match={match} />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center space-y-4 pt-32">
                    <Loading />
                    <p className="text-muted-foreground animate-pulse">Loading...</p>
                </div>
            </div>
        }>
            <ResultsContent />
        </Suspense>
    );
}
