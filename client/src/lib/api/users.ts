import { apiFetch } from './client';

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export function registerUser(input: RegisterInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/users', {
    method: 'POST',
    body: JSON.stringify({ user: input }),
  });
}
