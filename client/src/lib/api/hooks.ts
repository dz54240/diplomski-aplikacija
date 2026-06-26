import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSubject,
  destroySubject,
  getSubject,
  listSubjects,
  updateSubject,
  type Subject,
  type SubjectInput,
} from './subjects';

const KEY = ['subjects'] as const;

export function useSubjects() {
  return useQuery({ queryKey: KEY, queryFn: listSubjects });
}

export function useSubject(id: string) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => getSubject(id),
    enabled: !!id,
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubjectInput) => createSubject(input),
    onSuccess: (created) => {
      qc.setQueryData<Subject[]>(KEY, (prev) => (prev ? [created, ...prev] : [created]));
    },
  });
}

export function useUpdateSubject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubjectInput) => updateSubject(id, input),
    onSuccess: (updated) => {
      qc.setQueryData<Subject>([...KEY, id], updated);
      qc.setQueryData<Subject[]>(KEY, (prev) =>
        prev?.map((s) => (s.id === id ? updated : s)),
      );
    },
  });
}

export function useDestroySubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => destroySubject(id),
    onSuccess: (_void, id) => {
      qc.setQueryData<Subject[]>(KEY, (prev) => prev?.filter((s) => s.id !== id));
    },
  });
}
