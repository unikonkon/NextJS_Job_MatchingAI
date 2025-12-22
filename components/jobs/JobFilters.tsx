
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, MapPin, Banknote } from "lucide-react";
import { useState, useEffect } from "react";

export function JobFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [query, setQuery] = useState(searchParams.get("query") || "");
    const [location, setLocation] = useState(searchParams.get("location") || "");
    const [minSalary, setMinSalary] = useState(searchParams.get("minSalary") || "");
    const [maxSalary, setMaxSalary] = useState(searchParams.get("maxSalary") || "");
    const [noSalarySpec, setNoSalarySpec] = useState(searchParams.get("noSalarySpec") === "true");

    // Sync state with URL params when they change (e.g. navigation)
    useEffect(() => {
        setQuery(searchParams.get("query") || "");
        setLocation(searchParams.get("location") || "");
        setMinSalary(searchParams.get("minSalary") || "");
        setMaxSalary(searchParams.get("maxSalary") || "");
        setNoSalarySpec(searchParams.get("noSalarySpec") === "true");
    }, [searchParams]);

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (query) params.set("query", query);
        else params.delete("query");

        if (location) params.set("location", location);
        else params.delete("location");

        if (minSalary) params.set("minSalary", minSalary);
        else params.delete("minSalary");

        if (maxSalary) params.set("maxSalary", maxSalary);
        else params.delete("maxSalary");

        if (noSalarySpec) params.set("noSalarySpec", "true");
        else params.delete("noSalarySpec");

        router.push(`${pathname}?${params.toString()}`);
    };

    const clearFilters = () => {
        setQuery("");
        setLocation("");
        setMinSalary("");
        setMaxSalary("");
        setNoSalarySpec(false);
        router.push(pathname);
    };

    const hasFilters = query || location || minSalary || maxSalary || noSalarySpec;

    return (
        <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900 dark:text-white">Filters</h3>
                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                        Clear All
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {/* Keywords */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Keywords
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Job title, company..."
                            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Location
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Bangkok, BTS..."
                            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Salary */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Min. Salary (THB)
                    </label>
                    <div className="relative">
                        <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <input
                            type="number"
                            value={minSalary}
                            onChange={(e) => setMinSalary(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Min (e.g. 20000)"
                            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Max. Salary (THB)
                    </label>
                    <div className="relative">
                        <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <input
                            type="number"
                            value={maxSalary}
                            onChange={(e) => setMaxSalary(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Max (e.g. 50000)"
                            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* No Salary Specified */}
                <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/30">
                    <input
                        type="checkbox"
                        id="noSalarySpec"
                        checked={noSalarySpec}
                        onChange={(e) => setNoSalarySpec(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                    <label
                        htmlFor="noSalarySpec"
                        className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer select-none"
                    >
                        ไม่ระบุเงินเดือน
                    </label>
                </div>

                <button
                    onClick={handleSearch}
                    className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98] dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                    Search Jobs
                </button>
            </div>
        </div>
    );
}
