
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DropZone } from "@/components/upload/DropZone";
import { FilePreview } from "@/components/upload/FilePreview";
import { UploadProgress } from "@/components/upload/UploadProgress";
import { ArrowRight, Sparkles } from "lucide-react";
import { ResumeProfile } from "@/types/resume";
import { saveProfile } from "@/lib/db";

import { AnalysisViewer } from "@/components/results/AnalysisViewer";

export function Hero() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [uploadStep, setUploadStep] = useState<"uploading" | "analyzing" | "matching" | "complete" | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<ResumeProfile | null>(null);
    const [profileId, setProfileId] = useState<string | null>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setError(null);
        setProfile(null);
        setProfileId(null);
        setUploadStep(null);
    };

    const handleRemoveFile = () => {
        setFile(null);
        setUploadStep(null);
        setError(null);
        setProfile(null);
        setProfileId(null);
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setUploadStep("uploading");
            const formData = new FormData();
            formData.append("file", file);

            // 1. Upload & Analyze
            setUploadStep("analyzing");
            const response = await fetch("/api/analyze", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Analysis failed. Please try again.");
            }

            const data = await response.json();
            const newProfile: ResumeProfile = data.profile;
            setProfile(newProfile);
            console.log("Profile: ", newProfile);

            // 2. Store profile for Results page (using IndexedDB)
            const id = await saveProfile(newProfile);
            setProfileId(id);

            // 3. Complete (Show Review)
            setUploadStep("complete");
            // Auto-redirect removed to allow review
            // router.push(`/results?id=${id}`);

        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
            setUploadStep(null);
        }
    };

    const handleFindMatches = () => {
        if (profileId) {
            router.push(`/results?id=${profileId}`);
        }
    };

    if (uploadStep === "complete" && profile) {
        return (
            <div className="container mx-auto py-12 px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <Sparkles className="h-4 w-4" />
                            <span>Analysis Complete</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Here's what we found
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Review your profile analysis below before we match you with jobs.
                        </p>
                    </div>

                    <AnalysisViewer profile={profile} />

                    <div className="flex justify-center gap-4 pt-4">
                        <button
                            onClick={handleRemoveFile}
                            className="px-6 py-3 rounded-xl border border-zinc-200 text-zinc-600 font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
                        >
                            Upload Different Resume
                        </button>
                        <button
                            onClick={handleFindMatches}
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-blue-500/25 active:scale-[0.98] dark:bg-blue-600 dark:hover:bg-blue-500"
                        >
                            Find Matched Jobs
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-20 min-h-[calc(100vh-64px)]">
            <div className="text-center space-y-6 max-w-2xl mx-auto mb-16">
                <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
                    Find your dream job with <span className="text-blue-600 dark:text-blue-400">AI Precision</span>
                </h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                    Upload your resume and let our Gemini AI analyze your skills to find the perfect matches from thousands of job listings.
                </p>
            </div>

            <div className="w-full max-w-xl space-y-8">
                {!file ? (
                    <DropZone onFileSelect={handleFileSelect} />
                ) : (
                    <div className="space-y-6">
                        <FilePreview file={file} onRemove={handleRemoveFile} />

                        {!uploadStep && (
                            <button
                                onClick={handleUpload}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-blue-500/25 active:scale-[0.98] dark:bg-blue-600 dark:hover:bg-blue-500"
                            >
                                Analyze & Find Jobs
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                )}

                {uploadStep && <UploadProgress step={uploadStep} />}

                {error && (
                    <div className="p-4 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-center text-sm font-medium">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
