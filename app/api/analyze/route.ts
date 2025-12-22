import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/gemini/client";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, PNG, and JPG files are allowed" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // Analyze with Gemini
    const profile = await analyzeResume(base64, file.type);

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("Analysis error:", error);

    // Handle rate limit errors
    if (error?.message === "RATE_LIMIT_EXCEEDED") {
      return NextResponse.json(
        {
          error: "เรียกใช้บริการมากเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง (Rate Limit API Gemini)",
          code: "RATE_LIMIT_EXCEEDED"
        },
        { status: 429 }
      );
    }

    // Handle quota exceeded
    if (error?.message === "QUOTA_EXCEEDED") {
      return NextResponse.json(
        {
          error: "ใช้ API เกินโควต้า กรุณาลองใหม่อีกครั้งในภายหลัง",
          code: "QUOTA_EXCEEDED"
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to analyze resume. Please try again." },
      { status: 500 }
    );
  }
}
