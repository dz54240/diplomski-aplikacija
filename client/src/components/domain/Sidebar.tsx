import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import {
  IBookOpen,
  IFileText,
  IMessage,
  ITarget,
} from '@/components/icons';
import { type Subject } from '@/lib/api/subjects';

export type SidebarView = 'overview' | 'documents' | 'chat' | 'quizzes';

export interface SidebarProps {
  subject: Subject | null;
  view: SidebarView;
  onNavigate: (view: SidebarView) => void;
  collapsed?: boolean;
}

const items: { id: SidebarView; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Pregled', icon: <IBookOpen size={16} /> },
  { id: 'documents', label: 'Materijali', icon: <IFileText size={16} /> },
  { id: 'chat', label: 'Razgovori', icon: <IMessage size={16} /> },
  { id: 'quizzes', label: 'Kvizovi', icon: <ITarget size={16} /> },
];

const RAIL_WIDTH = 60;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 244;
const WIDTH_KEY = 'studai.sidebar.width';

function readStoredWidth(): number {
  const stored = Number(localStorage.getItem(WIDTH_KEY));
  return stored >= MIN_WIDTH && stored <= MAX_WIDTH ? stored : DEFAULT_WIDTH;
}

export function Sidebar({ subject, view, onNavigate, collapsed }: SidebarProps) {
  const asideRef = useRef<HTMLElement>(null);
  const [width, setWidth] = useState<number>(readStoredWidth);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const left = asideRef.current?.getBoundingClientRect().left ?? 0;
      setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX - left)));
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [dragging]);

  useEffect(() => {
    localStorage.setItem(WIDTH_KEY, String(width));
  }, [width]);

  if (!subject) return null;
  return (
    <aside
      ref={asideRef}
      style={{ width: collapsed ? RAIL_WIDTH : width }}
      className={cn(
        'relative shrink-0 border-r border-line bg-white overflow-hidden',
        !dragging && 'transition-[width] duration-200',
      )}
    >
      {collapsed ? null : (
        <div className="p-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-ink-soft px-2 mb-2">
            Predmet
          </div>
          <div className="px-2 mb-1">
            <div className="text-[14px] font-semibold text-ink leading-tight truncate">
              {subject.name}
            </div>
          </div>
        </div>
      )}
      <nav className={cn('flex flex-col gap-0.5 pb-3', collapsed ? 'px-2 pt-4' : 'px-2.5')}>
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => onNavigate(it.id)}
            title={collapsed ? it.label : undefined}
            aria-label={it.label}
            className={cn(
              'flex items-center gap-2.5 py-2 rounded-md text-[13.5px] font-medium transition-colors',
              collapsed ? 'justify-center px-0' : 'px-2.5 text-left',
              view === it.id
                ? 'nav-active'
                : 'text-ink-muted hover:bg-surface-sunken hover:text-ink',
            )}
          >
            <span className="text-ink-muted">{it.icon}</span>
            {collapsed ? null : it.label}
          </button>
        ))}
      </nav>

      {collapsed ? null : (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Promijeni širinu bočne trake"
          onMouseDown={() => setDragging(true)}
          className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-[var(--accent-50)]"
        />
      )}
    </aside>
  );
}
