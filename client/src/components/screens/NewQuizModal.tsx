import { useEffect, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Modal, Notice, ProgressBar } from '@/components/ui';
import { IInfo, ISparkles } from '@/components/icons';
import { streamQuizGeneration, QuizGenerationError, type QuizErrorCode } from '@/lib/api/quizzes';
import { BLOOM_LABELS_HR, BLOOM_HR_TO_API } from '@/lib/bloom';
import { readToken } from '@/lib/auth/token';

const GEN_STAGES = [
  'Pretraživanje materijala',
  'Planiranje pitanja',
  'Sastavljanje pitanja',
  'Sprema u biblioteku',
] as const;

function errorTitle(code: QuizErrorCode): string {
  switch (code) {
    case 'unauthorized':           return 'Niste prijavljeni';
    case 'validation_error':       return 'Neispravan upit';
    case 'insufficient_materials': return 'Premalo materijala';
    case 'planner_no_topics':      return 'Nedovoljno tematske raznolikosti';
    case 'llm_timeout':            return 'Generacija predugo traje';
    case 'llm_failure':            return 'Greška u generaciji';
  }
}

export interface NewQuizModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewQuizModal({ open, onClose }: NewQuizModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { subjectId } = useParams({ from: '/_app/subjects/$subjectId/quizzes/' });

  const [count, setCount] = useState(10);
  const [bloom, setBloom] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [questionN, setQuestionN] = useState(0);
  const [questionTotal, setQuestionTotal] = useState(0);
  const [errorCode, setErrorCode] = useState<QuizErrorCode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setGenerating(false);
      setStageIndex(0);
      setQuestionN(0);
      setQuestionTotal(0);
      setCount(10);
      setBloom([]);
      setErrorCode(null);
      setErrorMessage(null);
    }
  }, [open]);

  const start = async () => {
    setErrorCode(null);
    setErrorMessage(null);
    setGenerating(true);
    setStageIndex(0);

    const token = readToken();
    if (!token) {
      setErrorCode('unauthorized');
      setErrorMessage('Niste prijavljeni.');
      return;
    }

    const bloomFocus = bloom.map((b) => BLOOM_HR_TO_API[b]).filter(Boolean);

    try {
      await streamQuizGeneration({
        subjectId,
        count,
        bloomFocus,
        token,
        onEvent: (e) => {
          if (e.type === 'stage') {
            const idx = GEN_STAGES.findIndex((_label, i) => {
              return (
                (e.stage === 'search'   && i === 0) ||
                (e.stage === 'plan'     && i === 1) ||
                (e.stage === 'drafting' && i === 2) ||
                (e.stage === 'save'     && i === 3)
              );
            });
            if (idx >= 0) setStageIndex(idx);
          } else if (e.type === 'question_progress') {
            setQuestionN(e.n);
            setQuestionTotal(e.total);
          } else if (e.type === 'quiz_done') {
            queryClient.invalidateQueries({ queryKey: ['quizzes', 'subject', subjectId] });
            onClose();
            navigate({ to: '/quizzes/$quizId/take', params: { quizId: e.id } });
          }
        },
      });
    } catch (e) {
      if (e instanceof QuizGenerationError) {
        setErrorCode(e.code);
        setErrorMessage(e.message);
      } else {
        setErrorCode('llm_failure');
        setErrorMessage((e as Error).message);
      }
      // keep generating true so the error view renders
    }
  };

  const toggleBloom = (b: string) =>
    setBloom((arr) => (arr.includes(b) ? arr.filter((x) => x !== b) : [...arr, b]));

  return (
    <Modal
      open={open}
      onClose={generating && !errorCode ? undefined : onClose}
      title={errorCode ? 'Greška pri generiranju' : generating ? 'Generiram kviz' : 'Novi kviz'}
      width={520}
      footer={
        errorCode ? (
          <>
            <Button variant="outline" onClick={onClose}>
              Zatvori
            </Button>
            <Button onClick={start} icon={<ISparkles size={14} />}>
              Pokušaj ponovo
            </Button>
          </>
        ) : generating ? null : (
          <>
            <Button variant="outline" onClick={onClose}>
              Odustani
            </Button>
            <Button onClick={start} icon={<ISparkles size={14} />}>
              Generiraj
            </Button>
          </>
        )
      }
    >
      {!generating ? (
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] font-medium">Broj pitanja</span>
              <span className="text-[13px] text-ink-muted tabular-nums">{count}</span>
            </div>
            <input
              type="range"
              min={5}
              max={20}
              step={1}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
            <div className="mt-1 flex justify-between text-[11px] text-ink-soft tabular-nums">
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
            </div>
          </div>

          <div>
            <span className="block mb-1.5 text-[13px] font-medium">
              Bloomove razine <span className="text-ink-soft font-normal">(neobavezno)</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {BLOOM_LABELS_HR.map((b) => {
                const on = bloom.includes(b);
                return (
                  <button
                    key={b}
                    onClick={() => toggleBloom(b)}
                    className={`px-2.5 h-7 rounded-md text-[12.5px] font-medium border transition-colors ${
                      on
                        ? 'border-[var(--accent)] bg-[var(--accent-50)] text-[var(--accent-700)]'
                        : 'border-line text-ink-muted hover:bg-surface-sunken'
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[12px] text-ink-soft">
              Ako ne odabereš nijednu, kviz miješa razine ovisno o gradivu.
            </p>
          </div>

          <Notice tone="info" icon={<IInfo size={14} />}>
            Generiranje koristi materijale iz ovog predmeta i može potrajati 15–30 sekundi.
          </Notice>
        </div>
      ) : (
        <div className="space-y-4">
          {errorCode ? (
            <Notice tone="danger" icon={<IInfo size={14} />}>
              <strong>{errorTitle(errorCode)}</strong>
              <div className="text-[12px] text-ink-soft mt-1">{errorMessage}</div>
            </Notice>
          ) : (
            <>
              <ProgressBar value={((stageIndex + 1) / GEN_STAGES.length) * 100} />
              <div className="text-[13px] text-ink-soft">
                {GEN_STAGES[stageIndex]}
                {stageIndex === 2 && questionTotal > 0 && (
                  <span className="ml-2 tabular-nums">({questionN} / {questionTotal})</span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
