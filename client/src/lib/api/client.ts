import { RAILS_API_URL } from '@/lib/api';
import { ApiError } from './errors';
import { clearToken, readToken } from '@/lib/auth/token';

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = readToken();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${RAILS_API_URL}${path}`, { ...init, headers });

  if (res.status === 401) {
    clearToken();
    if (
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/login') &&
      !window.location.pathname.startsWith('/register')
    ) {
      window.location.assign('/login');
    }
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const errors = body?.errors;
    const list = Array.isArray(errors) ? errors : undefined;
    const fields = errors && !Array.isArray(errors) ? errors : undefined;
    throw new ApiError(res.status, list?.[0] ?? `HTTP ${res.status}`, fields, list);
  }

  return body?.data as T;
}
