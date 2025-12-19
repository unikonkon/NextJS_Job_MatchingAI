import Link from "next/link";
import { MatchResult } from "@/types/match";
import { MatchScore } from "./MatchScore";
import { SkillMatch } from "./SkillMatch";
import { MapPin, DollarSign, Building2 } from "lucide-react";

interface JobCardProps {
    match: MatchResult;
}

export function JobCard({ match }: JobCardProps) {
    const { job, overallScore, matchedSkills, missingSkills } = match;

    return (
        <Link
            href={`/job/${job.id}`}
            className="group relative flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-blue-500/50 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-blue-500/30"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                        {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {job.company}
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.salary}
                        </div>
                    </div>
                </div>
                <MatchScore score={overallScore} />
            </div>

            <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <SkillMatch matched={matchedSkills.slice(0, 5)} missing={missingSkills.slice(0, 3)} />
                {(matchedSkills.length > 5 || missingSkills.length > 3) && (
                    <p className="mt-2 text-xs text-zinc-400 text-right">
                        +{(matchedSkills.length + missingSkills.length - 8)} more skills
                    </p>
                )}
            </div>

            <div className="absolute top-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                {/* Optional: Add bookmark or action buttons here */}
            </div>
        </Link>
    );
}
