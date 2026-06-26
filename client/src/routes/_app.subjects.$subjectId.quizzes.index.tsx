import { useState } from 'react';
import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import { NewQuizModal, QuizzesList } from '@/components/screens';
import { Notice } from '@/components/ui';
import { useSubject } from '@/lib/api/hooks';
import { ApiError } from '@/lib/api/errors';
import { useSubjectQuizzes } from '@/lib/api/quizzes';

export const Route = createFileRoute('/_app/subjects/$subjectId/quizzes/')({
  component: QuizzesRoute,
});

function QuizzesRoute() {
  const { subjectId } = Route.useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const subjectQ = useSubject(subjectId);
  const { data: quizzes = [], isLoading } = useSubjectQuizzes(subjectId);

  if (subjectQ.isLoading) {
    return <div className="max-w-[1100px] mx-auto px-8 py-9 text-ink-muted">Učitavam…</div>;
  }
  if (subjectQ.error instanceof ApiError && subjectQ.error.status === 404) throw notFound();
  if (subjectQ.isError || !subjectQ.data) {
    return (
      <div className="max-w-[1100px] mx-auto px-8 py-9">
        <Notice tone="danger">Ne mogu dohvatiti predmet.</Notice>
      </div>
    );
  }

  const s = subjectQ.data;
  const subject = {
    id: s.id,
    name: s.name,
    description: s.description ?? '',
    color: '#2563EB',
    docCount: 0,
    lastActivity: 'nije pokrenuto',
    lastActivityRaw: 0,
  };

  return (
    <>
      <QuizzesList
        subject={subject}
        quizzes={quizzes}
        isLoading={isLoading}
        onResults={(id) => {
          const quiz = quizzes.find((q) => q.id === id);
          if (quiz?.completed_at) {
            navigate({ to: '/quizzes/$quizId/results', params: { quizId: id } });
          } else {
            navigate({ to: '/quizzes/$quizId/take', params: { quizId: id } });
          }
        }}
        onNew={() => setOpen(true)}
      />
      <NewQuizModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
