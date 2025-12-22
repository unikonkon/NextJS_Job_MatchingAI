
import { ResumeProfile } from "@/types/resume";
import { BadgeCheck, Brain, Briefcase, Key } from "lucide-react";

interface AnalysisViewerProps {
    profile: ResumeProfile;
}

export function AnalysisViewer({ profile }: AnalysisViewerProps) {
    console.log("AnalysisViewer profile", profile);
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
                <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                ผลวิเคราะห์โดย AI
            </h2>

            <div className="space-y-6">
                <div>
                    <h3 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        เงินเดือนที่เหมาะสมกับคุณจากข้อมูลที่มี
                    </h3>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {profile.expectedSalary}
                    </p>
                </div>

                <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        <Key className="h-4 w-4" />
                        คำสำคัญที่วิเคราะห์ได้ไปแมตช์กับตำแหน่งงาน
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {profile.keywords && profile.keywords.length > 0 ? (
                            profile.keywords.map((keyword, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                                >
                                    {keyword}
                                </span>
                            ))
                        ) : (
                            <span className="text-zinc-400 dark:text-zinc-600 text-sm">ไม่มีคำสำคัญที่ถูกดึงออกมา</span>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            <BadgeCheck className="h-4 w-4" />
                            ทักษะหลัก
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            <Briefcase className="h-4 w-4" />
                            ไฮไลท์ประสบการณ์
                        </h3>
                        <div className="space-y-2">
                            {profile.experience.map((exp, i) => (
                                <div key={i} className="text-sm text-zinc-700 dark:text-zinc-300">
                                    • {exp.title} ที่ {exp.company}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
