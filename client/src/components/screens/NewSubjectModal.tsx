import { useEffect, useState } from 'react';
import { Button, Modal, TextField } from '@/components/ui';

export interface NewSubjectInput {
  name: string;
  description: string;
}

export interface NewSubjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: NewSubjectInput) => void | Promise<void>;
  initial?: { name: string; description: string };
  submitLabel?: string;
  title?: string;
}

export function NewSubjectModal({
  open,
  onClose,
  onCreate,
  initial,
  submitLabel = 'Stvori',
  title = 'Novi predmet',
}: NewSubjectModalProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [desc, setDesc] = useState(initial?.description ?? '');

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setDesc(initial?.description ?? '');
    }
  }, [open, initial?.name, initial?.description]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Odustani
          </Button>
          <Button
            disabled={!name.trim()}
            onClick={async () => {
              await onCreate({ name: name.trim(), description: desc.trim() });
            }}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <TextField
          label="Naziv predmeta"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="npr. Diskretna matematika"
        />
        <label className="block">
          <span className="block mb-1.5 text-[13px] font-medium text-ink">Kratki opis (neobavezno)</span>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Što se uči u ovom predmetu?"
            className="w-full min-h-[88px] rounded-md border border-line bg-white px-3 py-2 text-[14px] outline-none placeholder:text-ink-soft hover:border-ink-soft focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-50)] resize-y"
          />
        </label>
      </div>
    </Modal>
  );
}
