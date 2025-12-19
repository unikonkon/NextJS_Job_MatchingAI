🎯 System Overview
┌─────────────────────────────────────────────────────────────────────────────┐
│ JOB MATCHING SYSTEM │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ [User] ──► [Upload PDF] ──► [Gemini AI] ──► [RAG Search] ──► [Results] │
│ │
└─────────────────────────────────────────────────────────────────────────────┘

📊 High-Level Architecture
┌────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND (Next.js) │
├────────────────────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ Upload Page │ │ Results Page │ │ Job Detail │ │
│ │ - Drag & Drop │ │ - Match Score │ │ - Full Info │ │
│ │ - PDF Preview │ │ - Job Cards │ │ - Apply Link │ │
│ └────────┬────────┘ └────────▲────────┘ └─────────────────┘ │
│ │ │ │
└───────────┼──────────────────────┼─────────────────────────────────────────┘
│ │
▼ │
┌────────────────────────────────────────────────────────────────────────────┐
│ BACKEND (Next.js API Routes) │
├────────────────────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ /api/upload │ │ /api/analyze │ │ /api/match │ │
│ │ - Receive PDF │───►│ - Send to AI │───►│ - RAG Search │ │
│ │ - Validate │ │ - Extract Info │ │ - Rank Results │ │
│ └─────────────────┘ └────────┬────────┘ └────────┬────────┘ │
│ │ │ │
└──────────────────────────────────┼──────────────────────┼──────────────────┘
│ │
┌──────────────────────┼──────────────────────┘
│ │
▼ ▼
┌───────────────────────┐ ┌────────────────────────────────────────────────┐
│ GEMINI AI API │ │ RAG DATABASE │
├───────────────────────┤ ├────────────────────────────────────────────────┤
│ │ │ │
│ - PDF Text Extraction │ │ ┌─────────────┐ ┌─────────────────────┐ │
│ - Resume Parsing │ │ │ jobs.json │───►│ Vector Embeddings │ │
│ - Skill Extraction │ │ │ (Source) │ │ (ChromaDB/Pinecone) │ │
│ - Experience Analysis │ │ └─────────────┘ └─────────────────────┘ │
│ │ │ │
└───────────────────────┘ └────────────────────────────────────────────────┘

🔄 Detailed Data Flow
Phase 1: PDF Upload & Validation
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 1: UPLOAD & VALIDATE │
└──────────────────────────────────────────────────────────────────┘

    User                    Frontend                   Backend
     │                         │                          │
     │ 1. Select PDF file      │                          │
     │ ───────────────────────►│                          │
     │                         │                          │
     │                         │ 2. Client-side validate  │
     │                         │    - File type (.pdf)    │
     │                         │    - File size (<10MB)   │
     │                         │                          │
     │                         │ 3. POST /api/upload      │
     │                         │ ───────────────────────► │
     │                         │                          │
     │                         │                          │ 4. Server validate
     │                         │                          │    - MIME type
     │                         │                          │    - Malware scan
     │                         │                          │
     │                         │ 5. Return upload_id      │
     │                         │ ◄─────────────────────── │
     │                         │                          │
     │ 6. Show upload success  │                          │
     │ ◄───────────────────────│                          │
     │                         │                          │

