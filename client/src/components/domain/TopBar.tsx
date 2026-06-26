import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { BrandMark } from './BrandMark';
import { Avatar } from './Avatar';
import { Menu } from '@/components/ui';
import {
  ICheck,
  IChevronDown,
  IChevronRight,
  IFolder,
  ILogout,
  ISearch,
  ISettings,
  ISidebar,
  IUser,
} from '@/components/icons';
import { type Subject } from '@/lib/api/subjects';
import { type MockUser } from '@/lib/auth';

export interface TopBarProps {
  subjects: Subject[];
  currentSubject: Subject | null;
  user: MockUser;
  onSwitchSubject: (id: string) => void;
  onGoSubjects: () => void;
  onProfile: () => void;
  onLogout: () => void;
  onToggleSidebar?: () => void;
}

export function TopBar({
  subjects,
  currentSubject,
  user,
  onSwitchSubject,
  onGoSubjects,
  onProfile,
  onLogout,
  onToggleSidebar,
}: TopBarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="h-14 border-b border-line bg-white flex items-center px-4 gap-3 shrink-0 z-20">
      {onToggleSidebar ? (
        <button
          onClick={onToggleSidebar}
          aria-label="Prikaži/sakrij bočnu traku"
          className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-surface-sunken text-ink-muted"
        >
          <ISidebar size={18} />
        </button>
      ) : null}
      <button
        onClick={onGoSubjects}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <BrandMark />
      </button>

      <div className="hidden md:flex items-center text-ink-soft mx-1">
        <IChevronRight size={14} />
      </div>

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:bg-surface-sunken text-[14px] font-medium"
        >
          {currentSubject ? currentSubject.name : 'Predmeti'}
          <IChevronDown size={14} className="text-ink-muted" />
        </button>
        {open ? (
          <div className="absolute left-0 top-full mt-1.5 min-w-[280px] rounded-lg border border-line bg-white shadow-pop z-30 py-1 fade-up">
            <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-soft">
              Prebaci predmet
            </div>
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setOpen(false);
                  onSwitchSubject(s.id);
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13.5px] transition-colors hover:bg-surface-sunken',
                  currentSubject?.id === s.id ? 'text-ink' : 'text-ink-muted',
                )}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
                <span className="flex-1 truncate">{s.name}</span>
                {currentSubject?.id === s.id ? (
                  <ICheck size={14} className="text-[var(--accent-700)]" />
                ) : null}
              </button>
            ))}
            <div className="my-1 border-t border-line-soft" />
            <button
              onClick={() => {
                setOpen(false);
                onGoSubjects();
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13.5px] text-ink hover:bg-surface-sunken"
            >
              <IFolder size={14} className="text-ink-muted" />
              Svi predmeti
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex-1" />

      <div className="hidden md:flex items-center gap-1 mr-1">
        <button className="inline-flex items-center gap-2 rounded-md px-2.5 h-8 text-[13px] text-ink-muted hover:bg-surface-sunken">
          <ISearch size={15} />
          <span>Pretraži…</span>
          <span className="ml-2 rounded border border-line px-1.5 text-[10.5px] font-mono text-ink-soft">
            ⌘K
          </span>
        </button>
      </div>

      <Menu
        trigger={
          <button className="flex items-center gap-2 rounded-full p-0.5 hover:bg-surface-sunken">
            <Avatar name={user.name} size={28} />
          </button>
        }
        items={[
          { label: user.name, icon: <IUser size={14} />, onClick: onProfile },
          { label: 'Postavke profila', icon: <ISettings size={14} />, onClick: onProfile },
          { divider: true },
          { label: 'Odjavi se', icon: <ILogout size={14} />, onClick: onLogout, danger: true },
        ]}
      />
    </header>
  );
}
