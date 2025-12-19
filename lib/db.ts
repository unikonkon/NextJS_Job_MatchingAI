import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ResumeProfile } from '@/types/resume';
import { MatchResult } from '@/types/match';

interface JobMatchDB extends DBSchema {
  resumes: {
    key: string;
    value: {
      id: string;
      profile: ResumeProfile;
      createdAt: number;
    };
  };
  matches: {
    key: string;
    value: {
      resumeId: string;
      matches: MatchResult[];
      updatedAt: number;
    };
  };
}

const DB_NAME = 'job-match-ai-db';
const DB_VERSION = 2; // Bump version for schema change if needed, though structure is compatible if we just use UUIDs

export async function initDB() {
  return openDB<JobMatchDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('resumes')) {
        db.createObjectStore('resumes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('matches')) {
        db.createObjectStore('matches', { keyPath: 'resumeId' });
      }
    },
  });
}

export async function saveProfile(profile: ResumeProfile): Promise<string> {
  const db = await initDB();
  const id = crypto.randomUUID();
  await db.put('resumes', {
    id,
    profile,
    createdAt: Date.now(),
  });
  return id;
}

export async function getProfile(id: string) {
  const db = await initDB();
  return db.get('resumes', id);
}

export async function saveMatches(resumeId: string, matches: MatchResult[]) {
    const db = await initDB();
    await db.put('matches', {
        resumeId,
        matches,
        updatedAt: Date.now(),
    });
}

export async function getMatches(resumeId: string) {
    const db = await initDB();
    return db.get('matches', resumeId);
}

export async function getAllHistory() {
    const db = await initDB();
    return db.getAll('resumes');
}

export async function deleteHistoryItem(id: string) {
    const db = await initDB();
    const tx = db.transaction(['resumes', 'matches'], 'readwrite');
    await Promise.all([
        tx.objectStore('resumes').delete(id),
        tx.objectStore('matches').delete(id),
        tx.done,
    ]);
}
