import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  DefaultChatTransport,
  type TextUIPart,
  type UIMessage,
} from 'ai';
import { Button } from '@/components/ui';
import { CiteChip, renderAssistantText, CitationPanel } from '@/components/domain';
import {
  IArrowUp,
  IBookmark,
  IMessage,
  IPlus,
  ISparkles,
  IStop,
} from '@/components/icons';
import { CHAT_URL, chatFetch } from '@/lib/api/chat';
import type { ConversationListItem } from '@/lib/api/conversations';
import type { Subject } from '@/lib/api/subjects';
import { parseChunkPart, type ChunkMeta } from '@/lib/citations';

interface AgentStubData {
  agent: 'quiz' | 'tutor';
  message: string;
}

export interface ChatScreenProps {
  subject: Subject;
  conversations: ConversationListItem[];
  activeConvId: string | null;
  initialMessages?: UIMessage[];
  initialChunksByMessage?: Map<string, Map<string, ChunkMeta>>;
  onSelectConv: (id: string) => void;
  onNewConv: () => void;
}

function extractText(parts: UIMessage['parts']): string {
  return parts
    .filter((p): p is TextUIPart => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

function findAgentStub(parts: UIMessage['parts']): AgentStubData | null {
  const part = parts.find((p) => p.type === 'data-agent_stub');
  return part ? (part as unknown as { data: AgentStubData }).data : null;
}

function chunkOrdinals(text: string): Map<string, number> {
  const m = new Map<string, number>();
  let n = 0;
  for (const match of text.matchAll(/\[chunk:(\d+)\]/g)) {
    const id = match[1];
    if (!m.has(id)) m.set(id, ++n);
  }
  return m;
}

export function ChatScreen({
  subject,
  conversations,
  activeConvId,
  initialMessages,
  initialChunksByMessage,
  onSelectConv,
  onNewConv,
}: ChatScreenProps) {
  const [input, setInput] = useState('');
  const [openCitation, setOpenCitation] = useState<(ChunkMeta & { n: number }) | null>(null);
  const [chunksByMessage, setChunksByMessage] = useState<Map<string, Map<string, ChunkMeta>>>(
    () => initialChunksByMessage ?? new Map(),
  );
  const pendingChunksRef = useRef<Map<string, ChunkMeta>>(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const currentConvIdRef = useRef<string | null>(activeConvId);
  useEffect(() => {
    currentConvIdRef.current = activeConvId;
  }, [activeConvId]);
  const newlyCreatedConvIdRef = useRef<string | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: CHAT_URL,
        fetch: chatFetch,
        prepareSendMessagesRequest: ({ messages }) => {
          const lastUser = [...messages].reverse().find((m) => m.role === 'user');
          const text = lastUser ? extractText(lastUser.parts) : '';
          return {
            body: {
              subject_id: subject.id,
              conversation_id: currentConvIdRef.current,
              message: text,
            },
          };
        },
      }),
    [subject.id],
  );

  const { messages, status, sendMessage, stop } = useChat({
    id: activeConvId ?? `new-${subject.id}`,
    messages: initialMessages ?? [],
    transport,
    onData: (part) => {
      if (part.type === 'data-conversation') {
        const id = (part.data as { id: string }).id;
        currentConvIdRef.current = id;
        if (!activeConvId) newlyCreatedConvIdRef.current = id;
        return;
      }
      const meta = parseChunkPart(part);
      if (meta) {
        if (!pendingChunksRef.current.has(meta.id)) {
          pendingChunksRef.current.set(meta.id, meta);
        }
      }
    },
    onFinish: ({ message }) => {
      if (newlyCreatedConvIdRef.current) {
        newlyCreatedConvIdRef.current = null;
        queryClient.invalidateQueries({ queryKey: ['conversations', subject.id] });
      }
      if (pendingChunksRef.current.size > 0) {
        const snapshot = new Map(pendingChunksRef.current);
        pendingChunksRef.current = new Map();
        setChunksByMessage((prev) => {
          const next = new Map(prev);
          next.set(message.id, snapshot);
          return next;
        });
      }
    },
    onError: (err) => {
      console.error('chat stream error', err);
    },
  });

  const streaming = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || streaming) return;
    setInput('');
    void sendMessage({ text: t });
  };

  const onCite = (msgId: string, chunkId: string, n: number) => {
    const map = chunksByMessage.get(msgId);
    const meta = map?.get(chunkId);
    if (meta) setOpenCitation({ ...meta, n });
  };

  const isEmpty = messages.length === 0;
  const lastMsg = messages[messages.length - 1];
  const pendingThink =
    streaming && (!lastMsg || lastMsg.role === 'user' || extractText(lastMsg.parts).length === 0);

  return (
    <div className="flex-1 flex min-h-0 bg-white">
      <ConversationList
        conversations={conversations}
        activeId={activeConvId}
        onSelect={onSelectConv}
        onNew={onNewConv}
      />

      <div className="flex-1 flex min-w-0">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-6 h-12 border-b border-line-soft flex items-center gap-3">
            <div className="text-[13px] text-ink-muted truncate">
              <span className="text-ink font-medium">
                {activeConvId
                  ? conversations.find((c) => c.id === activeConvId)?.title || 'Razgovor'
                  : 'Novi razgovor'}
              </span>
            </div>
            <div className="flex-1" />
            <button className="text-[12.5px] text-ink-muted hover:text-ink inline-flex items-center gap-1.5">
              <IBookmark size={13} /> Spremi
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto max-w-[760px]">
              {isEmpty ? (
                <ChatEmptyState subject={subject} />
              ) : (
                <ul className="flex flex-col gap-6">
                  {messages.map((m, i) => (
                    <ChatMessageView
                      key={m.id || i}
                      message={m}
                      streaming={streaming && i === messages.length - 1}
                      chunks={chunksByMessage.get(m.id) ?? null}
                      onCite={(chunkId, n) => onCite(m.id, chunkId, n)}
                    />
                  ))}
                  {pendingThink && lastMsg?.role === 'user' ? (
                    <ThinkingPlaceholder />
                  ) : null}
                </ul>
              )}
            </div>
          </div>

          <ChatComposer
            value={input}
            onChange={setInput}
            onSend={() => send()}
            onStop={() => void stop()}
            streaming={streaming}
          />
        </div>

        {openCitation ? (
          <CitationPanel cite={openCitation} onClose={() => setOpenCitation(null)} />
        ) : null}
      </div>
    </div>
  );
}

