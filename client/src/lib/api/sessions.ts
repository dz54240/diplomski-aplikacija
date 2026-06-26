import { apiFetch } from './client';
import type { AuthResponse } from './users';

export interface LoginInput {
  email: string;
  password: string;
}

export function login(input: LoginInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/session', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function logout(): Promise<void> {
  return apiFetch<void>('/api/session', { method: 'DELETE' });
}
