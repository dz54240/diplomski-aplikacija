import { useState } from 'react';
import { Button, Card, Modal, Notice, TextField } from '@/components/ui';
import { Avatar } from '@/components/domain';
import { IAlert, ICheck, ILogout } from '@/components/icons';
import { type MockUser } from '@/lib/auth';

export interface ProfileScreenProps {
  user: MockUser;
  onUpdate?: (u: MockUser) => void;
  onLogout?: () => void;
}

export function ProfileScreen({ user, onUpdate, onLogout }: ProfileScreenProps) {
  const [first, setFirst] = useState(user.first);
  const [last, setLast] = useState(user.last);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  const save = () => {
    onUpdate?.({ name: `${first} ${last}`, first, last, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="max-w-[680px] mx-auto px-8 py-9">
      <h1 className="text-[24px] font-semibold tracking-tight">Profil</h1>
      <p className="mt-1 text-[14px] text-ink-muted">Postavke računa i sigurnost.</p>

      <Card className="mt-6 p-6">
        <div className="flex items-center gap-4">
          <Avatar name={`${first} ${last}`} size={52} />
          <div>
            <div className="text-[15px] font-semibold">
              {first} {last}
            </div>
            <div className="text-[13px] text-ink-soft">{email}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <TextField label="Ime" value={first} onChange={(e) => setFirst(e.target.value)} />
          <TextField label="Prezime" value={last} onChange={(e) => setLast(e.target.value)} />
        </div>
        <div className="mt-3">
          <TextField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="mt-5 flex items-center gap-2">
          <Button onClick={save}>Spremi promjene</Button>
          {saved ? (
            <span className="text-[12.5px] text-[#067647] inline-flex items-center gap-1">
              <ICheck size={13} /> Spremljeno
            </span>
          ) : null}
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <h3 className="text-[14px] font-semibold">Sigurnost</h3>
        <p className="mt-1 text-[13px] text-ink-muted">Lozinka i odjava.</p>
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setPwdOpen(true)}>
            Promijeni lozinku
          </Button>
          <Button variant="outline" icon={<ILogout size={14} />} onClick={onLogout}>
            Odjavi se
          </Button>
        </div>
      </Card>

      <ChangePasswordModal open={pwdOpen} onClose={() => setPwdOpen(false)} />
    </div>
  );
}

function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = () => {
    if (b.length < 8) {
      setErr('Nova lozinka mora imati najmanje 8 znakova.');
      return;
    }
    if (b !== c) {
      setErr('Lozinke se ne podudaraju.');
      return;
    }
    setErr('');
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onClose();
      setA('');
      setB('');
      setC('');
    }, 500);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Promijeni lozinku"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Odustani
          </Button>
          <Button onClick={submit} disabled={saving || !a || !b || !c}>
            {saving ? 'Spremam…' : 'Spremi'}
          </Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <TextField label="Trenutna lozinka" type="password" value={a} onChange={(e) => setA(e.target.value)} />
        <TextField
          label="Nova lozinka"
          type="password"
          value={b}
          onChange={(e) => setB(e.target.value)}
          hint="Najmanje 8 znakova."
        />
        <TextField label="Potvrdi novu lozinku" type="password" value={c} onChange={(e) => setC(e.target.value)} />
        {err ? (
          <Notice tone="danger" icon={<IAlert size={14} />}>
            {err}
          </Notice>
        ) : null}
      </div>
    </Modal>
  );
}
