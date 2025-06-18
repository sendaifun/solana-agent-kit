import { Bot } from "grammy";
import { createVercelAITools, SolanaAgentKit } from "solana-agent-kit";
import { PrivyClient } from "@privy-io/server-auth";
import { tryAsync } from "try.rs";
import { db } from "./db";
import { messagesTable, usersTable } from "./db/schema";
import { PublicKey } from "@solana/web3.js";
import GodMode from "@solana-agent-kit/plugin-god-mode";
import { eq } from "drizzle-orm";
import { generateText, type Message } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

console.log("Privy Solana Agent Kit Agent Bot starting.");

// Load env variables and instantiate clients
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN as string);
const privy = new PrivyClient(
  process.env.PRIVY_APP_ID as string,
  process.env.PRIVY_APP_SECRET as string
);
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

// Handle start command
bot.command("start", async (ctx) => {
  ctx.replyWithChatAction("typing");
  const userId = ctx.from?.id;

  if (!userId) {
    ctx.reply("Unable to identify your user ID. Please try again later.");
    return;
  }

  // Check if user already exists
  const userRes = await tryAsync(() =>
    db.select().from(usersTable).where(eq(usersTable.id, userId))
  );

  if (userRes.error) {
    console.error("Failed to fetch user from database:", userRes.error);
    ctx.reply("Failed to fetch your wallet. Please try again later.");
    return;
  }

  const user = userRes.value[0];

  if (user) {
    ctx.reply(`Welcome back\\! Your wallet address is: \`${user.address}\``, {
      parse_mode: "MarkdownV2",
    });
    return;
  }

  ctx.reply(
    "Welcome to the Privy Solana Agent Kit Bot! Please wait a moment while I create your wallet."
  );

  // Create new wallet
  const walletResult = await tryAsync(() =>
    privy.walletApi.createWallet({ chainType: "solana" })
  );

  if (walletResult.error) {
    console.error("Failed to create wallet:", walletResult.error.message);
    ctx.reply("Failed to create wallet. Please try again later.");
    return;
  }

  const wallet = walletResult.value;

  // Save user to database
  const dbResult = await tryAsync(() =>
    db.insert(usersTable).values({
      id: userId,
      address: wallet.address,
      walletId: wallet.id,
    })
  );

  if (dbResult.error) {
    console.error("Failed to save user to database:", dbResult.error.message);
    ctx.reply("Failed to save your wallet. Please try again later.");
    return;
  }

  ctx.reply(
    `Your wallet has been created successfully\\! Your address is: \`${wallet.address}\``,
    { parse_mode: "MarkdownV2" }
  );
});

// Handle /help command
bot.command("help", (ctx) => {
  ctx.replyWithChatAction("typing");
  const message = `Welcome to the Solana Agent Kit Bot! Here are some commands you can use:
    - /start: Create a new wallet or access your existing wallet.
    - /help: Show this help message.
    - /delete: Delete your wallet and all associated data. (This action is irreversible!)`;
  ctx.reply(message, { parse_mode: "Markdown" });
});

// Handle /delete command
bot.command("delete", async (ctx) => {
  ctx.replyWithChatAction("typing");
  const userId = ctx.from?.id;

  if (!userId) {
    ctx.reply("Unable to identify your user ID. Please try again later.");
    return;
  }

  // Check if user exists
  const userRes = await tryAsync(() =>
    db.select().from(usersTable).where(eq(usersTable.id, userId))
  );

  if (userRes.error) {
    console.error("Failed to fetch user from database:", userRes.error);
    ctx.reply("Failed to fetch your wallet. Please try again later.");
    return;
  }

  const user = userRes.value[0];

  if (!user) {
    ctx.reply("You don't have a wallet to delete. Please run /start first.");
    return;
  }

  // Delete user from database
  const deleteRes = await tryAsync(() =>
    db.delete(usersTable).where(eq(usersTable.id, userId))
  );

  if (deleteRes.error) {
    console.error("Failed to delete user from database:", deleteRes.error);
    ctx.reply("Failed to delete your wallet. Please try again later.");
    return;
  }

  ctx.reply("Your wallet has been deleted successfully. All data is lost.");
});

