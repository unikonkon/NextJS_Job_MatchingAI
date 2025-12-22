"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Loading } from "@/components/common/Loading";
import { JobCard } from "@/components/results/JobCard";
import { MatchResult } from "@/types/match";
import { ResumeProfile } from "@/types/resume";
import { getProfile, saveMatches, getMatches, deleteHistoryItem } from "@/lib/db";
import { AnalysisViewer } from "@/components/results/AnalysisViewer";
import { DeleteConfirmModal } from "@/components/common/DeleteConfirmModal";
import { Eye, Trash2, X, User, Mail, Phone, MapPin, DollarSign, GraduationCap, Briefcase } from "lucide-react";

function ResultsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ResumeProfile | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

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

    const handleDelete = async () => {
        if (!id) return;
        
        setDeleting(true);
        try {
            await deleteHistoryItem(id);
            router.push("/");
        } catch (error) {
            console.error("Failed to delete:", error);
            alert("ไม่สามารถลบข้อมูลได้ กรุณาลองอีกครั้ง");
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

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
                {/* Action Buttons */}
                {profile && (
                    <div className="mb-6 flex gap-3 justify-end">
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                            <Eye className="h-4 w-4" />
                            ดูข้อมูลโปรไฟล์
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950/20"
                        >
                            <Trash2 className="h-4 w-4" />
                            ลบข้อมูล
                        </button>
                    </div>
                )}

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

            {/* View Profile Modal */}
            {showModal && profile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
                    <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">ข้อมูลโปรไฟล์</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
                                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    ข้อมูลส่วนตัว
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex items-start gap-3">
                                        <User className="h-5 w-5 text-zinc-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">ชื่อ</p>
                                            <p className="text-zinc-900 dark:text-white">{profile.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-5 w-5 text-zinc-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">อีเมล</p>
                                            <p className="text-zinc-900 dark:text-white">{profile.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="h-5 w-5 text-zinc-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">เบอร์โทรศัพท์</p>
                                            <p className="text-zinc-900 dark:text-white">{profile.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <DollarSign className="h-5 w-5 text-zinc-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">เงินเดือนที่คาดหวัง</p>
                                            <p className="text-zinc-900 dark:text-white">{profile.expectedSalary}</p>
                                        </div>
                                    </div>
                                    {profile.preferredLocations && profile.preferredLocations.length > 0 && (
                                        <div className="flex items-start gap-3 md:col-span-2">
                                            <MapPin className="h-5 w-5 text-zinc-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">สถานที่ที่ต้องการทำงาน</p>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {profile.preferredLocations.map((loc, i) => (
                                                        <span key={i} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                            {loc}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Summary */}
                            {profile.summary && (
                                <div>
                                    <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">สรุป</h3>
                                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">{profile.summary}</p>
                                </div>
                            )}

                            {/* Skills */}
                            <div>
                                <h3 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">ทักษะ</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill, i) => (
                                        <span key={i} className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Experience */}
                            {profile.experience && profile.experience.length > 0 && (
                                <div>
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
                                        <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        ประสบการณ์การทำงาน
                                    </h3>
                                    <div className="space-y-4">
                                        {profile.experience.map((exp, i) => (
                                            <div key={i} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                                                <div className="mb-2">
                                                    <h4 className="font-semibold text-zinc-900 dark:text-white">{exp.title}</h4>
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{exp.company}</p>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-500">{exp.duration}</p>
                                                </div>
                                                {exp.description && (
                                                    <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{exp.description}</p>
                                                )}
                                                {exp.skills && exp.skills.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {exp.skills.map((skill, j) => (
                                                            <span key={j} className="inline-flex items-center rounded bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Education */}
                            {profile.education && profile.education.length > 0 && (
                                <div>
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
                                        <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        การศึกษา
                                    </h3>
                                    <div className="space-y-3">
                                        {profile.education.map((edu, i) => (
                                            <div key={i} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                                                <h4 className="font-semibold text-zinc-900 dark:text-white">{edu.degree}</h4>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400">{edu.institution}</p>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400">{edu.field}</p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-500">{edu.year}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Keywords */}
                            {profile.keywords && profile.keywords.length > 0 && (
                                <div>
                                    <h3 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">คำสำคัญ</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.keywords.map((keyword, i) => (
                                            <span key={i} className="inline-flex items-center rounded-md bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                isDeleting={deleting}
            />
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
