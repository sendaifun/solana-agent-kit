import { createAPIFileRoute } from "@tanstack/react-start/api";
import { notFound } from "@tanstack/react-router";
import { useAppSession } from "~/utils/session";
import { deleteChatById, getChatById } from "db/queries";

export const APIRoute = createAPIFileRoute("/api/chat")({
  DELETE: async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = (await useAppSession()).data.id;

    if (!id) {
      console.info("Chat ID not provided");
      throw notFound();
    }

    if (!userId) {
      console.info("User not authenticated");
      throw notFound();
    }

    const chat = await getChatById({ id });

    if (!chat) {
      console.info(`Chat with id ${id} not found`);
      throw notFound();
    }

    if (chat.userId !== userId) {
      console.info(`Unauthorized access to chat with id ${id}`);
      throw notFound();
    }

    await deleteChatById({ id });

    return new Response(
      JSON.stringify({ message: "Chat deleted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  },
});
