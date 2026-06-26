import { Button, Card, Notice, Pill } from '@/components/ui';
import { EmptyState } from '@/components/domain';
import { IChevronRight, IPlus, ITarget } from '@/components/icons';
import { type Subject } from '@/lib/ui-types';
import { type QuizListItem } from '@/lib/api/quizzes';
import { bloomLabel } from '@/lib/bloom';
import { SubjectHeader } from './SubjectHeader';

export interface QuizzesListProps {
  subject: Subject;
  quizzes: QuizListItem[];
  isLoading?: boolean;
  onResults: (quizId: string) => void;
  onNew: () => void;
}

export function QuizzesList({ subject, quizzes, isLoading, onResults, onNew }: QuizzesListProps) {
  return (
    <div className="max-w-[1100px] mx-auto px-8 py-9">
      <SubjectHeader subject={subject} />
      <div className="mt-7 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[18px] font-semibold tracking-tight">Kvizovi</h2>
          <p className="mt-1 text-[13.5px] text-ink-muted">
            Auto-generirani kvizovi temeljeni na materijalima ovog predmeta.
          </p>
        </div>
        {quizzes.length > 0 ? (
          <Button icon={<IPlus size={15} />} onClick={onNew}>
            Generiraj kviz
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <Card className="mt-6 px-5 py-4">
          <Notice tone="info">Učitavam kvizove…</Notice>
        </Card>
      ) : quizzes.length === 0 ? (
        <Card className="mt-6">
          <EmptyState
            icon={<ITarget size={20} />}
            title="Još nema kvizova"
            body="Generiraj prvi kviz da provjeriš koliko si dobro savladao gradivo."
            action={
              <Button icon={<IPlus size={15} />} onClick={onNew}>
                Generiraj kviz
              </Button>
            }
          />
        </Card>
      ) : (
        <Card className="mt-6 overflow-hidden">
          <ul>
            {quizzes.map((q, i) => (
              <li key={q.id} className={i === 0 ? '' : 'border-t border-line-soft'}>
                <button
                  onClick={() => onResults(q.id)}
                  className="w-full text-left flex items-center gap-4 px-5 py-4 row-hover transition-colors"
                >
                  <span className="h-9 w-9 rounded-md bg-surface-sunken text-ink-muted flex items-center justify-center shrink-0">
                    <ITarget size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold truncate">{q.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="text-[12px] text-ink-soft">
                        {new Date(q.created_at).toLocaleDateString('hr-HR')}
                      </span>
                      <span className="text-ink-soft">·</span>
                      <span className="text-[12px] text-ink-soft">{q.question_count} pitanja</span>
                      {q.bloom_focus.map((b) => (
                        <Pill key={b} tone="outline">
                          {bloomLabel(b)}
                        </Pill>
                      ))}
                    </div>
                  </div>
                  {q.completed_at ? (
                    <Pill tone="success">Završen</Pill>
                  ) : (
                    <Pill tone="outline">U tijeku</Pill>
                  )}
                  <IChevronRight size={16} className="text-ink-soft" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
