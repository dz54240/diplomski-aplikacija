import { createFileRoute, Link, notFound } from '@tanstack/react-router';

import { ParsedBlocksPanel } from '@/components/domain';
import { Card, Notice } from '@/components/ui';
import { useDocument } from '@/hooks/useDocument';
import { useDocumentParsedBlocks } from '@/hooks/useDocumentParsedBlocks';
import { ApiError } from '@/lib/api/errors';

export const Route = createFileRoute('/_app/subjects/$subjectId/documents/$docId')({
  component: DocumentDetailRoute,
});

function DocumentDetailRoute() {
  const { subjectId, docId } = Route.useParams();
  const docQ = useDocument(docId);
  const blocksQ = useDocumentParsedBlocks(docId, docQ.data?.status === 'ready');

  if (docQ.isLoading) {
    return <Shell subjectId={subjectId}><div className="text-ink-muted">Učitavam…</div></Shell>;
  }
  if (docQ.error instanceof ApiError && docQ.error.status === 404) throw notFound();
  if (docQ.isError || !docQ.data) {
    return <Shell subjectId={subjectId}><Notice tone="danger">Ne mogu dohvatiti dokument.</Notice></Shell>;
  }

  const doc = docQ.data;

  return (
    <Shell subjectId={subjectId}>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-ink">{doc.title}</h1>
        <div className="text-[12.5px] text-ink-muted">
          {doc.mime_type} · {doc.byte_size ? `${(doc.byte_size / 1024).toFixed(1)} KB` : '—'} · stanje: {doc.status}
        </div>
      </div>

      {doc.status !== 'ready' ? (
        <Card className="p-6">
          {doc.status === 'failed' ? (
            <Notice tone="danger">{doc.error_msg || 'Obrada nije uspjela.'}</Notice>
          ) : (
            <div className="text-ink-muted">
              Dokument se još obrađuje (stanje: {doc.status}). Vrati se kad bude spreman.
            </div>
          )}
        </Card>
      ) : blocksQ.isLoading ? (
        <Card className="p-6 text-ink-muted">Učitavam sadržaj…</Card>
      ) : blocksQ.isError || !blocksQ.data ? (
        <Card className="p-6"><Notice tone="danger">Ne mogu dohvatiti parsirani sadržaj.</Notice></Card>
      ) : (
        <Card className="p-6">
          <ParsedBlocksPanel blocks={blocksQ.data.blocks} />
        </Card>
      )}
    </Shell>
  );
}

function Shell({ subjectId, children }: { subjectId: string; children: React.ReactNode }) {
  return (
    <div className="max-w-[1180px] mx-auto px-8 py-10">
      <Link
        to="/subjects/$subjectId/documents"
        params={{ subjectId }}
        className="text-[12.5px] text-ink-muted hover:text-ink"
      >
        ← Natrag na dokumente
      </Link>
      <div className="mt-3">{children}</div>
    </div>
  );
}
