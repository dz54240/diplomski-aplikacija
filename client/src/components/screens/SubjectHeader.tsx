import { IconButton, Menu } from '@/components/ui';
import { IEdit, IFolder, IMore, ITrash } from '@/components/icons';
import { type Subject } from '@/lib/ui-types';

export interface SubjectHeaderProps {
  subject: Subject;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SubjectHeader({ subject, onEdit, onDelete }: SubjectHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[12.5px] text-ink-soft">
          <IFolder size={13} />
          Predmet
        </div>
        <h1 className="mt-1 text-[26px] font-semibold tracking-tight leading-tight">{subject.name}</h1>
        <p className="mt-1.5 text-[14px] text-ink-muted max-w-[60ch] leading-relaxed">{subject.description}</p>
      </div>
      <Menu
        trigger={<IconButton icon={<IMore size={18} />} />}
        items={[
          { label: 'Uredi predmet', icon: <IEdit size={14} />, onClick: onEdit },
          { label: 'Obriši predmet', icon: <ITrash size={14} />, danger: true, onClick: onDelete },
        ]}
      />
    </div>
  );
}
