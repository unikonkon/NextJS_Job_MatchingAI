import { NextRequest, NextResponse } from "next/server";
import { ResumeProfile } from "@/types/resume";
import { searchJobs } from "@/lib/rag/search";
import { rankResults } from "@/lib/rag/ranking";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, limit = 20 } = body;

    if (!profile) {
      return NextResponse.json(
        { error: "Resume profile is required" },
        { status: 400 }
      );
    }

    // 1. Search candidates using RAG (Vector Search)
    const searchResults = await searchJobs(profile as ResumeProfile, 50); // Search top 50 candidates

    // 2. Rank and format results
    const matches = rankResults(searchResults, profile as ResumeProfile);

    // 3. Apply limit
    const finalMatches = matches.slice(0, limit);

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Matching error:", error);
    return NextResponse.json(
      { error: "Failed to match jobs" },
      { status: 500 }
    );
  }
}
