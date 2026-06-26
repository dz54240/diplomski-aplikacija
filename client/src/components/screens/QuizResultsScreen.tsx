import { useEffect, useRef, useState } from 'react';
import { Button, Notice, Pill } from '@/components/ui';
import { CiteChip, renderAssistantText, CitationPanel } from '@/components/domain';
import { ICheck, IChevronLeft, ISparkles, ITarget, IX } from '@/components/icons';
import { type QuizQuestionView, type AttemptResult, streamTutorExplanation, TutorError } from '@/lib/api/quizzes';
import { bloomLabel } from '@/lib/bloom';
import { readToken } from '@/lib/auth/token';
import { type ChunkMeta } from '@/lib/citations';

export interface QuizResultsScreenProps {
  title: string;
  score: number;
  total: number;
  questions: QuizQuestionView[];
  results: AttemptResult[];
  userAnswers: (number | null)[];
  onBack: () => void;
}

interface TutorState {
  text: string;
  chunks: Map<string, ChunkMeta>;
  status: 'streaming' | 'done' | 'error';
  errorMessage?: string;
}

export function QuizResultsScreen({
  title,
  score,
  total,
  questions,
  results,
  userAnswers,
  onBack,
}: QuizResultsScreenProps) {
  const [openCitation, setOpenCitation] = useState<(ChunkMeta & { n: number }) | null>(null);
  const [tutorByQ, setTutorByQ] = useState<Map<string, TutorState>>(() => new Map());
  const abortByQ = useRef<Map<string, AbortController>>(new Map());

  useEffect(() => {
    const controllers = abortByQ.current;
    return () => controllers.forEach((c) => c.abort());
  }, []);

  const updateTutor = (qid: string, fn: (prev: TutorState) => TutorState) =>
    setTutorByQ((prev) => {
      const next = new Map(prev);
      const cur = next.get(qid) ?? { text: '', chunks: new Map(), status: 'streaming' as const };
      next.set(qid, fn(cur));
      return next;
    });

  const explain = (q: QuizQuestionView, selectedAnswer: string) => {
    const existing = tutorByQ.get(q.id);
    if (existing && existing.status !== 'error') return;
    const token = readToken();
    if (!token) {
      updateTutor(q.id, () => ({ text: '', chunks: new Map(), status: 'error', errorMessage: 'Niste prijavljeni.' }));
      return;
    }
    const ac = new AbortController();
    abortByQ.current.set(q.id, ac);
    setTutorByQ((prev) => {
      const next = new Map(prev);
      next.set(q.id, { text: '', chunks: new Map(), status: 'streaming' });
      return next;
    });
    streamTutorExplanation({
      quizQuestionId: q.id,
      selectedAnswer,
      token,
      signal: ac.signal,
      onText: (delta) => updateTutor(q.id, (p) => ({ ...p, text: p.text + delta })),
      onChunk: (c) =>
        updateTutor(q.id, (p) => {
          if (p.chunks.has(c.id)) return p;
          const chunks = new Map(p.chunks);
          chunks.set(c.id, c);
          return { ...p, chunks };
        }),
    })
      .then(() => updateTutor(q.id, (p) => ({ ...p, status: 'done' })))
      .catch((err) => {
        if (ac.signal.aborted) return;
        const message = err instanceof TutorError ? err.message : 'Objašnjenje nije uspjelo.';
        updateTutor(q.id, (p) => ({ ...p, status: 'error', errorMessage: message }));
      });
  };

  const retry = (q: QuizQuestionView, selectedAnswer: string) => {
    setTutorByQ((prev) => {
      const next = new Map(prev);
      next.delete(q.id);
      return next;
    });
    explain(q, selectedAnswer);
  };

  return (
    <>
      <div className="max-w-[860px] mx-auto px-6 py-9">
        <button
          onClick={onBack}
          className="text-[13px] text-ink-muted hover:text-ink inline-flex items-center gap-1.5 mb-4"
        >
          <IChevronLeft size={14} /> Natrag na kvizove
        </button>

        <div className="rounded-lg border border-line bg-white p-6 fade-up">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="flex-1 min-w-[280px]">
              <div className="text-[12.5px] text-ink-soft inline-flex items-center gap-1.5">
                <ITarget size={13} /> Rezultati
              </div>
              <h1 className="mt-1 text-[24px] font-semibold tracking-tight">{title}</h1>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap text-[13px] text-ink-muted">
                <span>Završeno upravo sad</span>
                <span>·</span>
                <span>{total} pitanja</span>
              </div>
            </div>
            <div className="rounded-md bg-surface-sunken px-5 py-4 flex items-baseline gap-2">
              <span className="text-[34px] font-semibold tabular-nums">{score}</span>
              <span className="text-[16px] text-ink-soft tabular-nums">/ {total}</span>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <ResultStat label="Točno" value={score} tone="success" />
            <ResultStat label="Netočno" value={total - score} tone="danger" />
            <ResultStat
              label="Uspjeh"
              value={`${total > 0 ? Math.round((score / total) * 100) : 0}%`}
              tone="accent"
            />
          </div>
        </div>

        <h2 className="mt-8 mb-3 text-[15px] font-semibold">Pregled odgovora</h2>
        <ul className="space-y-3">
          {questions.map((q, i) => {
            const result = results.find((r) => r.question_id === q.id);
            const isCorrect = result?.is_correct ?? false;
            return (
              <li key={q.id}>
                <ResultCard
                  idx={i}
                  question={q}
                  userAnswer={userAnswers[i]}
                  isCorrect={isCorrect}
                  tutor={tutorByQ.get(q.id) ?? null}
                  onExplain={(selected) => explain(q, selected)}
                  onRetry={(selected) => retry(q, selected)}
                  onCite={(meta, n) => setOpenCitation({ ...meta, n })}
                />
              </li>
            );
          })}
        </ul>
      </div>

      {openCitation ? (
        <div className="fixed right-0 top-0 z-40 h-screen shadow-2xl">
          <CitationPanel cite={openCitation} onClose={() => setOpenCitation(null)} />
        </div>
      ) : null}
    </>
  );
}

function ResultStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: 'success' | 'danger' | 'accent';
}) {
  const tones = {
    success: 'text-[#067647]',
    danger: 'text-[#B42318]',
    accent: 'text-[var(--accent-700)]',
  };
  return (
    <div className="rounded-md border border-line py-2.5">
      <div className={`text-[20px] font-semibold tabular-nums ${tones[tone]}`}>{value}</div>
      <div className="text-[11.5px] text-ink-soft uppercase tracking-wider">{label}</div>
    </div>
  );
}

function ResultCard({
  idx,
  question,
  userAnswer,
  isCorrect,
  tutor,
  onExplain,
  onRetry,
  onCite,
}: {
  idx: number;
  question: QuizQuestionView;
  userAnswer: number | null;
  isCorrect: boolean;
  tutor: TutorState | null;
  onExplain: (selectedAnswer: string) => void;
  onRetry: (selectedAnswer: string) => void;
  onCite: (meta: ChunkMeta, n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const correctIndex = question.correct_answer != null ? question.options.indexOf(question.correct_answer) : -1;
  const canExplain = !isCorrect && userAnswer != null;
  const selectedAnswer = userAnswer != null ? question.options[userAnswer] : null;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && selectedAnswer != null) onExplain(selectedAnswer);
  };

  return (
    <div className="rounded-lg border border-line bg-white overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-center gap-2 text-[12px] text-ink-soft mb-2">
          <span className="font-mono tabular-nums">Q{idx + 1}</span>
          <span>·</span>
          <Pill tone="outline">{bloomLabel(question.bloom_level)}</Pill>
          <span className="ml-auto inline-flex items-center gap-1.5">
            {isCorrect ? (
              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#067647]">
                <ICheck size={13} /> Točno
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#B42318]">
                <IX size={13} /> Netočno
              </span>
            )}
          </span>
        </div>
        <h3 className="text-[14.5px] font-semibold leading-snug">{question.stem}</h3>

        <ul className="mt-4 space-y-1.5">
          {question.options.map((opt, i) => {
            const isUser = userAnswer === i;
            const isCorrectOpt = i === correctIndex;
            const cls = isCorrectOpt
              ? 'border-[#A6F4C5] bg-[#ECFDF3]'
              : isUser
                ? 'border-[#FECDCA] bg-[#FEF3F2]'
                : 'border-line bg-white';
            const badgeCls = isCorrectOpt
              ? 'border-[#12B76A] bg-[#12B76A] text-white'
              : isUser
                ? 'border-[#F04438] bg-[#F04438] text-white'
                : 'border-line text-ink-soft';
            return (
              <li key={i} className={`rounded-md border ${cls} px-3 py-2 flex items-start gap-2.5`}>
                <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded border text-[11px] font-mono shrink-0 ${badgeCls}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-[13.5px] leading-relaxed text-ink flex-1">{opt}</span>
                {isCorrectOpt ? (
                  <span className="text-[11px] font-medium text-[#067647] whitespace-nowrap">Točan odgovor</span>
                ) : isUser ? (
                  <span className="text-[11px] font-medium text-ink-muted whitespace-nowrap">Tvoj odgovor</span>
                ) : null}
              </li>
            );
          })}
        </ul>

        {canExplain ? (
          <div className="mt-3">
            <Button variant="outline" size="sm" icon={<ISparkles size={13} />} onClick={toggle}>
              {open ? 'Sakrij objašnjenje' : 'Objasni'}
            </Button>
          </div>
        ) : null}
      </div>

      {open && canExplain && selectedAnswer != null ? (
        <TutorExplanationPanel
          tutor={tutor}
          onCite={onCite}
          onRetry={() => onRetry(selectedAnswer)}
        />
      ) : null}
    </div>
  );
}

