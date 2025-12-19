import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillMatchProps {
    matched: string[];
    missing: string[];
}

export function SkillMatch({ matched, missing }: SkillMatchProps) {
    return (
        <div className="space-y-3">
            {matched.length > 0 && (
                <div className="space-y-2">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Matched Skills</span>
                    <div className="flex flex-wrap gap-2">
                        {matched.map((skill) => (
                            <span
                                key={skill}
                                className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20"
                            >
                                <Check className="h-3 w-3" />
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {missing.length > 0 && (
                <div className="space-y-2">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Missing Skills</span>
                    <div className="flex flex-wrap gap-2">
                        {missing.map((skill) => (
                            <span
                                key={skill}
                                className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20"
                            >
                                <X className="h-3 w-3" />
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
