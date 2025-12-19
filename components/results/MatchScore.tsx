import { cn } from "@/lib/utils";

interface MatchScoreProps {
    score: number;
    size?: "sm" | "md" | "lg";
}

export function MatchScore({ score, size = "md" }: MatchScoreProps) {
    const getColor = (s: number) => {
        if (s >= 80) return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
        if (s >= 60) return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20";
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
    };

    return (
        <div className={cn(
            "flex items-center justify-center font-bold rounded-full",
            getColor(score),
            size === "sm" && "h-8 w-12 text-xs",
            size === "md" && "h-12 w-16 text-lg",
            size === "lg" && "h-20 w-24 text-2xl"
        )}>
            {score}%
        </div>
    );
}