Phase 2: AI Analysis with Gemini
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 2: GEMINI AI ANALYSIS │
└──────────────────────────────────────────────────────────────────┘

    Backend                  Gemini API              Extracted Data
       │                         │                         │
       │ 1. Send PDF (base64)    │                         │
       │ ───────────────────────►│                         │
       │                         │                         │
       │                         │ 2. Process PDF          │
       │                         │    - OCR if needed      │
       │                         │    - Text extraction    │
       │                         │                         │
       │                         │ 3. Structured Analysis  │
       │                         │    ┌─────────────────┐  │
       │                         │    │ PROMPT:         │  │
       │                         │    │ - Extract skills│  │
       │                         │    │ - Experience    │  │
       │                         │    │ - Education     │  │
       │                         │    │ - Job titles    │  │
       │                         │    │ - Keywords      │  │
       │                         │    └─────────────────┘  │
       │                         │                         │
       │ 4. Return JSON          │                         │
       │ ◄───────────────────────│                         │
       │                         │                         │
       │ ─────────────────────────────────────────────────►│
       │                         │                         │
       │                    ResumeProfile Object           │
       │                    ┌─────────────────────────┐    │
       │                    │ {                       │    │
       │                    │   name: string          │    │
       │                    │   email: string         │    │
       │                    │   phone: string         │    │
       │                    │   skills: string[]      │    │
       │                    │   experience: [...]     │    │
       │                    │   education: [...]      │    │
       │                    │   keywords: string[]    │    │
       │                    │   summary: string       │    │
       │                    │ }                       │    │
       │                    └─────────────────────────┘    │

Phase 3: RAG Job Matching
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 3: RAG JOB MATCHING │
└──────────────────────────────────────────────────────────────────┘

                        ┌─────────────────────────────────────┐
                        │         RAG PIPELINE                 │
                        └─────────────────────────────────────┘
                                        │
    ┌───────────────────────────────────┼───────────────────────────────────┐
    │                                   │                                    │
    ▼                                   ▼                                    ▼

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ INDEXING │ │ RETRIEVAL │ │ RANKING │
│ (One-time) │ │ (Per Query)│ │ (Per Query)│
└─────────────┘ └─────────────┘ └─────────────┘
│ │ │
▼ ▼ ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ 1. Load jobs.json│ │ 1. Resume → │ │ 1. Semantic │
│ 2. Chunk data │ │ Query Vector │ │ similarity │
│ 3. Generate │ │ 2. Vector search │ │ 2. Keyword │
│ embeddings │ │ 3. Top-K results │ │ overlap │
│ 4. Store in │ │ (e.g., K=50) │ │ 3. Location │
│ vector DB │ │ │ │ preference │
└─────────────────┘ └─────────────────┘ │ 4. Salary range │
│ 5. Final score │
└─────────────────┘

🗂️ Component Structure
src/
├── app/
│ ├── page.tsx # Landing page
│ ├── upload/
│ │ └── page.tsx # Upload resume page
│ ├── results/
│ │ └── page.tsx # Matching results page
│ ├── job/
│ │ └── [id]/
│ │ └── page.tsx # Job detail page
│ └── api/
│ ├── upload/
│ │ └── route.ts # Handle PDF upload
│ ├── analyze/
│ │ └── route.ts # Gemini analysis
│ ├── match/
│ │ └── route.ts # RAG matching
│ └── jobs/
│ └── route.ts # Get job details
│
├── components/
│ ├── upload/
│ │ ├── DropZone.tsx # Drag & drop area
│ │ ├── FilePreview.tsx # PDF preview
│ │ └── UploadProgress.tsx # Progress indicator
│ ├── results/
│ │ ├── JobCard.tsx # Single job card
│ │ ├── MatchScore.tsx # Score visualization
│ │ ├── SkillMatch.tsx # Skills comparison
│ │ └── FilterPanel.tsx # Filter options
│ └── common/
│ ├── Header.tsx
│ ├── Footer.tsx
│ └── Loading.tsx
│
├── lib/
│ ├── gemini/
│ │ ├── client.ts # Gemini API client
│ │ ├── prompts.ts # Prompt templates
│ │ └── types.ts # Response types
│ ├── rag/
│ │ ├── indexer.ts # Job indexing
│ │ ├── embeddings.ts # Vector generation
│ │ ├── search.ts # Similarity search
│ │ └── ranking.ts # Result ranking
│ └── utils/
│ ├── pdf.ts # PDF utilities
│ └── validation.ts # Input validation
│
├── data/
│ └── jobs.json # Job database
│
└── types/
├── job.ts # Job types
├── resume.ts # Resume types
└── match.ts # Match result types

