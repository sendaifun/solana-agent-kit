import { createFileRoute } from "@tanstack/react-router";
import { Chat } from "~/components/Chat";
import { generateUUID } from "~/lib/utils";

export const Route = createFileRoute("/_authed/chats/")({
  loader: () => generateUUID(),
  component: PostsIndexComponent,
});

function PostsIndexComponent() {
  const id = Route.useLoaderData();

  return <Chat id={id} initialMessages={[]} isReadonly={false} />;
}
