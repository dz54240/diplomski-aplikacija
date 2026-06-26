import { useQuery } from '@tanstack/react-query';
import { documentsApi, type ParsedBlocksResponse } from '@/lib/api/documents';

export function useDocumentParsedBlocks(id: string, enabled = true) {
  return useQuery<ParsedBlocksResponse>({
    queryKey: ['document-parsed', id],
    queryFn: () => documentsApi.parsedBlocks(id),
    enabled,
    staleTime: Infinity, // parsed output never changes for a given doc
  });
}
