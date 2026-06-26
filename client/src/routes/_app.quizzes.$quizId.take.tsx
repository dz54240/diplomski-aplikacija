import { createFileRoute, Navigate } from '@tanstack/react-router';
import { TakeQuizScreen } from '@/components/screens';
import { Notice } from '@/components/ui';
import { useQuiz } from '@/lib/api/quizzes';

export const Route = createFileRoute('/_app/quizzes/$quizId/take')({
  component: TakeQuizRoute,
});

function TakeQuizRoute() {
  const { quizId } = Route.useParams();
  const { data, isLoading, error } = useQuiz(quizId);

  if (isLoading) return <div className="p-6 text-[13px] text-ink-muted">Učitavam kviz…</div>;
  if (error || !data) return <div className="p-6"><Notice tone="danger" title="Greška">Kviz nije moguće učitati.</Notice></div>;
  if (data.completed_at) return <Navigate to="/quizzes/$quizId/results" params={{ quizId }} />;

  return <TakeQuizScreen quiz={data} />;
}
