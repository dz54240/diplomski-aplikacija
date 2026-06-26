import { type FormEvent, useState } from 'react';
import { AuthShell } from './AuthShell';
import { Button, Notice, TextField } from '@/components/ui';
import { IAlert } from '@/components/icons';

export interface RegisterScreenProps {
  onSubmit?: (input: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => Promise<void> | void;
  onGoLogin?: () => void;
  submitting?: boolean;
  serverError?: string | null;
}

interface FormState {
  first: string;
  last: string;
  email: string;
  pwd: string;
  pwd2: string;
}

export function RegisterScreen({
  onSubmit,
  onGoLogin,
  submitting = false,
  serverError,
}: RegisterScreenProps) {
  const [form, setForm] = useState<FormState>({ first: '', last: '', email: '', pwd: '', pwd2: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = (k: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Partial<Record<keyof FormState, string>> = {};
    if (!form.first) er.first = 'Obavezno polje.';
    if (!form.last) er.last = 'Obavezno polje.';
    if (!form.email || !/.+@.+\..+/.test(form.email)) er.email = 'Neispravan e-mail.';
    if (form.pwd.length < 8) er.pwd = 'Najmanje 8 znakova.';
    if (form.pwd !== form.pwd2) er.pwd2 = 'Lozinke se ne podudaraju.';
    setErrors(er);
    if (Object.keys(er).length) return;

    await onSubmit?.({
      first_name: form.first.trim(),
      last_name: form.last.trim(),
      email: form.email.trim(),
      password: form.pwd,
    });
  };

  return (
    <AuthShell>
      <h1 className="text-[24px] font-semibold tracking-tight">Stvori račun</h1>
      <p className="mt-1.5 text-[14px] text-ink-muted">Tvoji predmeti i materijali ostaju samo tvoji.</p>

      <form onSubmit={submit} className="mt-7 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Ime" value={form.first} onChange={set('first')} placeholder="Ivana" error={errors.first} />
          <TextField label="Prezime" value={form.last} onChange={set('last')} placeholder="Kovač" error={errors.last} />
        </div>
        <TextField
          label="E-mail"
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="ivana.kovac@primjer.hr"
          error={errors.email}
        />
        <TextField
          label="Lozinka"
          type="password"
          value={form.pwd}
          onChange={set('pwd')}
          placeholder="Najmanje 8 znakova"
          error={errors.pwd}
          hint={!errors.pwd ? 'Najmanje 8 znakova.' : undefined}
        />
        <TextField
          label="Potvrda lozinke"
          type="password"
          value={form.pwd2}
          onChange={set('pwd2')}
          placeholder="Ponovi lozinku"
          error={errors.pwd2}
        />
        {serverError ? (
          <Notice tone="danger" icon={<IAlert size={16} />}>
            {serverError}
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
            'Stvori račun'
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-[14px] text-ink-muted">
        Već imaš račun?{' '}
        <button onClick={onGoLogin} className="font-medium text-[var(--accent-700)] hover:underline">
          Prijavi se
        </button>
      </p>
    </AuthShell>
  );
}
