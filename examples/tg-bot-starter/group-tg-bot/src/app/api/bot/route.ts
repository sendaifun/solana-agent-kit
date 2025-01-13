export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 60; // can use 300 with vercel premium

import { Bot, webhookCallback } from 'grammy';
import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import { getApps, initializeApp, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { Keypair } from '@solana/web3.js';
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error('TELEGRAM_BOT_TOKEN environment variable not found.');
const bot = new Bot(token);

const checkpointer = PostgresSaver.fromConnString(
  process.env.POSTGRES_LINK!,
);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

async function getOrCreateUserKeyPair(userId: string) {
  const userDocRef = doc(db, 'gusers', userId);
  const userDocSnap = await getDoc(userDocRef);
  if (userDocSnap.exists()) {
    return userDocSnap.data();
  }
  const keypair = Keypair.generate();
  const keypairData = {
    publicKey: keypair.publicKey.toString(),
    privateKey: String(bs58.encode(keypair.secretKey)),
    inProgress: false,
    inGame: false,
  };
  await setDoc(userDocRef, keypairData);
  return keypairData;
}

async function initializeAgent(userId: string, keyPair: any) {
  try {
    const llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.7,
    });

    const solanaKit = new SolanaAgentKit(
      keyPair.privateKey,
      process.env.RPC_URL,
      process.env.OPENAI_API_KEY!
    );

    const tools = createSolanaTools(solanaKit);
    await checkpointer.setup();
    const config = { configurable: { thread_id: userId } };
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: checkpointer,
      messageModifier: `
        Ignore the @ tag to your bot id. 
        You are a helpful Telegram bot agent that can interact onchain using the Solana Agent Kit. You are
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the user by asking them to message you privately.
        If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
      `,
    });
    return { agent, config };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}
// Telegram bot handler
bot.on('message:text', async (ctx) => {
  const userId = ctx.from?.id.toString();
  if (!userId) return;
  const botUsername = `@${ctx.me.username}`;
  if (!(ctx.chat.type === 'private')) {
    if (!(ctx.message.text && ctx.message.text.includes(botUsername)) && !(ctx.message.reply_to_message !== undefined && ctx.message.reply_to_message.from?.username === ctx.me.username)) {
      return;
    }
  }
  const userDocRef = doc(db, 'gusers', userId);
  const userDocSnap = await getDoc(userDocRef);
  if (!userDocSnap.exists() && ctx.chat.type == 'private') {
    const keyPair = await getOrCreateUserKeyPair(userId);
    await ctx.reply(`Looks like you are using the agent first time. You can fund your agent and start using. Your unique Solana wallet is:`);
    await ctx.reply(`${String(keyPair.publicKey)}`);
    await ctx.reply("Your private key is:");
    await ctx.reply(`${String(keyPair.privateKey)}`);
    return;
  }
  else if (userDocSnap.exists() && ctx.chat.type == 'private') {
    const keyPair = await getOrCreateUserKeyPair(userId);
    await ctx.reply("Looks like you already have a wallet. Your public key is:");
    await ctx.reply(`${String(keyPair.publicKey)}`);
    await ctx.reply("Your private key is:");
    await ctx.reply(`${String(keyPair.privateKey)}`);
    return;
  }
  else if (!userDocSnap.exists()) {
    await ctx.reply("Looks like you haven't got a wallet yet. Please start a private chat with me to get your wallet.", { reply_to_message_id: ctx.message.message_id });
    return;
  }
  const keyPair = await getOrCreateUserKeyPair(userId);
  if (keyPair.inProgress) {
    await ctx.reply(`Hold on! I'm still processing...`, { reply_to_message_id: ctx.message.message_id });
    return;
  }
  const { agent, config } = await initializeAgent(userId, keyPair);
  const stream = await agent.stream({ messages: [new HumanMessage(ctx.message.text)] }, config);
  const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 20000));
  try {
    await updateDoc(userDocRef, { inProgress: true });
    for await (const chunk of await Promise.race([stream, timeoutPromise]) as AsyncIterable<{ agent?: any; tools?: any }>) {
      if ("agent" in chunk) {
        if (chunk.agent.messages[0].content) await ctx.reply(String(chunk.agent.messages[0].content), { reply_to_message_id: ctx.message.message_id });
      }
      // Add the below if you want to show direct output from the tools.
      // else if ("tools" in chunk) {
      //   if (chunk.tools.messages[0].content) await ctx.reply(String(chunk.tools.messages[0].content));
      // }
    }
  } catch (error: any) {
    if (error.message === 'Timeout') {
      await ctx.reply("I'm sorry, the operation took too long and timed out. Please try again.", { reply_to_message_id: ctx.message.message_id });
    } else {
      console.error("Error processing stream:", error);
      await ctx.reply("I'm sorry, an error occurred while processing your request.", { reply_to_message_id: ctx.message.message_id });
      await updateDoc(userDocRef, { inProgress: false });
    }
  }
  finally {
    await updateDoc(userDocRef, { inProgress: false });
  }
});

// Export webhook handler
export const POST = async (req: Request) => {
  const headers = new Headers();
  headers.set('x-vercel-background', 'true');
  const handler = webhookCallback(bot, 'std/http');
  return handler(req);
};