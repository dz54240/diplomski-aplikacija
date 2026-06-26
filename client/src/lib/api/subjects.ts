import { apiFetch } from './client';

export interface Subject {
  id: string;
  name: string;
  description: string | null;
  language: 'hr' | 'en' | 'mixed';
  documents_count: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface SubjectInput {
  name: string;
  description?: string;
  language?: 'hr' | 'en' | 'mixed';
}

export function listSubjects(): Promise<Subject[]> {
  return apiFetch<Subject[]>('/api/subjects');
}

export function getSubject(id: string): Promise<Subject> {
  return apiFetch<Subject>(`/api/subjects/${id}`);
}

export function createSubject(input: SubjectInput): Promise<Subject> {
  return apiFetch<Subject>('/api/subjects', {
    method: 'POST',
    body: JSON.stringify({ subject: input }),
  });
}

export function updateSubject(id: string, input: SubjectInput): Promise<Subject> {
  return apiFetch<Subject>(`/api/subjects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ subject: input }),
  });
}

export function destroySubject(id: string): Promise<void> {
  return apiFetch<void>(`/api/subjects/${id}`, { method: 'DELETE' });
}
