import { useQuery } from '@tanstack/react-query';
import { documentsApi, type ApiDocument } from '@/lib/api/documents';

export const documentsKey = (subjectId: string) => ['documents', subjectId] as const;

export function useDocuments(subjectId: string) {
  return useQuery<ApiDocument[]>({
    queryKey: documentsKey(subjectId),
    queryFn: () => documentsApi.list(subjectId),
    staleTime: 5_000,
  });
}
