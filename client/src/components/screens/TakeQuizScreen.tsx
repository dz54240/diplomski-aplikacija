import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button, Modal, Notice, Pill } from '@/components/ui';
import { IChevronLeft, IChevronRight } from '@/components/icons';
import { type QuizDetail, type AttemptSubmit, type QuizResultsNavState, useSubmitQuizAttempts } from '@/lib/api/quizzes';
import { bloomLabel } from '@/lib/bloom';

export interface TakeQuizScreenProps {
  quiz: QuizDetail;
}

export function TakeQuizScreen({ quiz }: TakeQuizScreenProps) {
  const navigate = useNavigate();
  const submit = useSubmitQuizAttempts();

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    quiz.questions.map(() => null),
  );
  const [confirmEnd, setConfirmEnd] = useState(false);

  const viewStart = useRef<number[]>(quiz.questions.map(() => Date.now()));

  const q = quiz.questions[idx];
  const isLast = idx === quiz.questions.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        const n = parseInt(e.key) - 1;
        setAnswers((a) => {
          const c = [...a];
          c[idx] = n;
          return c;
        });
      }
      if (e.key === 'ArrowRight' && idx < quiz.questions.length - 1) {
        const next = idx + 1;
        viewStart.current[next] = Date.now();
        setIdx(next);
      }
      if (e.key === 'ArrowLeft' && idx > 0) {
        const prev = idx - 1;
        viewStart.current[prev] = Date.now();
        setIdx(prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, quiz.questions.length]);

  const select = (i: number) =>
    setAnswers((a) => {
      const c = [...a];
      c[idx] = i;
      return c;
    });

  const answeredCount = answers.filter((a) => a !== null).length;

  const finish = () => {
    const attempts: AttemptSubmit[] = quiz.questions.map((qq, i) => ({
      question_id: qq.id,
      selected: answers[i] != null ? qq.options[answers[i]!] : null,
      time_taken_ms: Date.now() - viewStart.current[i],
    }));
    submit.mutate(
      { quizId: quiz.id, attempts },
      {
        onSuccess: (data) => {
          const navState: QuizResultsNavState = { resultsData: data, answers };
          navigate({
            to: '/quizzes/$quizId/results',
            params: { quizId: quiz.id },
            state: navState as unknown as Record<string, unknown>,
          });
        },
      },
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <div className="border-b border-line-soft px-6 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate({ to: '/subjects/$subjectId/quizzes', params: { subjectId: quiz.subject_id } })}
          className="text-[13px] text-ink-muted hover:text-ink inline-flex items-center gap-1.5"
        >
          <IChevronLeft size={14} /> Izlaz
        </button>
        <div className="h-4 w-px bg-line" />
        <div className="text-[14px] font-semibold truncate">{quiz.title}</div>
        <div className="flex-1" />
        <div className="text-[13px] text-ink-muted tabular-nums">
          Pitanje {idx + 1} / {quiz.questions.length}
        </div>
      </div>

      <div className="px-6 py-3 border-b border-line-soft">
        <div className="flex items-center gap-1.5 max-w-[760px] mx-auto">
          {quiz.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                viewStart.current[i] = Date.now();
                setIdx(i);
              }}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i === idx
                  ? 'bg-[var(--accent)]'
                  : answers[i] !== null
                  ? 'bg-ink/30'
                  : 'bg-line'
              }`}
              title={`Pitanje ${i + 1}${answers[i] !== null ? ' (odgovoreno)' : ''}`}
            />
          ))}
          <span className="ml-3 text-[12px] text-ink-soft tabular-nums shrink-0">
            {answeredCount}/{quiz.questions.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[760px] mx-auto px-6 py-10 fade-up" key={idx}>
          <div className="flex items-center gap-2 mb-3 text-[12.5px] text-ink-soft">
            <span className="font-mono tabular-nums">Q{idx + 1}</span>
            <span>·</span>
            <Pill tone="outline">{bloomLabel(q.bloom_level)}</Pill>
          </div>
          <h2 className="text-[19px] font-semibold leading-snug tracking-tight">{q.stem}</h2>

          <ul className="mt-7 space-y-2.5">
            {q.options.map((opt, i) => {
              const sel = answers[idx] === i;
              return (
                <li key={i}>
                  <button
                    onClick={() => select(i)}
                    className={`group w-full text-left rounded-md border bg-white px-4 py-3.5 transition-colors flex items-start gap-3 ${
                      sel ? 'opt-selected' : 'border-line hover:border-ink-soft'
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded border text-[11.5px] font-mono shrink-0 ${
                        sel
                          ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                          : 'border-line text-ink-soft'
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-[14.5px] leading-relaxed text-ink">{opt}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 text-[11.5px] text-ink-soft">
            Pritisni <span className="font-mono">1–4</span> za odabir,{' '}
            <span className="font-mono">←</span> / <span className="font-mono">→</span> za navigaciju.
          </div>
        </div>
      </div>

      <div className="border-t border-line-soft px-6 py-3 flex items-center gap-3 bg-white">
        <Button
          variant="outline"
          disabled={idx === 0}
          onClick={() => {
            const prev = idx - 1;
            viewStart.current[prev] = Date.now();
            setIdx(prev);
          }}
          icon={<IChevronLeft size={14} />}
        >
          Prethodno
        </Button>
        <div className="flex-1" />
        {isLast ? (
          <Button onClick={() => setConfirmEnd(true)}>Završi kviz</Button>
        ) : (
          <Button
            onClick={() => {
              const next = idx + 1;
              viewStart.current[next] = Date.now();
              setIdx(next);
            }}
            iconRight={<IChevronRight size={14} />}
          >
            Sljedeće
          </Button>
        )}
      </div>

      <Modal
        open={confirmEnd}
        onClose={() => setConfirmEnd(false)}
        title="Završiti kviz?"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmEnd(false)}>
              Nastavi
            </Button>
            <Button onClick={finish} disabled={submit.isPending}>
              Završi i pogledaj rezultate
            </Button>
          </>
        }
      >
        <p className="text-[14px] text-ink-muted leading-relaxed">
          Odgovorio si na{' '}
          <span className="font-medium text-ink">
            {answeredCount} od {quiz.questions.length}
          </span>{' '}
          pitanja.
          {answeredCount < quiz.questions.length
            ? ' Neodgovorena pitanja bit će ocijenjena kao netočna.'
            : ''}
        </p>
        {submit.isError ? (
          <Notice tone="danger" className="mt-3">
            Slanje nije uspjelo. Pokušaj ponovo.
          </Notice>
        ) : null}
      </Modal>
    </div>
  );
}