// Handle messages
bot.on("message:text", async (ctx) => {
  const typingMessage = await ctx.reply("_Typing\\.\\.\\._", {
    parse_mode: "MarkdownV2",
  });
  const text = ctx.message.text;
  const userId = ctx.from?.id;
  const messageId = `${ctx.chatId}-${ctx.message.message_id}`;
  const chatId = ctx.chatId;

  const userRes = await tryAsync(() =>
    db.select().from(usersTable).where(eq(usersTable.id, userId))
  );

  if (userRes.error) {
    console.error("Failed to fetch user from database:", userRes.error);
    ctx.deleteMessages([typingMessage.message_id]);
    ctx.reply("Failed to fetch your wallet. Please run /start again.");
    return;
  }

  const user = userRes.value[0];

  if (!user) {
    ctx.deleteMessages([typingMessage.message_id]);
    ctx.reply("Please run /start to create your wallet first.");
    return;
  }

  if (!text || text.trim() === "") {
    ctx.deleteMessages([typingMessage.message_id]);
    ctx.reply("Please send a valid message.");
    return;
  }

  const agentKitRes = await tryAsync(() => initAgentKit(user.walletId));
  if (agentKitRes.error) {
    console.error("Failed to initialize agent kit:", agentKitRes.error.message);
    ctx.deleteMessages([typingMessage.message_id]);
    ctx.reply(
      "Failed to initialize your wallet. Please try resending your message or running /start."
    );
    return;
  }

  const agentKit = agentKitRes.value;
  const messagesRes = await tryAsync(() =>
    db.select().from(messagesTable).where(eq(messagesTable.chatId, chatId))
  );

  if (messagesRes.error) {
    console.error(
      "Failed to fetch messages from database:",
      messagesRes.error.message
    );
    ctx.deleteMessages([typingMessage.message_id]);
    ctx.reply("Failed to fetch previous messages. Please try again later.");
    return;
  }

  const userMessage: Message = {
    content: text,
    id: messageId,
    role: "user",
    createdAt: new Date(),
  };
  const messages: Message[] = messagesRes.value.map((v) => ({
    content: v.text,
    id: v.id,
    role: v.role === "user" ? "user" : "assistant",
    createdAt: new Date(v.createdAt * 1000),
  }));
  messages.push(userMessage);

  const response = await tryAsync(() =>
    generateText({
      model: openai("gpt-4o-mini"),
      messages,
      tools: createVercelAITools(agentKit, agentKit.actions),
      maxSteps: 5,
      system:
        "You are a helpful assistant that can interact with the Solana blockchain. You can perform actions like sending transactions, swapping tokens and more. You answer questions in a concise manner and if you're unsure, you ask for clarification. When asked to perform calculations, you provide the result in a single line without any additional text.",
      temperature: 0.7,
    })
  );

  if (response.error) {
    console.error("Error generating response:", response.error.message);
    ctx.deleteMessages([typingMessage.message_id]);
    ctx.reply("Failed to generate a response. Please try again later.");
    return;
  }

  const generatedText = response.value.text;
  const newMessage: Message = {
    content: generatedText,
    id: messageId + 1,
    role: "assistant",
    createdAt: new Date(),
  };

  const insertRes = await tryAsync(() =>
    db.insert(messagesTable).values([
      {
        id: userMessage.id,
        text: userMessage.content,
        createdAt: Math.floor(userMessage.createdAt!.getTime() / 1000),
        chatId,
        role: "user",
      },
      {
        id: newMessage.id,
        text: newMessage.content,
        createdAt: Math.floor(Date.now() / 1000),
        chatId,
        role: newMessage.role === "user" ? "user" : "assistant",
      },
    ])
  );

  if (insertRes.error) {
    console.error(
      "Failed to save message to database:",
      insertRes.error.message
    );
    ctx.deleteMessages([typingMessage.message_id]);
    ctx.reply("Failed to save the response. Please try again later.");
    return;
  }

  ctx.deleteMessages([typingMessage.message_id]);
  ctx.reply(generatedText, { parse_mode: "Markdown" });
  return;
});

bot.start();
console.log("Bot successfully started.");

export async function initAgentKit(walletId: string) {
  const wallet = await privy.walletApi.getWallet({ id: walletId });

  const agentKit = new SolanaAgentKit(
    {
      publicKey: new PublicKey(wallet.address),
      sendTransaction: async () => {
        return "";
      },
      signMessage: async (message) => {
        return (
          await privy.walletApi.solana.signMessage({
            address: wallet.address,
            walletId: wallet.id,
            chainType: "solana",
            message,
          })
        ).signature;
      },
      signAllTransactions: async (txs) => {
        const signedTxs = await Promise.all(
          txs.map(async (tx) => {
            const { signedTransaction } =
              await privy.walletApi.solana.signTransaction({
                address: wallet.address,
                walletId: wallet.id,
                chainType: "solana",
                transaction: tx,
              });

            return {
              ...tx,
              signatures: [signedTransaction],
            };
          })
        );

        return signedTxs;
      },
      // @ts-expect-error - Unnecessary type mismatch
      signTransaction: async (tx) => {
        const { signedTransaction } =
          await privy.walletApi.solana.signTransaction({
            address: wallet.address,
            walletId: wallet.id,
            chainType: "solana",
            transaction: tx,
          });

        return signedTransaction;
      },
      signAndSendTransaction: async (tx) => {
        const { hash } = await privy.walletApi.solana.signAndSendTransaction({
          address: wallet.address,
          caip2: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
          chainType: "solana",
          walletId: wallet.id,
          transaction: tx,
        });

        return { signature: hash };
      },
    },
    process.env.RPC_URL as string,
    {}
  ).use(GodMode);

  return agentKit;
}
