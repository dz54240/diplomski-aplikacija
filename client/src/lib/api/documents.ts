import { RAILS_API_URL } from '@/lib/api';
import { apiFetch } from './client';
import { readToken } from '@/lib/auth/token';
import { ApiError } from './errors';

export type DocumentStatus = 'uploaded' | 'parsing' | 'embedding' | 'ready' | 'failed';

export interface ApiDocument {
  id: string;
  title: string;
  status: DocumentStatus;
  mime_type: string;
  page_count: number | null;
  subject_id: string;
  sha256_hex: string | null;
  byte_size: number | null;
  error_msg: string | null;
  ready_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DuplicateResponse {
  duplicate: true;
  existing_document_id: string;
  message: string;
  link: string;
}

export interface ParsedBlock {
  type: 'text' | 'figure' | 'table' | 'formula';
  page: number;
  section_path?: string[];
  md?: string;
  md_table?: string;
  latex?: string;
  image_id?: string;
  image_url?: string;
  surrounding_text?: string;
}

export interface ParsedBlocksResponse {
  blocks: ParsedBlock[];
  pages: number;
  parser: string;
  parser_version: string;
  language_detected?: string;
}

export const documentsApi = {
  list(subjectId: string) {
    return apiFetch<ApiDocument[]>(`/api/subjects/${subjectId}/documents`);
  },

  get(id: string) {
    return apiFetch<ApiDocument>(`/api/documents/${id}`);
  },

  async create(
    subjectId: string,
    file: File,
    title?: string,
  ): Promise<ApiDocument | DuplicateResponse> {
    const form = new FormData();
    form.append('data[file]', file);
    if (title) form.append('data[title]', title);

    const token = readToken();
    const res = await fetch(`${RAILS_API_URL}/api/subjects/${subjectId}/documents`, {
      method: 'POST',
      body: form,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (res.status === 201) {
      const body = await res.json();
      return body.data as ApiDocument;
    }
    if (res.status === 200) {
      return (await res.json()) as DuplicateResponse;
    }

    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body?.errors?.[0] ?? `HTTP ${res.status}`,
      undefined,
      body?.errors,
    );
  },

  destroy(id: string) {
    return apiFetch<void>(`/api/documents/${id}`, { method: 'DELETE' });
  },

  retry(id: string) {
    return apiFetch<ApiDocument>(`/api/documents/${id}/retry`, { method: 'POST' });
  },

  parsedBlocks(id: string) {
    return apiFetch<ParsedBlocksResponse>(`/api/documents/${id}/parsed_blocks`);
  },
};
