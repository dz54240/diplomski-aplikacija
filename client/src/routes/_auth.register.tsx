import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RegisterScreen } from '@/components/screens';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api/errors';

export const Route = createFileRoute('/_auth/register')({
  component: RegisterRoute,
});

function RegisterRoute() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  return (
    <RegisterScreen
      submitting={submitting}
      serverError={serverError}
      onSubmit={async (input) => {
        setServerError(null);
        setSubmitting(true);
        try {
          await register(input);
          navigate({ to: '/subjects' });
        } catch (err) {
          setServerError(err instanceof ApiError ? err.message : 'Greška pri registraciji.');
        } finally {
          setSubmitting(false);
        }
      }}
      onGoLogin={() => navigate({ to: '/login' })}
    />
  );
}