function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
}: {
  conversations: ConversationListItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <aside className="w-[260px] shrink-0 border-r border-line-soft bg-surface-sunken/40 flex flex-col">
      <div className="p-3">
        <Button
          variant="outline"
          size="md"
          className="w-full justify-center"
          icon={<IPlus size={14} />}
          onClick={onNew}
        >
          Novi razgovor
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {conversations.length === 0 ? (
          <div className="px-2 py-3 text-[12.5px] text-ink-soft">Još nema razgovora.</div>
        ) : (
          <ul>
            {conversations.map((c) => {
              const label = (c.title ?? '').trim() || 'Razgovor';
              return (
                <li key={c.id}>
                  <button
                    onClick={() => onSelect(c.id)}
                    className={`w-full text-left rounded-md px-2 py-1.5 text-[13px] truncate ${
                      activeId === c.id
                        ? 'bg-white text-ink shadow-card'
                        : 'text-ink-muted hover:bg-white hover:text-ink'
                    }`}
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

function ChatEmptyState({ subject }: { subject: Subject }) {
  return (
    <div className="py-10 fade-up">
      <div className="flex items-center gap-2.5 text-[12.5px] text-ink-soft mb-2">
        <span className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-[var(--accent-50)] text-[var(--accent-700)]">
          <IMessage size={14} />
        </span>
        Pitaj nešto o predmetu
      </div>
      <h2 className="text-[22px] font-semibold tracking-tight">{subject.name}</h2>
      <p className="mt-1.5 text-[14px] text-ink-muted leading-relaxed max-w-[60ch]">
        Pitanja se pretražuju samo unutar tvojih materijala. Svaka tvrdnja u odgovoru ima svoj izvor — citat s
        naslovom dokumenta i brojem stranice.
      </p>
    </div>
  );
}

function ThinkingPlaceholder() {
  return (
    <li className="fade-up">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 rounded-md bg-[var(--accent-50)] text-[var(--accent-700)] items-center justify-center">
          <ISparkles size={14} />
        </span>
        <div className="flex-1 min-w-0 flex items-center gap-2 text-[13px] text-ink-muted">
          <span className="dot-ani">
            <span />
            <span />
            <span />
          </span>
          <span>Pretražujem materijale…</span>
        </div>
      </div>
    </li>
  );
}

function ChatMessageView({
  message,
  streaming,
  chunks,
  onCite,
}: {
  message: UIMessage;
  streaming: boolean;
  chunks: Map<string, ChunkMeta> | null;
  onCite: (chunkId: string, n: number) => void;
}) {
  const text = extractText(message.parts);

  if (message.role === 'user') {
    return (
      <li className="flex justify-end fade-up">
        <div className="max-w-[80%] rounded-lg bg-surface-sunken px-3.5 py-2.5 text-[14px] text-ink whitespace-pre-wrap leading-relaxed">
          {text}
        </div>
      </li>
    );
  }

  const showCaret = streaming && text.length > 0;
  const showProgress = streaming && text.length === 0;
  const ordinals = chunkOrdinals(text);
  const orderedChunkIds = Array.from(ordinals.entries()).sort((a, b) => a[1] - b[1]);
  const stub = findAgentStub(message.parts);

  return (
    <li className="fade-up">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 rounded-md bg-[var(--accent-50)] text-[var(--accent-700)] items-center justify-center">
          <ISparkles size={14} />
        </span>
        <div className="flex-1 min-w-0">
          {stub ? (
            <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
              <strong>{stub.agent === 'quiz' ? 'Quiz' : 'Tutor'}:</strong> {stub.message}
            </div>
          ) : null}
          {showProgress ? (
            <div className="flex items-center gap-2 text-[13px] text-ink-muted">
              <span className="dot-ani">
                <span />
                <span />
                <span />
              </span>
              <span>Pretražujem materijale…</span>
            </div>
          ) : (
            <div className={`text-[14.5px] leading-[1.65] text-ink ${showCaret ? 'caret' : ''}`}>
              {renderAssistantText(text, onCite, ordinals)}
            </div>
          )}
          {!streaming && orderedChunkIds.length > 0 ? (
            <div className="mt-4">
              <div className="text-[11px] font-medium uppercase tracking-wider text-ink-soft mb-2">
                Izvori
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {orderedChunkIds.map(([chunkId, n]) => {
                  const meta = chunks?.get(chunkId);
                  return (
                    <CiteChip
                      key={chunkId}
                      n={n}
                      doc={meta?.document_title ?? `chunk #${chunkId}`}
                      page={meta?.page ?? 0}
                      modality={meta?.modality}
                      section={meta?.section_path?.join(' › ')}
                      onOpen={() => onCite(chunkId, n)}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function ChatComposer({
  value,
  onChange,
  onSend,
  onStop,
  streaming,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  streaming: boolean;
}) {
  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!streaming) onSend();
    }
  };
  return (
    <div className="px-6 py-4 border-t border-line-soft bg-white">
      <div className="mx-auto max-w-[760px]">
        <div className="rounded-lg border border-line bg-white focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent-50)] transition-colors">
          <textarea
            rows={2}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKey}
            placeholder="Postavi pitanje o materijalima ovog predmeta…"
            className="w-full resize-none bg-transparent px-3.5 py-3 text-[14px] outline-none focus:outline-none focus-visible:outline-none placeholder:text-ink-soft min-h-[64px] max-h-[260px]"
          />
          <div className="flex items-center justify-between px-2.5 pb-2">
            <div className="flex items-center gap-1 text-[11.5px] text-ink-soft">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-line">
                <span className="font-mono">⏎</span>
                <span>pošalji</span>
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-line">
                <span className="font-mono">⇧⏎</span>
                <span>novi red</span>
              </span>
            </div>
            {streaming ? (
              <Button variant="outline" size="sm" icon={<IStop size={12} />} onClick={onStop}>
                Zaustavi
              </Button>
            ) : (
              <Button size="sm" icon={<IArrowUp size={14} />} disabled={!value.trim()} onClick={onSend}>
                Pošalji
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
