import { useState } from 'react';
import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import { NewSubjectModal, SubjectOverview } from '@/components/screens';
import { Notice } from '@/components/ui';
import { useDestroySubject, useSubject, useUpdateSubject } from '@/lib/api/hooks';
import { useConversations } from '@/lib/api/conversations';
import { useSubjectQuizzes } from '@/lib/api/quizzes';
import { ApiError } from '@/lib/api/errors';

export const Route = createFileRoute('/_app/subjects/$subjectId/')({
  component: SubjectOverviewRoute,
});

function SubjectOverviewRoute() {
  const { subjectId } = Route.useParams();
  const navigate = useNavigate();
  const subjectQ = useSubject(subjectId);
  const updateM = useUpdateSubject(subjectId);
  const destroyM = useDestroySubject();
  const conversationsQ = useConversations(subjectId);
  const quizzesQ = useSubjectQuizzes(subjectId);
  const [editOpen, setEditOpen] = useState(false);

  if (subjectQ.isLoading) {
    return (
      <div className="max-w-[1180px] mx-auto px-8 py-10 text-ink-muted">
        Učitavam…
      </div>
    );
  }
  if (subjectQ.error instanceof ApiError && subjectQ.error.status === 404) throw notFound();
  if (subjectQ.isError || !subjectQ.data) {
    return (
      <div className="max-w-[1180px] mx-auto px-8 py-10">
        <Notice tone="danger">Ne mogu dohvatiti predmet.</Notice>
      </div>
    );
  }

  const s = subjectQ.data;
  const adapted = {
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
      <SubjectOverview
        subject={adapted}
        conversations={conversationsQ.data ?? []}
        quizzes={quizzesQ.data ?? []}
        conversationsLoading={conversationsQ.isLoading}
        quizzesLoading={quizzesQ.isLoading}
        onEdit={() => setEditOpen(true)}
        onDelete={async () => {
          if (!window.confirm(`Obrisati predmet „${s.name}"?`)) return;
          await destroyM.mutateAsync(s.id);
          navigate({ to: '/subjects' });
        }}
        onAction={(action, id) => {
          const subjectId = s.id;
          if (action === 'chat') {
            if (id) {
              navigate({
                to: '/subjects/$subjectId/conversations/$conversationId',
                params: { subjectId, conversationId: id },
              });
            } else {
              navigate({ to: '/subjects/$subjectId/chat', params: { subjectId } });
            }
          }
          if (action === 'documents') {
            navigate({ to: '/subjects/$subjectId/documents', params: { subjectId } });
          }
          if (action === 'quizzes' || action === 'new-quiz') {
            navigate({ to: '/subjects/$subjectId/quizzes', params: { subjectId } });
          }
          if (action === 'quiz-results' && id) {
            const quiz = (quizzesQ.data ?? []).find((q) => q.id === id);
            if (quiz && !quiz.completed_at) {
              navigate({ to: '/quizzes/$quizId/take', params: { quizId: id } });
            } else {
              navigate({ to: '/quizzes/$quizId/results', params: { quizId: id } });
            }
          }
        }}
      />
      <NewSubjectModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Uredi predmet"
        submitLabel="Spremi"
        initial={{ name: s.name, description: s.description ?? '' }}
        onCreate={async (input) => {
          await updateM.mutateAsync({ name: input.name, description: input.description });
          setEditOpen(false);
        }}
      />
    </>
  );
}
