import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { LoginScreen } from '@/components/screens';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api/errors';

export const Route = createFileRoute('/_auth/login')({
  component: LoginRoute,
});

function LoginRoute() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  return (
    <LoginScreen
      submitting={submitting}
      serverError={serverError}
      onSubmit={async ({ email, password }) => {
        setServerError(null);
        setSubmitting(true);
        try {
          await login(email, password);
          navigate({ to: '/subjects' });
        } catch (err) {
          setServerError(
            err instanceof ApiError ? 'Neispravan e-mail ili lozinka.' : 'Greška pri prijavi.',
          );
        } finally {
          setSubmitting(false);
        }
      }}
      onGoRegister={() => navigate({ to: '/register' })}
    />
  );
}
