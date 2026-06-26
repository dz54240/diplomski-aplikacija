import {
  BookOpen,
  Folder,
  Plus,
  Search,
  MessageSquare,
  File,
  FileText,
  Upload,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ArrowRight,
  ArrowUp,
  User,
  LogOut,
  Brain,
  Sparkles,
  Send,
  Square,
  Clock,
  MoreHorizontal,
  Pencil,
  Archive,
  Trash2,
  RefreshCw,
  TriangleAlert,
  Info,
  PanelRight,
  PanelLeft,
  GripVertical,
  Settings,
  Target,
  Zap,
  Eye,
  EyeOff,
  Paperclip,
  Download,
  ExternalLink,
  Bookmark,
  Play,
  Filter,
} from 'lucide-react';

import type { LucideProps } from 'lucide-react';

type IconProps = Omit<LucideProps, 'size'> & { size?: number };

const wrap =
  (Cmp: React.ComponentType<LucideProps>) =>
  ({ size = 18, strokeWidth = 1.75, ...rest }: IconProps) => (
    <Cmp size={size} strokeWidth={strokeWidth} aria-hidden {...rest} />
  );

export const IBookOpen = wrap(BookOpen);
export const IFolder = wrap(Folder);
export const IPlus = wrap(Plus);
export const ISearch = wrap(Search);
export const IMessage = wrap(MessageSquare);
export const IFile = wrap(File);
export const IFileText = wrap(FileText);
export const IUpload = wrap(Upload);
export const ICheck = wrap(Check);
export const IX = wrap(X);
export const IChevronDown = wrap(ChevronDown);
export const IChevronRight = wrap(ChevronRight);
export const IChevronLeft = wrap(ChevronLeft);
export const IChevronUp = wrap(ChevronUp);
export const IArrowRight = wrap(ArrowRight);
export const IArrowUp = wrap(ArrowUp);
export const IUser = wrap(User);
export const ILogout = wrap(LogOut);
export const IBrain = wrap(Brain);
export const ISparkles = wrap(Sparkles);
export const ISend = wrap(Send);
export const ISquare = wrap(Square);
export const IClock = wrap(Clock);
export const IMore = wrap(MoreHorizontal);
export const IEdit = wrap(Pencil);
export const IArchive = wrap(Archive);
export const ITrash = wrap(Trash2);
export const IRefresh = wrap(RefreshCw);
export const IAlert = wrap(TriangleAlert);
export const IInfo = wrap(Info);
export const IPanel = wrap(PanelRight);
export const ISidebar = wrap(PanelLeft);
export const IGrip = wrap(GripVertical);
export const ISettings = wrap(Settings);
export const ITarget = wrap(Target);
export const IBolt = wrap(Zap);
export const IEye = wrap(Eye);
export const IEyeOff = wrap(EyeOff);
export const IPaperclip = wrap(Paperclip);
export const IDownload = wrap(Download);
export const IExternal = wrap(ExternalLink);
export const IBookmark = wrap(Bookmark);
export const IPlay = wrap(Play);
export const IFilter = wrap(Filter);

// Lucide's Square is outline-only; render a filled square instead.
export function IStop({ size = 18, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      {...rest}
    >
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
    </svg>
  );
}
