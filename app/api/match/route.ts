import { NextRequest, NextResponse } from "next/server";
import { ResumeProfile } from "@/types/resume";
import { searchJobs } from "@/lib/rag/search";
import { rankResults } from "@/lib/rag/ranking";

// export const runtime = 'nodejs';
// export const dynamic = 'force-dynamic';

// // เพิ่ม OPTIONS handler สำหรับ CORS preflight
// export async function OPTIONS() {
//   return new NextResponse(null, {
//     status: 200,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'POST, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type',
//     },
//   });
// }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    // return NextResponse.json(
    //   { matches },
    //   {
    //     headers: {
    //       'Access-Control-Allow-Origin': '*',
    //     },
    //   }
    // );
    return NextResponse.json({ matches });

  
  } catch (error) {
    console.error("Matching error:", error);
    return NextResponse.json(
      { error: "Failed to match jobs" },
      { status: 500 }
    );
  }
}
