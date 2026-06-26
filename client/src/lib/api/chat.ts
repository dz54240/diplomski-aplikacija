import { NODE_AGENT_URL } from '@/lib/api';
import { readToken } from '@/lib/auth/token';

export const CHAT_URL = `${NODE_AGENT_URL}/chat`;

export function chatFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const token = readToken();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
