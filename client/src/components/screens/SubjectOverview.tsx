import { type ReactNode } from 'react';
import { Card, Pill } from '@/components/ui';
import {
  IArrowRight,
  IChevronRight,
  IMessage,
  ITarget,
  IUpload,
} from '@/components/icons';
import { type Subject } from '@/lib/ui-types';
import { type ConversationListItem } from '@/lib/api/conversations';
import { type QuizListItem } from '@/lib/api/quizzes';
import { SubjectHeader } from './SubjectHeader';

export type OverviewAction = 'chat' | 'new-quiz' | 'documents' | 'quizzes' | 'quiz-results';

export interface SubjectOverviewProps {
  subject: Subject;
  conversations?: ConversationListItem[];
  quizzes?: QuizListItem[];
  conversationsLoading?: boolean;
  quizzesLoading?: boolean;
  onAction: (action: OverviewAction, id?: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('hr-HR');
}

export function SubjectOverview({
  subject,
  conversations = [],
  quizzes = [],
  conversationsLoading = false,
  quizzesLoading = false,
  onAction,
  onEdit,
  onDelete,
}: SubjectOverviewProps) {
  return (
    <div className="max-w-[1100px] mx-auto px-8 py-9">
      <SubjectHeader subject={subject} onEdit={onEdit} onDelete={onDelete} />

      <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-3">
        <QuickAction
          icon={<IMessage size={18} />}
          title="Postavi pitanje"
          body="Razgovaraj s materijalima — odgovori s citatima."
          onClick={() => onAction('chat')}
        />
        <QuickAction
          icon={<ITarget size={18} />}
          title="Generiraj kviz"
          body="Auto-generirana pitanja s Bloomovim razinama."
          onClick={() => onAction('new-quiz')}
        />
        <QuickAction
          icon={<IUpload size={18} />}
          title="Učitaj materijale"
          body="PDF dokumenti. Ostaju samo tvoji."
          onClick={() => onAction('documents')}
        />
      </div>

      <div className="mt-9 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-semibold">Nedavni razgovori</h3>
            <button
              onClick={() => onAction('chat')}
              className="text-[12.5px] text-[var(--accent-700)] hover:underline inline-flex items-center gap-1"
            >
              Svi <IChevronRight size={12} />
            </button>
          </div>
          {conversationsLoading ? (
            <p className="text-[13px] text-ink-muted py-2">Učitavam…</p>
          ) : conversations.length ? (
            <ul className="divide-y divide-line-soft -mx-2">
              {conversations.slice(0, 3).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onAction('chat', c.id)}
                    className="w-full px-2 py-2.5 text-left rounded-md hover:bg-surface-sunken transition-colors flex items-center gap-3"
                  >
                    <span className="h-7 w-7 rounded-md bg-surface-sunken text-ink-muted flex items-center justify-center shrink-0">
                      <IMessage size={14} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13.5px] text-ink truncate">
                        {c.title?.trim() || 'Razgovor'}
                      </span>
                      <span className="block text-[12px] text-ink-soft">{formatDate(c.updated_at)}</span>
                    </span>
                    <IChevronRight size={14} className="text-ink-soft" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-ink-muted py-2">Još nema razgovora.</p>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-semibold">Posljednji kvizovi</h3>
            <button
              onClick={() => onAction('quizzes')}
              className="text-[12.5px] text-[var(--accent-700)] hover:underline inline-flex items-center gap-1"
            >
              Svi <IChevronRight size={12} />
            </button>
          </div>
          {quizzesLoading ? (
            <p className="text-[13px] text-ink-muted py-2">Učitavam…</p>
          ) : quizzes.length ? (
            <ul className="divide-y divide-line-soft -mx-2">
              {quizzes.slice(0, 3).map((q) => (
                <li key={q.id}>
                  <button
                    onClick={() => onAction('quiz-results', q.id)}
                    className="w-full px-2 py-2.5 text-left rounded-md hover:bg-surface-sunken transition-colors flex items-center gap-3"
                  >
                    <span className="h-7 w-7 rounded-md bg-surface-sunken text-ink-muted flex items-center justify-center shrink-0">
                      <ITarget size={14} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13.5px] text-ink truncate">{q.title}</span>
                      <span className="block text-[12px] text-ink-soft">
                        {formatDate(q.created_at)} · {q.question_count} pitanja
                      </span>
                    </span>
                    <Pill tone={q.completed_at ? 'success' : 'outline'}>
                      {q.completed_at ? 'Završen' : 'U tijeku'}
                    </Pill>
                    <IChevronRight size={14} className="text-ink-soft" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-ink-muted py-2">Još nema kvizova.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  body,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-lg border border-line bg-white p-5 text-left hover:border-[var(--accent)] hover:bg-[var(--accent-50)]/40 transition-colors fade-up"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-md bg-[var(--accent-50)] text-[var(--accent-700)] flex items-center justify-center group-hover:bg-white">
          {icon}
        </div>
        <h3 className="text-[15px] font-semibold">{title}</h3>
        <span className="ml-auto text-ink-soft group-hover:text-[var(--accent-700)] transition-colors">
          <IArrowRight size={16} />
        </span>
      </div>
      <p className="mt-3 text-[13px] text-ink-muted leading-snug">{body}</p>
    </button>
  );
}
