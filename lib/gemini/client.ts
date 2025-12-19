import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResumeProfile } from "@/types/resume";
import { RESUME_ANALYSIS_PROMPT } from "./prompts";

const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!API_KEY) {
  console.warn("Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

export const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

export async function analyzeResume(pdfBase64: string, mimeType: string = "application/pdf"): Promise<ResumeProfile> {
  if (!API_KEY) {
    throw new Error("Gemini API Key is missing");
  }

  try {
    const prompt = RESUME_ANALYSIS_PROMPT;
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: pdfBase64,
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean up the response to ensure it's valid JSON
    const jsonString = text.replace(/```json\n|\n```/g, "").trim();
    const profile = JSON.parse(jsonString) as ResumeProfile;
    
    return profile;
  } catch (error) {
    console.error("Error analyzing resume with Gemini:", error);
    throw new Error("Failed to analyze resume");
  }
}
