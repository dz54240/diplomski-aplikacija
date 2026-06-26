import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { EmptyState } from '@/components/domain';
import { IBookOpen, IFolder, IPlus, ISearch } from '@/components/icons';
import { type Subject } from '@/lib/ui-types';

export interface SubjectsDashboardProps {
  subjects: Subject[];
  onOpen: (id: string) => void;
  onNew: () => void;
}

export function SubjectsDashboard({ subjects, onOpen, onNew }: SubjectsDashboardProps) {
  const [query, setQuery] = useState('');
  const visible = subjects.filter(
    (s) => !query || s.name.toLowerCase().includes(query.toLowerCase()),
  );

  const isEmpty = subjects.length === 0;

  return (
    <div className="max-w-[1180px] mx-auto px-8 py-10">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Predmeti</h1>
          <p className="mt-1 text-[14px] text-ink-muted">
            Tvoji kolegiji i njima pripadajući materijali, razgovori i kvizovi.
          </p>
        </div>
        {!isEmpty ? (
          <Button icon={<IPlus size={16} />} onClick={onNew}>
            Novi predmet
          </Button>
        ) : null}
      </div>

      {isEmpty ? (
        <Card className="mt-10">
          <EmptyState
            icon={<IFolder size={20} />}
            title="Još nemaš predmeta"
            body="Predmet predstavlja jedan kolegij. Učitavaš mu vlastite materijale, postavljaš pitanja i generiraš kvizove."
            action={
              <Button icon={<IPlus size={16} />} onClick={onNew}>
                Stvori prvi predmet
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[260px] max-w-[420px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft">
                <ISearch size={15} />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pretraži predmete…"
                className="w-full h-9 rounded-md border border-line bg-white pl-9 pr-3 text-[14px] outline-none placeholder:text-ink-soft hover:border-ink-soft focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-50)]"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((s) => (
              <SubjectCard key={s.id} subject={s} onClick={() => onOpen(s.id)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SubjectCard({ subject, onClick }: { subject: Subject; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group text-left rounded-lg border border-line bg-white p-5 hover:border-ink-soft transition-colors fade-up"
    >
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 shrink-0 rounded-md bg-[var(--accent-50)] text-[var(--accent-700)] flex items-center justify-center">
          <IBookOpen size={17} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold leading-tight">{subject.name}</h3>
          <p className="mt-1 text-[13px] text-ink-muted leading-snug line-clamp-2">{subject.description}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-[12.5px]">
        <span className="text-ink-soft">
          {subject.docCount === 0
            ? 'Bez materijala'
            : `${subject.docCount} ${subject.docCount === 1 ? 'dokument' : 'dokumenata'}`}
        </span>
        <span className="text-ink-soft">{subject.lastActivity}</span>
      </div>
    </button>
  );
}