function chunkOrdinals(text: string): Map<string, number> {
  const m = new Map<string, number>();
  let n = 0;
  for (const match of text.matchAll(/\[chunk:(\d+)\]/g)) {
    const id = match[1];
    if (!m.has(id)) m.set(id, ++n);
  }
  return m;
}

function TutorExplanationPanel({
  tutor,
  onCite,
  onRetry,
}: {
  tutor: TutorState | null;
  onCite: (meta: ChunkMeta, n: number) => void;
  onRetry: () => void;
}) {
  const text = tutor?.text ?? '';
  const ordinals = chunkOrdinals(text);
  const orderedChunkIds = Array.from(ordinals.entries()).sort((a, b) => a[1] - b[1]);
  const streaming = tutor?.status === 'streaming';

  return (
    <div className="border-t border-line-soft bg-surface-sunken/30 px-5 py-4 fade-up">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 rounded-md bg-[var(--accent-50)] text-[var(--accent-700)] items-center justify-center">
          <ISparkles size={14} />
        </span>
        <div className="flex-1 min-w-0">
          {tutor?.status === 'error' ? (
            <Notice tone="danger" title="Objašnjenje nije uspjelo">
              {tutor.errorMessage ?? 'Pokušaj ponovo.'}
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={onRetry}>Pokušaj ponovo</Button>
              </div>
            </Notice>
          ) : streaming && text.length === 0 ? (
            <div className="flex items-center gap-2 text-[13px] text-ink-muted">
              <span className="dot-ani"><span /><span /><span /></span>
              <span>Pripremam objašnjenje…</span>
            </div>
          ) : (
            <>
              <div className={`text-[14px] leading-[1.65] text-ink ${streaming ? 'caret' : ''}`}>
                {renderAssistantText(text, (chunkId, n) => {
                  const meta = tutor?.chunks.get(chunkId);
                  if (meta) onCite(meta, n);
                }, ordinals)}
              </div>
              {!streaming && orderedChunkIds.length > 0 ? (
                <div className="mt-4">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-ink-soft mb-2">Izvori</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {orderedChunkIds.map(([chunkId, n]) => {
                      const meta = tutor?.chunks.get(chunkId);
                      return (
                        <CiteChip
                          key={chunkId}
                          n={n}
                          doc={meta?.document_title ?? `chunk #${chunkId}`}
                          page={meta?.page ?? 0}
                          modality={meta?.modality}
                          section={meta?.section_path?.join(' › ')}
                          onOpen={() => {
                            if (meta) onCite(meta, n);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
