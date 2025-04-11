import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  deleteMessagesByChatIdAfterTimestamp,
  getChatById,
  getChatsByUserId,
  getMessageById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from "db/queries";
import { useAppSession } from "../utils/session";
import type { DBMessage } from "db/schema";

export type PostType = {
  id: string;
  title: string;
  body: string;
};

export const fetchChat = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const chat = await getChatById({ id: data.id });
    const userId = (await useAppSession()).data.id;

    if (!chat) return undefined;

    if (chat.userId !== userId) {
      console.info(`Unauthorized access to chat with id ${data.id}`);
      throw notFound();
    }

    return chat;
  });

export const fetchMessages = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const messages = await getMessagesByChatId({ id: data.id });
    const userId = (await useAppSession()).data.id;

    if (!messages) {
      console.info(`Messages for chat with id ${data.id} not found`);
      throw notFound();
    }

    const chatUserId = (await getChatById({ id: data.id }))?.userId;
    if (chatUserId !== userId) {
      console.info(
        `Unauthorized access to messages for chat with id ${data.id}`,
      );
      throw notFound();
    }

    return messages as Array<{
      id: string;
      role: string;
      attachments: Array<{ url: string; name: string; contentType: string }>;
      parts: Array<{ type: string; text: string }>;
      createdAt: Date;
      chatId: string;
    }>;
  });

export const fetchChats = createServerFn({ method: "GET" })
  .validator(
    (data: {
      limit: number;
      startingAfter: string | null;
      endingBefore: string | null;
    }) => data,
  )
  .handler(async ({ data }) => {
    const userId = (await useAppSession()).data.id;

    if (!userId) {
      console.info("User not authenticated");
      throw notFound();
    }

    const chats = await getChatsByUserId({
      id: userId,
      limit: data.limit,
      endingBefore: data.endingBefore,
      startingAfter: data.startingAfter,
    });
    console.info("Fetching chats...");
    return chats;
  });

export const deleteTrailingMessages = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const [message] = await getMessageById({ id: data.id });

    await deleteMessagesByChatIdAfterTimestamp({
      chatId: message.chatId,
      timestamp: message.createdAt,
    });

    return { success: true };
  });

export const saveChatFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; title: string }) => data)
  .handler(async ({ data }) => {
    const userId = (await useAppSession()).data.id;
    if (!userId) {
      console.info("User not authenticated");
      throw notFound();
    }

    const chat = await getChatById({ id: data.id });
    if (chat) {
      console.info(`Chat with id ${data.id} already exists`);
      return chat;
    }

    const newChat = await saveChat({
      id: data.id,
      userId,
      title: data.title,
    });
    if (!newChat) {
      console.info(`Failed to create chat with id ${data.id}`);
      throw notFound();
    }

    return newChat;
  });

export const saveMessagesFn = createServerFn({ method: "POST" })
  .validator((data: { messages: Array<DBMessage> }) => data)
  .handler(async ({ data }) => {
    const userId = (await useAppSession()).data.id;
    if (!userId) {
      console.info("User not authenticated");
      throw notFound();
    }

    const messages = await saveMessages({
      messages: data.messages,
    });
    if (!messages) {
      console.info(`Failed to save messages`);
      return "failed";
    }

    return "success";
  });
