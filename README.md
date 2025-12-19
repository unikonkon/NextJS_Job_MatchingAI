# Job Matching AI

Job Matching AI is an intelligent application connecting job seekers with their ideal roles using advanced AI analysis and RAG (Retrieval-Augmented Generation) technology.

## 📊 System Overview

The system is built on **Next.js 16**, utilizing **Google Gemini Pro 1.5** for resume analysis and a **RAG-based matching engine** to find the most relevant job opportunities. It features a modern, responsive UI with dark mode support and local data persistence.

### High-Level Architecture

```mermaid
graph TD
    User[User] -->|Uploads Resume| Frontend[Next.js Frontend]
    Frontend -->|POST PDF/Image| API_Analyze[/api/analyze]
    API_Analyze -->|Gemini 1.5 Pro| AI[Google Gemini AI]
    AI -->|Structured Profile| API_Analyze
    API_Analyze -->|JSON Profile| Frontend
    Frontend -->|Save Profile| DB[(IndexedDB)]

    Frontend -->|POST Profile| API_Match[/api/match]
    API_Match -->|Vector Search| RAG[RAG Engine]
    RAG -->|Ranked Jobs| API_Match
    API_Match -->|Matches| Frontend
    Frontend -->|Display Results| User
```

## 🔄 Detailed Data Flow

### Phase 1: File Upload & Validation

1.  **User Interface**: Users upload their resume via the `DropZone` component on the Home page.
2.  **Client-Side Validation**: The browser checks file type (PDF, PNG, JPG) and size (<10MB).
3.  **Server-Side Processing**: The file is sent to `/api/analyze` as FormData. The server re-validates the MIME type to ensure security.

### Phase 2: AI Analysis with Gemini

1.  **Preprocessing**: The uploaded file (PDF or Image) is converted to a Base64 string.
2.  **AI Request**: The Base64 data is sent to **Google Gemini 1.5 Flash** (via `lib/gemini/client.ts`) with a specialized prompt to extract:
    - Contact Info (Name, Email, Phone)
    - Professional Summary
    - Key Skills
    - Work Experience
    - Education
3.  **Response Parsing**: The raw AI text response is parsed into a structured JSON `ResumeProfile` object.

### Phase 3: RAG Job Matching

1.  **Orchestration**: Upon successful analysis, the Frontend saves the profile to **IndexedDB** (`lib/db.ts`) and requests job matches via `/api/match`.
2.  **Vector Search**: The backend (`lib/rag/search.ts`) uses the profile's embedding or keywords to query the vector database (e.g., Pinecone) for the top 50 relevant job candidates.
3.  **Intelligent Ranking**: The results are post-processed (`lib/rag/ranking.ts`) to score and sort jobs based on skill overlap and experience relevance, returning the top matches to the user.
