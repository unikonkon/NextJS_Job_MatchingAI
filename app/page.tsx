
import { Header } from "@/components/common/Header";
import { Hero } from "@/components/home/Hero";
import { JobCard } from "@/components/jobs/JobCard";
import { getJobs } from "@/lib/utils/job-data";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const allJobs = await getJobs();
  const latestJobs = allJobs.slice(0, 20);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Header />

      <main className="container mx-auto px-4">
        <Hero />
      </main>

      {/* Latest Jobs Section */}
      <section className="bg-white py-20 dark:bg-zinc-900/50">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Latest Job Openings
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              Browse the most recent opportunities added to our platform.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xxl:grid-cols-4">
            {latestJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-zinc-700 hover:shadow-zinc-500/25 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              View All Jobs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
