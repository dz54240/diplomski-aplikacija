import { useState } from 'react';
import { Outlet, createFileRoute, redirect, useNavigate, useParams, useRouterState } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { TopBar, Sidebar, type SidebarView } from '@/components/domain';
import { isLoggedIn, useAuth } from '@/lib/auth';
import { listSubjects } from '@/lib/api/subjects';

export const Route = createFileRoute('/_app')({
  beforeLoad: () => {
    if (!isLoggedIn()) throw redirect({ to: '/login' });
  },
  component: AppShell,
});

function AppShell() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: listSubjects,
  });

  // We can't usefully read params from a parent layout in a typed way without knowing
  // the child route shape. Read raw params and pluck subjectId / quizId at render time.
  const params = useParams({ strict: false }) as { subjectId?: string; quizId?: string };
  const currentSubject = params.subjectId
    ? subjects.find((s) => s.id === params.subjectId) ?? null
    : null;

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const view = inferView(pathname);

  const topBarUser = user
    ? {
        name: `${user.first_name} ${user.last_name}`.trim() || user.email,
        first: user.first_name,
        last: user.last_name,
        email: user.email,
      }
    : { name: 'Korisnik', first: 'Korisnik', last: '', email: '' };

  return (
    <div className="flex flex-col h-screen min-h-0 bg-white">
      <TopBar
        subjects={subjects}
        currentSubject={currentSubject}
        user={topBarUser}
        onToggleSidebar={currentSubject ? () => setSidebarCollapsed((c) => !c) : undefined}
        onSwitchSubject={(id) => navigate({ to: '/subjects/$subjectId', params: { subjectId: id } })}
        onGoSubjects={() => navigate({ to: '/subjects' })}
        onProfile={() => navigate({ to: '/account' })}
        onLogout={async () => {
          await logout();
          navigate({ to: '/login' });
        }}
      />
      <div className="flex flex-1 min-h-0">
        {currentSubject ? (
          <Sidebar
            subject={currentSubject}
            view={view}
            collapsed={sidebarCollapsed}
            onNavigate={(v) => {
              const subjectId = currentSubject.id;
              if (v === 'overview') navigate({ to: '/subjects/$subjectId', params: { subjectId } });
              if (v === 'documents') navigate({ to: '/subjects/$subjectId/documents', params: { subjectId } });
              if (v === 'chat') navigate({ to: '/subjects/$subjectId/chat', params: { subjectId } });
              if (v === 'quizzes') navigate({ to: '/subjects/$subjectId/quizzes', params: { subjectId } });
            }}
          />
        ) : null}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function inferView(pathname: string): SidebarView {
  if (pathname.includes('/documents')) return 'documents';
  if (pathname.includes('/chat') || pathname.includes('/conversations')) return 'chat';
  if (pathname.includes('/quizzes')) return 'quizzes';
  return 'overview';
}
