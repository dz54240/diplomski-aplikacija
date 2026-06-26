import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  documentsApi,
  type ApiDocument,
  type DuplicateResponse,
} from '@/lib/api/documents';
import { documentsKey } from './useDocuments';

export function useUploadDocument(subjectId: string) {
  const qc = useQueryClient();
  return useMutation<ApiDocument | DuplicateResponse, Error, { file: File; title?: string }>({
    mutationFn: ({ file, title }) => documentsApi.create(subjectId, file, title),
    onSuccess: (result) => {
      if (!('duplicate' in result)) {
        qc.invalidateQueries({ queryKey: documentsKey(subjectId) });
      }
    },
  });
}
