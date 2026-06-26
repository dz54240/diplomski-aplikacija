import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './client';
import { NODE_AGENT_URL } from '@/lib/api';
import { readToken } from '@/lib/auth/token';
import type { ChunkMeta } from '@/lib/citations';

export interface ConversationListItem {
  id: string;
  subject_id: string;
  title: string | null;
  updated_at: string;
  created_at: string;
  archived_at: string | null;
}

export interface ConversationMessage {
  id: number;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  parts: unknown;
  created_at: string;
}

export interface ConversationDetail extends ConversationListItem {
  messages: ConversationMessage[];
}

export function useConversations(subjectId: string) {
  return useQuery({
    queryKey: ['conversations', subjectId],
    queryFn: () =>
      apiFetch<ConversationListItem[]>(`/api/subjects/${subjectId}/conversations`),
  });
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: ['conversation', id],
    enabled: !!id,
    queryFn: () => apiFetch<ConversationDetail>(`/api/conversations/${id}`),
  });
}

export interface HistoryChunksResponse {
  messages: Record<string, ChunkMeta[]>;
}

async function fetchHistoryChunks(
  conversationId: string,
): Promise<HistoryChunksResponse> {
  const token = readToken();
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(
    `${NODE_AGENT_URL}/conversations/${conversationId}/chunks`,
    { headers },
  );
  if (!res.ok) {
    throw new Error(`history-chunks fetch failed: ${res.status}`);
  }
  return res.json();
}

export function useHistoryChunks(conversationId: string | null) {
  return useQuery({
    queryKey: ['history-chunks', conversationId],
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000,
    queryFn: () => fetchHistoryChunks(conversationId!),
  });
}
