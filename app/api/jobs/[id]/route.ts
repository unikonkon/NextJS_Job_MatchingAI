import { NextRequest, NextResponse } from "next/server";
import jobsData from "@/data/JobThai/jobs.json";
import { JobThai } from "@/data/JobThai/type";

const jobsDB = jobsData as unknown as JobThai;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const job = jobsDB.jobs.find((j) => j.id === id);

  if (!job) {
    return NextResponse.json(
      { error: "Job not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ job });
}
