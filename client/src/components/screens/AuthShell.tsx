import { type ReactNode } from 'react';
import { BrandMark } from '@/components/domain';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex flex-col bg-white">
      <header className="px-8 pt-7">
        <BrandMark />
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-[400px] fade-up">{children}</div>
      </main>
      <footer className="px-8 py-5 text-[12px] text-ink-soft flex items-center justify-between">
        <span>© 2026 StudAI</span>
        <span className="flex items-center gap-4">
          <a className="hover:text-ink" href="#">
            Pravila privatnosti
          </a>
          <a className="hover:text-ink" href="#">
            Uvjeti korištenja
          </a>
        </span>
      </footer>
    </div>
  );
}
