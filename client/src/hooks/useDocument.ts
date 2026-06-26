import { useQuery } from '@tanstack/react-query';
import { documentsApi, type ApiDocument, type DocumentStatus } from '@/lib/api/documents';

const ACTIVE: DocumentStatus[] = ['uploaded', 'parsing', 'embedding'];
const POLL_INTERVAL = 2_000;

export const documentKey = (id: string) => ['document', id] as const;

export function useDocument(id: string | undefined) {
  return useQuery<ApiDocument>({
    queryKey: documentKey(id ?? ''),
    queryFn: () => documentsApi.get(id!),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && ACTIVE.includes(status) ? POLL_INTERVAL : false;
    },
  });
}
