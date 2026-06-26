import { createFileRoute, useNavigate, useRouterState } from '@tanstack/react-router';
import { QuizResultsScreen } from '@/components/screens';
import { Notice } from '@/components/ui';
import { resolveResultsView, useQuiz, type QuizResultsNavState } from '@/lib/api/quizzes';

export const Route = createFileRoute('/_app/quizzes/$quizId/results')({
  component: QuizResultsRoute,
});

function QuizResultsRoute() {
  const { quizId } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuiz(quizId);
  const navState = useRouterState({
    select: (s) => s.location.state as unknown as Partial<QuizResultsNavState>,
  });

  if (isLoading) return <div className="p-6 text-[13px] text-ink-muted">Učitavam rezultate…</div>;
  if (error || !data)
    return (
      <div className="p-6">
        <Notice tone="danger" title="Greška">
          Rezultate nije moguće učitati.
        </Notice>
      </div>
    );

  const view = resolveResultsView(data, navState);
  if (!view) {
    return (
      <div className="p-6">
        <Notice tone="info" title="Nema rezultata za prikaz">
          Otvori kviz iz liste i završi ga da vidiš rezultate.
        </Notice>
      </div>
    );
  }

  return (
    <QuizResultsScreen
      title={data.title}
      score={view.score}
      total={view.total}
      questions={data.questions}
      results={view.results}
      userAnswers={view.userAnswers}
      onBack={() =>
        navigate({ to: '/subjects/$subjectId/quizzes', params: { subjectId: data.subject_id } })
      }
    />
  );
}
