import { useState } from 'react';
import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';

import { DocumentsScreen, NewSubjectModal } from '@/components/screens';
import { useDocuments, documentsKey } from '@/hooks/useDocuments';
import { useUploadDocument } from '@/hooks/useUploadDocument';
import { documentsApi } from '@/lib/api/documents';
import { useDestroySubject, useSubject, useUpdateSubject } from '@/lib/api/hooks';

export const Route = createFileRoute('/_app/subjects/$subjectId/documents/')({
  component: DocumentsRoute,
});

function DocumentsRoute() {
  const { subjectId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const subjectQ = useSubject(subjectId);
  const docsQ = useDocuments(subjectId);
  const uploadM = useUploadDocument(subjectId);
  const updateM = useUpdateSubject(subjectId);
  const destroyM = useDestroySubject();

  const [duplicateNotice, setDuplicateNotice] = useState<{ title: string; link: string } | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  if (subjectQ.isLoading || docsQ.isLoading) {
    return <div className="max-w-[1180px] mx-auto px-8 py-10 text-ink-muted">Učitavam…</div>;
  }
  if (subjectQ.isError || !subjectQ.data) throw notFound();

  const s = subjectQ.data;

  return (
    <>
      <DocumentsScreen
        subject={{
          id: s.id,
          name: s.name,
          description: s.description ?? '',
          color: '#2563EB',
          docCount: docsQ.data?.length ?? 0,
          lastActivity: 'nije pokrenuto',
          lastActivityRaw: 0,
        }}
        documents={docsQ.data ?? []}
        isLoading={docsQ.isFetching}
        duplicateNotice={duplicateNotice}
        onDismissDuplicate={() => setDuplicateNotice(null)}
        onUpload={async (file) => {
          const result = await uploadM.mutateAsync({ file });
          if ('duplicate' in result) {
            setDuplicateNotice({
              title: 'Dokument već postoji u tvojim materijalima',
              link: result.link,
            });
          }
        }}
        onRetry={async (docId) => {
          await documentsApi.retry(docId);
          qc.invalidateQueries({ queryKey: documentsKey(subjectId) });
        }}
        onDelete={async (docId) => {
          if (!window.confirm('Obrisati dokument?')) return;
          await documentsApi.destroy(docId);
          qc.invalidateQueries({ queryKey: documentsKey(subjectId) });
        }}
        onOpenParsed={(docId) => {
          void navigate({
            to: '/subjects/$subjectId/documents/$docId',
            params: { subjectId, docId },
          });
        }}
        onEditSubject={() => setEditOpen(true)}
        onDeleteSubject={async () => {
          if (!window.confirm(`Obrisati predmet „${s.name}"?`)) return;
          await destroyM.mutateAsync(s.id);
          navigate({ to: '/subjects' });
        }}
      />
      <NewSubjectModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Uredi predmet"
        submitLabel="Spremi"
        initial={{ name: s.name, description: s.description ?? '' }}
        onCreate={async (input) => {
          await updateM.mutateAsync({ name: input.name, description: input.description });
          setEditOpen(false);
        }}
      />
    </>
  );
}
