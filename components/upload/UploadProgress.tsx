"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadProgressProps {
    step: "uploading" | "analyzing" | "matching" | "complete";
}

const steps = [
    { id: "uploading", label: "Uploading PDF..." },
    { id: "analyzing", label: "Analyzing Resume..." },
    { id: "matching", label: "Matching Jobs..." },
];

export function UploadProgress({ step }: UploadProgressProps) {
    const currentStepIndex = steps.findIndex((s) => s.id === step);

    if (step === "complete") return null;

    return (
        <div className="w-full max-w-sm mx-auto space-y-4 pt-8">
            {steps.map((s, index) => {
                const isActive = s.id === step;
                const isCompleted = currentStepIndex > index;

                return (
                    <motion.div
                        key={s.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                            isActive
                                ? "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20"
                                : isCompleted
                                    ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
                                    : "border-transparent opacity-50"
                        )}
                    >
                        {isActive ? (
                            <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                        ) : isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-zinc-200 dark:border-zinc-700" />
                        )}
                        <span className={cn(
                            "text-sm font-medium",
                            isActive ? "text-blue-700 dark:text-blue-300" :
                                isCompleted ? "text-green-700 dark:text-green-300" : "text-zinc-500"
                        )}>
                            {s.label}
                        </span>
                    </motion.div>
                );
            })}
        </div>
    );
}
