import type { FoundationQuestion } from "./api-types";

const cacheKey = (sessionId: number) => `df_foundation_questions_${sessionId}`;

export function cacheFoundationQuestions(
  sessionId: number,
  questions: FoundationQuestion[]
) {
  try {
    localStorage.setItem(cacheKey(sessionId), JSON.stringify(questions));
  } catch {
    // ignore storage failures
  }
}

export function getCachedFoundationQuestions(
  sessionId: number
): FoundationQuestion[] | null {
  try {
    const raw = localStorage.getItem(cacheKey(sessionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FoundationQuestion[]) : null;
  } catch {
    return null;
  }
}

export function clearCachedFoundationQuestions(sessionId: number) {
  try {
    localStorage.removeItem(cacheKey(sessionId));
  } catch {
    // ignore
  }
}
