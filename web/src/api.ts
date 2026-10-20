import type { CheckResponse, SearchResponse, SimilarResponse, StatsResponse, WordResponse } from './types';

const BASE = import.meta.env.VITE_API_URL || '';

// Returns null for 404 so callers can treat "not found" as data, not an error
async function get<T>(path: string, signal?: AbortSignal): Promise<T | null> {
  const res = await fetch(BASE + path, { signal });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const enc = encodeURIComponent;

export const api = {
  word: (word: string, signal?: AbortSignal) => get<WordResponse>(`/api/word/${enc(word)}`, signal),
  check: (word: string, signal?: AbortSignal) => get<CheckResponse>(`/api/check/${enc(word)}`, signal),
  similar: (word: string, signal?: AbortSignal) => get<SimilarResponse>(`/api/similar/${enc(word)}?limit=8`, signal),
  search: (q: string, limit: number, signal?: AbortSignal) =>
    get<SearchResponse>(`/api/search?q=${enc(q)}&limit=${limit}`, signal),
  stats: () => get<StatsResponse>('/api/stats'),
};
