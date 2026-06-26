import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { NewSubjectModal, SubjectsDashboard } from '@/components/screens';
import { useCreateSubject, useSubjects } from '@/lib/api/hooks';
import { Notice } from '@/components/ui';
import { relativeTimeHr } from '@/lib/time';

export const Route = createFileRoute('/_app/subjects/')({
  component: SubjectsRoute,
});

function SubjectsRoute() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const subjectsQ = useSubjects();
  const createM = useCreateSubject();

  if (subjectsQ.isLoading) {
    return (
      <div className="max-w-[1180px] mx-auto px-8 py-10 text-ink-muted">
        Učitavam predmete…
      </div>
    );
  }
  if (subjectsQ.isError) {
    return (
      <div className="max-w-[1180px] mx-auto px-8 py-10">
        <Notice tone="danger">Ne mogu dohvatiti predmete. Pokušaj ponovno kasnije.</Notice>
      </div>
    );
  }

  const adapted = (subjectsQ.data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description ?? '',
    color: '#2563EB',
    docCount: s.documents_count,
    lastActivity: relativeTimeHr(s.last_activity_at),
    lastActivityRaw: new Date(s.last_activity_at).getTime(),
  }));

  return (
    <>
      <SubjectsDashboard
        subjects={adapted}
        onOpen={(id) => navigate({ to: '/subjects/$subjectId', params: { subjectId: id } })}
        onNew={() => setOpen(true)}
      />
      <NewSubjectModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={async (input) => {
          await createM.mutateAsync({ name: input.name, description: input.description });
          setOpen(false);
        }}
      />
    </>
  );
}
