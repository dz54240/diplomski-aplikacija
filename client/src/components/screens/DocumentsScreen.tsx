import { useRef, useState } from 'react';
import { Button, Card, IconButton, Menu, Notice } from '@/components/ui';
import { EmptyState, StatusPill } from '@/components/domain';
import { ProgressBar } from '@/components/ui';
import {
  IAlert,
  IExternal,
  IFile,
  IFileText,
  IInfo,
  IMore,
  IRefresh,
  ITrash,
  IUpload,
} from '@/components/icons';
import type { Subject } from '@/lib/ui-types';
import type { ApiDocument, DocumentStatus } from '@/lib/api/documents';
import { SubjectHeader } from './SubjectHeader';

export interface DocumentsScreenProps {
  subject: Subject;
  documents: ApiDocument[];
  isLoading: boolean;
  uploadError?: string | null;
  duplicateNotice: { title: string; link: string } | null;
  onDismissDuplicate: () => void;
  onUpload: (file: File) => Promise<void>;
  onRetry: (docId: string) => Promise<void>;
  onDelete: (docId: string) => Promise<void>;
  onOpenParsed: (docId: string) => void;
  onEditSubject?: () => void;
  onDeleteSubject?: () => void;
}

const MAX_BYTES = 50 * 1024 * 1024;

type FilterValue = 'all' | DocumentStatus;

export function DocumentsScreen({
  subject,
  documents,
  isLoading,
  uploadError: externalUploadError,
  duplicateNotice,
  onDismissDuplicate,
  onUpload,
  onRetry,
  onDelete,
  onOpenParsed,
  onEditSubject,
  onDeleteSubject,
}: DocumentsScreenProps) {
  const [drag, setDrag] = useState(false);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploadError(null);
    if (file.type !== 'application/pdf') {
      setUploadError('Samo PDF datoteke su podržane.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadError('Datoteka prelazi maksimalnu veličinu od 50 MB.');
      return;
    }
    await onUpload(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so same file can be re-selected after error
    e.target.value = '';
  };

  const filtered = documents.filter((d) => (filter === 'all' ? true : d.status === filter));

  const counts = {
    all: documents.length,
    parsing: documents.filter(
      (d) => d.status === 'parsing' || d.status === 'embedding' || d.status === 'uploaded',
    ).length,
    ready: documents.filter((d) => d.status === 'ready').length,
    failed: documents.filter((d) => d.status === 'failed').length,
  };

  const displayError = uploadError ?? externalUploadError;

  return (
    <div className="max-w-[1100px] mx-auto px-8 py-9">
      <SubjectHeader subject={subject} onEdit={onEditSubject} onDelete={onDeleteSubject} />

      <div className="mt-7">
        <h2 className="text-[15px] font-semibold mb-3">Materijali</h2>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={onFileInputChange}
        />

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`rounded-lg border-2 border-dashed border-line p-8 flex flex-col items-center text-center transition-colors ${
            drag ? 'drop-active' : 'bg-surface-sunken/40'
          }`}
        >
          <div className="h-10 w-10 rounded-md bg-white border border-line flex items-center justify-center text-ink-muted mb-3">
            <IUpload size={18} />
          </div>
          <h3 className="text-[14.5px] font-semibold">Dovuci datoteke ili odaberi</h3>
          <p className="mt-1 text-[13px] text-ink-muted">
            Podržano: PDF. Maksimalno 50 MB po datoteci.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Button
              icon={<IUpload size={14} />}
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              Učitaj
            </Button>
          </div>
        </div>

        {displayError ? (
          <Notice
            tone="danger"
            icon={<IAlert size={16} />}
            title={displayError}
            className="mt-4"
            onDismiss={() => setUploadError(null)}
          />
        ) : null}

        {duplicateNotice ? (
          <Notice
            tone="info"
            icon={<IInfo size={16} />}
            title="Dokument već postoji u tvojim materijalima"
            className="mt-4"
            action={
              <a
                href={duplicateNotice.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12.5px] font-medium text-[var(--accent-700)] hover:underline shrink-0 mt-0.5"
              >
                Otvori postojeći →
              </a>
            }
            onDismiss={onDismissDuplicate}
          >
            <span className="font-medium text-ink">{duplicateNotice.title}</span> — već je obrađen i
            indeksiran.
          </Notice>
        ) : null}
      </div>

      <div className="mt-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            <FilterTab label="Svi" count={counts.all} active={filter === 'all'} onClick={() => setFilter('all')} />
            <FilterTab
              label="U obradi"
              count={counts.parsing}
              active={filter === 'parsing' || filter === 'embedding' || filter === 'uploaded'}
              onClick={() => setFilter('parsing')}
            />
            <FilterTab
              label="Spremno"
              count={counts.ready}
              active={filter === 'ready'}
              onClick={() => setFilter('ready')}
            />
            {counts.failed > 0 ? (
              <FilterTab
                label="Neuspjelo"
                count={counts.failed}
                active={filter === 'failed'}
                onClick={() => setFilter('failed')}
              />
            ) : null}
          </div>
          <span className="text-[12px] text-ink-soft">Stanje se ažurira u stvarnom vremenu</span>
        </div>

        <Card className="mt-3">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="text-left text-[12px] text-ink-soft border-b border-line-soft">
                <th className="font-medium px-4 py-2.5">Naziv</th>
                <th className="font-medium px-4 py-2.5 w-[80px]">Tip</th>
                <th className="font-medium px-4 py-2.5 w-[110px]">Stranica</th>
                <th className="font-medium px-4 py-2.5 w-[170px]">Stanje</th>
                <th className="font-medium px-4 py-2.5 w-[150px]">Učitano</th>
                <th className="px-4 py-2.5 w-[40px]" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <DocumentRow
                  key={d.id}
                  doc={d}
                  onRetry={() => onRetry(d.id)}
                  onRemove={() => onDelete(d.id)}
                  onOpenParsed={() => onOpenParsed(d.id)}
                />
              ))}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<IFileText size={20} />}
              title="Nema materijala"
              body="Dovuci PDF da kreneš."
            />
          ) : null}
        </Card>
      </div>
    </div>
  );
}

function FilterTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 h-8 rounded-md text-[13px] font-medium inline-flex items-center gap-1.5 ${
        active ? 'bg-surface-sunken text-ink' : 'text-ink-muted hover:bg-surface-sunken/60'
      }`}
    >
      {label}
      <span className="text-[11.5px] text-ink-soft">{count}</span>
    </button>
  );
}

const typeBadge = {
  pdf: { label: 'PDF', cls: 'bg-[#FEF3F2] text-[#B42318]' },
} as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('hr-HR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DocumentRow({
  doc,
  onRetry,
  onRemove,
  onOpenParsed,
}: {
  doc: ApiDocument;
  onRetry: () => void;
  onRemove: () => void;
  onOpenParsed: () => void;
}) {
  const t = typeBadge.pdf;
  const isWorking = doc.status === 'parsing' || doc.status === 'embedding' || doc.status === 'uploaded';
  return (
    <>
      <tr className="row-hover border-b border-line-soft last:border-b-0">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="h-7 w-7 rounded-md bg-surface-sunken text-ink-muted flex items-center justify-center shrink-0">
              <IFile size={14} />
            </span>
            <span className="truncate font-medium text-ink">{doc.title}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold tracking-wider ${t.cls}`}
          >
            {t.label}
          </span>
        </td>
        <td className="px-4 py-3 text-ink-muted tabular-nums">{doc.page_count ?? '—'}</td>
        <td className="px-4 py-3">
          <StatusPill status={doc.status} />
        </td>
        <td className="px-4 py-3 text-ink-soft text-[12.5px]">{formatDate(doc.created_at)}</td>
        <td className="px-4 py-3">
          <Menu
            direction="up"
            trigger={<IconButton size="sm" icon={<IMore size={16} />} />}
            items={[
              { label: 'Otvori', icon: <IExternal size={14} />, onClick: onOpenParsed },
              { divider: true },
              { label: 'Ukloni', icon: <ITrash size={14} />, onClick: onRemove, danger: true },
            ]}
          />
        </td>
      </tr>
      {isWorking ? (
        <tr className="border-b border-line-soft">
          <td colSpan={6} className="px-4 pb-3">
            <div className="flex items-center gap-3">
              <ProgressBar indeterminate className="flex-1" />
              <span className="text-[12px] text-[var(--accent-700)] tabular-nums">
                {doc.status === 'uploaded' && 'Pripremam datoteku…'}
                {doc.status === 'parsing' && 'Parsiram tekst i meta-podatke…'}
                {doc.status === 'embedding' && 'Računam vektorske ugradnje…'}
              </span>
            </div>
          </td>
        </tr>
      ) : null}
      {doc.status === 'failed' ? (
        <tr className="border-b border-line-soft">
          <td colSpan={6} className="px-4 pb-3">
            <Notice
              tone="danger"
              icon={<IAlert size={14} />}
              action={
                <Button variant="outline" size="sm" icon={<IRefresh size={13} />} onClick={onRetry}>
                  Pokušaj ponovno
                </Button>
              }
            >
              {doc.error_msg || 'Obrada nije uspjela.'}
            </Notice>
          </td>
        </tr>
      ) : null}
    </>
  );
}