📝 Type Definitions
┌────────────────────────────────────────────────────────────────────────────┐
│ TYPE DEFINITIONS │
└────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐ ┌─────────────────────────┐
│ ResumeProfile │ │ MatchResult │
├─────────────────────────┤ ├─────────────────────────┤
│ name: string │ │ job: JobThaiDetail │
│ email: string │ │ overallScore: number │
│ phone: string │ │ skillMatch: number │
│ skills: string[] │ │ experienceMatch: number │
│ experience: Experience[]│ │ locationMatch: boolean │
│ education: Education[] │ │ salaryMatch: boolean │
│ preferredLocations: [] │ │ matchedSkills: string[] │
│ expectedSalary: Range │ │ missingSkills: string[] │
│ keywords: string[] │ │ reasoning: string │
│ summary: string │ │ │
│ rawText: string │ │ │
└─────────────────────────┘ └─────────────────────────┘

┌─────────────────────────┐ ┌─────────────────────────┐
│ Experience │ │ Education │
├─────────────────────────┤ ├─────────────────────────┤
│ title: string │ │ degree: string │
│ company: string │ │ institution: string │
│ duration: string │ │ year: string │
│ description: string │ │ field: string │
│ skills: string[] │ │ │
└─────────────────────────┘ └─────────────────────────┘

🔧 API Endpoints
┌────────────────────────────────────────────────────────────────────────────┐
│ API ENDPOINTS │
└────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ POST /api/upload │
├─────────────────────────────────────────────────────────────────────────────┤
│ Request: FormData { file: PDF } │
│ Response: { uploadId: string, fileName: string, size: number } │
│ Purpose: Receive and validate PDF file │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ POST /api/analyze │
├─────────────────────────────────────────────────────────────────────────────┤
│ Request: { uploadId: string } or FormData { file: PDF } │
│ Response: { profile: ResumeProfile } │
│ Purpose: Send PDF to Gemini, extract structured resume data │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ POST /api/match │
├─────────────────────────────────────────────────────────────────────────────┤
│ Request: { profile: ResumeProfile, limit?: number, filters?: Filters } │
│ Response: { matches: MatchResult[], totalFound: number } │
│ Purpose: RAG search and rank matching jobs │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ GET /api/jobs/[id] │
├─────────────────────────────────────────────────────────────────────────────┤
│ Request: URL param: id │
│ Response: { job: JobThaiDetail } │
│ Purpose: Get full job details │
└─────────────────────────────────────────────────────────────────────────────┘

🧠 RAG Implementation Strategy
Option A: Simple In-Memory (สำหรับ jobs.json ขนาดเล็ก < 10,000 jobs)
┌─────────────────────────────────────────────────────────────────┐
│ SIMPLE IN-MEMORY RAG │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │    jobs.json     │
                    │   (Load once)    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Pre-compute      │
                    │ embeddings       │
                    │ (Startup)        │
                    └────────┬─────────┘
                             │
                             ▼

┌─────────────────────────────────────────────────────────────────┐
│ IN-MEMORY STORE │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Map<jobId, { job: JobThaiDetail, embedding: number[] }>│ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
│
▼
┌──────────────────┐
│ Cosine Similarity│
│ Search │
└──────────────────┘

Libraries:

- @xenova/transformers (client-side embeddings)
- ml-distance (similarity calculation)

Option B: Vector Database (สำหรับ jobs.json ขนาดใหญ่ > 10,000 jobs)
┌─────────────────────────────────────────────────────────────────┐
│ VECTOR DATABASE RAG │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐
│ jobs.json │────►│ Embedding API │────►│ Vector DB │
│ │ │ (OpenAI/Gemini) │ │ (Pinecone/ │
│ │ │ │ │ ChromaDB) │
└──────────────────┘ └──────────────────┘ └──────┬───────┘
│
┌────────────────────────────────────┘
│
▼
┌──────────────────┐
│ Semantic Search │
│ - ANN search │
│ - Metadata │
│ filtering │
└──────────────────┘

