import { type FormEvent, useState } from 'react';
import { AuthShell } from './AuthShell';
import { Button, Notice, TextField } from '@/components/ui';
import { IAlert } from '@/components/icons';

export interface LoginScreenProps {
  onSubmit?: (input: { email: string; password: string }) => Promise<void> | void;
  onGoRegister?: () => void;
  submitting?: boolean;
  serverError?: string | null;
}

export function LoginScreen({
  onSubmit,
  onGoRegister,
  submitting = false,
  serverError,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localErr, setLocalErr] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalErr('');
    if (!email || !password) {
      setLocalErr('Unesi e-mail i lozinku.');
      return;
    }
    await onSubmit?.({ email: email.trim(), password });
  };

  const error = serverError || localErr;

  return (
    <AuthShell>
      <h1 className="text-[24px] font-semibold tracking-tight">Prijava</h1>
      <p className="mt-1.5 text-[14px] text-ink-muted">
        Nastavi učiti uz svoje vlastite materijale.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-4">
        <TextField
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ime.prezime@primjer.hr"
          autoComplete="email"
        />
        <TextField
          label="Lozinka"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />
        {error ? (
          <Notice tone="danger" icon={<IAlert size={16} />}>
            {error}
          </Notice>
        ) : null}
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? (
            <span className="dot-ani">
              <span />
              <span />
              <span />
            </span>
          ) : (
            'Prijavi se'
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-[14px] text-ink-muted">
        Nemaš račun?{' '}
        <button
          onClick={onGoRegister}
          className="font-medium text-[var(--accent-700)] hover:underline"
        >
          Registriraj se
        </button>
      </p>
    </AuthShell>
  );
}
