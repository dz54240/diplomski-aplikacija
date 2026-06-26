import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import type { UIMessage } from 'ai';
import { ChatScreen } from '@/components/screens';
import { getSubject } from '@/lib/api/subjects';
import {
  useConversation,
  useConversations,
  useHistoryChunks,
} from '@/lib/api/conversations';
import type { ChunkMeta } from '@/lib/citations';

export const Route = createFileRoute('/_app/subjects/$subjectId/conversations/$conversationId')({
  loader: async ({ params }) => {
    const subject = await getSubject(params.subjectId);
    if (!subject) throw notFound();
    return { subject, conversationId: params.conversationId };
  },
  component: ConversationRoute,
});

function ConversationRoute() {
  const { subject, conversationId } = Route.useLoaderData();
  const navigate = useNavigate();
  const { data: conversations = [] } = useConversations(subject.id);
  const { data: detail, isLoading: convLoading } = useConversation(conversationId);
  const { data: historyChunks, isLoading: chunksLoading } =
    useHistoryChunks(conversationId);

  if (convLoading || chunksLoading || !detail || detail.id !== conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-[13px] text-ink-soft">
        Učitavam razgovor…
      </div>
    );
  }

  const initialMessages: UIMessage[] = detail.messages.map((m) => ({
    id: String(m.id),
    role: m.role === 'tool' ? 'assistant' : m.role,
    parts: [{ type: 'text', text: m.content }],
  }));

  const initialChunksByMessage = new Map<string, Map<string, ChunkMeta>>();
  if (historyChunks) {
    for (const [msgId, chunks] of Object.entries(historyChunks.messages)) {
      const inner = new Map<string, ChunkMeta>();
      for (const c of chunks) inner.set(c.id, c);
      initialChunksByMessage.set(msgId, inner);
    }
  }

  return (
    <ChatScreen
      key={conversationId}
      subject={subject}
      conversations={conversations}
      activeConvId={conversationId}
      initialMessages={initialMessages}
      initialChunksByMessage={initialChunksByMessage}
      onSelectConv={(id) =>
        navigate({
          to: '/subjects/$subjectId/conversations/$conversationId',
          params: { subjectId: subject.id, conversationId: id },
        })
      }
      onNewConv={() =>
        navigate({ to: '/subjects/$subjectId/chat', params: { subjectId: subject.id } })
      }
    />
  );
}
