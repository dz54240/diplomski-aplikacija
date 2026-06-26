const KEY = 'studai.auth.token';

export function readToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(KEY);
}

export function writeToken(token: string): void {
  window.localStorage.setItem(KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(KEY);
}