Libraries:

- @pinecone-database/pinecone
- chromadb
- langchain

📊 Matching Score Calculation
┌─────────────────────────────────────────────────────────────────┐
│ MATCHING SCORE FORMULA │
└─────────────────────────────────────────────────────────────────┘

Overall Score = Weighted Average of:

┌─────────────────────────────────────────────────────────────────┐
│ │
│ ┌─────────────────┐ │
│ │ Skill Match │ × 0.40 (40%) │
│ │ ───────────────►│ │
│ │ (matched skills │ ┌────────────────────┐ │
│ │ / total skills)│ │ │ │
│ └─────────────────┘ │ │ │
│ │ OVERALL SCORE │ │
│ ┌─────────────────┐ │ │ │
│ │ Semantic Match │ × 0.30 │ (0-100%) │ │
│ │ ───────────────►│ │ │ │
│ │ (cosine sim) │ └────────────────────┘ │
│ └─────────────────┘ ▲ │
│ │ │
│ ┌─────────────────┐ │ │
│ │ Experience │ × 0.15 ─────────┘ │
│ │ Match │ │
│ └─────────────────┘ │
│ │
│ ┌─────────────────┐ │
│ │ Location Bonus │ × 0.10 │
│ └─────────────────┘ │
│ │
│ ┌─────────────────┐ │
│ │ Salary Fit │ × 0.05 │
│ └─────────────────┘ │
│ │
└─────────────────────────────────────────────────────────────────┘

🛠️ Tech Stack Recommendation
┌─────────────────────────────────────────────────────────────────┐
│ RECOMMENDED TECH STACK │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND │
├─────────────────────────────────────────────────────────────────┤
│ • Next.js 15 (App Router) │
│ • React 19 │
│ • TypeScript │
│ • Tailwind CSS + shadcn/ui │
│ • react-dropzone (file upload) │
│ • react-pdf (PDF preview) │
│ • framer-motion (animations) │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ BACKEND / API │
├─────────────────────────────────────────────────────────────────┤
│ • Next.js API Routes │
│ • @google/generative-ai (Gemini SDK) │
│ • zod (validation) │
│ • multer / formidable (file handling) │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ RAG / AI │
├─────────────────────────────────────────────────────────────────┤
│ Option A (Simple): │
│ • @xenova/transformers (embeddings) │
│ • ml-distance (cosine similarity) │
│ │
│ Option B (Production): │
│ • langchain │
│ • @pinecone-database/pinecone │
│ • OpenAI/Gemini Embeddings API │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ OPTIONAL ENHANCEMENTS │
├─────────────────────────────────────────────────────────────────┤
│ • Redis (caching embeddings) │
│ • PostgreSQL + pgvector (alternative to Pinecone) │
│ • Bull/BullMQ (job queue for processing) │
│ • Socket.io (real-time progress updates) │
└─────────────────────────────────────────────────────────────────┘

🔄 User Flow Summary
┌─────────────────────────────────────────────────────────────────┐
│ USER JOURNEY │
└─────────────────────────────────────────────────────────────────┘

    ┌───────┐     ┌───────────┐     ┌───────────┐     ┌─────────┐
    │ START │────►│  UPLOAD   │────►│ ANALYZING │────►│ RESULTS │
    └───────┘     │  RESUME   │     │    ...    │     │  PAGE   │
                  └───────────┘     └───────────┘     └────┬────┘
                                                           │
                                                           ▼
                                                    ┌─────────────┐
                                                    │ • View Jobs │
                                                    │ • Filter    │
                                                    │ • Sort      │
                                                    │ • Compare   │
                                                    └──────┬──────┘
                                                           │
                                                           ▼
                                                    ┌─────────────┐
                                                    │  JOB DETAIL │
                                                    │  • Match    │
                                                    │    reasons  │
                                                    │  • Apply    │
                                                    │    link     │
                                                    └─────────────┘
