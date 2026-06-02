import axios from 'axios';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const SSE_URL = `${API_BASE}/events`;

/** Shared axios instance — use for all backend API calls */
export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30_000,
});

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}
