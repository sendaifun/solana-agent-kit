import {
  ErrorComponent,
  createFileRoute,
  notFound,
} from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { Chat } from "~/components/Chat";
import { NotFound } from "~/components/NotFound.js";
import {
  fetchChat,
  fetchMessages,
  saveChatFn,
  saveMessagesFn,
} from "~/functions/chats.js";
import { convertToUIMessages, generateUUID } from "~/lib/utils";

export const Route = createFileRoute("/_authed/chats/$chatId")({
  loader: async ({ params: { chatId }, location }) => {
    const chat = await fetchChat({ data: { id: chatId } });
    const { input } = location.search as { input?: string };

    if (!chat) {
      if (input) {
        await saveChatFn({
          data: {
            id: chatId,
            title: input.slice(0, 20),
          },
        });
        await saveMessagesFn({
          data: {
            messages: [
              {
                id: generateUUID(),
                chatId: chatId,
                role: "user",
                attachments: [],
                parts: [{ type: "text", text: input }],
                createdAt: new Date(),
              },
            ],
          },
        });
      } else {
        throw notFound();
      }
    }

    const messages = await fetchMessages({ data: { id: chatId } });

    if (!messages) {
      throw notFound();
    }

    return {
      chat,
      messages,
    };
  },
  errorComponent: PostErrorComponent,
  component: PostComponent,
  notFoundComponent: () => {
    return <NotFound>Chat not found</NotFound>;
  },
});

function PostErrorComponent({ error }: ErrorComponentProps) {
  return <ErrorComponent error={error} />;
}

function PostComponent() {
  const { chat, messages } = Route.useLoaderData();
  const { chatId } = Route.useParams();

  return (
    <>
      <Chat
        id={chat?.id ?? chatId}
        initialMessages={convertToUIMessages(messages)}
        isReadonly={false}
      />
    </>
  );
}
