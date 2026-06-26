import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import { ChatScreen } from '@/components/screens';
import { useConversations } from '@/lib/api/conversations';
import { getSubject } from '@/lib/api/subjects';

export const Route = createFileRoute('/_app/subjects/$subjectId/chat')({
  loader: async ({ params }) => {
    const subject = await getSubject(params.subjectId);
    if (!subject) throw notFound();
    return { subject };
  },
  component: ChatRoute,
});

function ChatRoute() {
  const { subject } = Route.useLoaderData();
  const { data: conversations = [] } = useConversations(subject.id);
  const navigate = useNavigate();
  return (
    <ChatScreen
      subject={subject}
      conversations={conversations}
      activeConvId={null}
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
