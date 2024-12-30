export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 300;

import { Bot, webhookCallback } from 'grammy';
import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error('TELEGRAM_BOT_TOKEN environment variable not found.');
const bot = new Bot(token);


async function initializeAgent(userId: string) {
  try {
    const llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.7,
    });

    const solanaKit = new SolanaAgentKit(
      process.env.SOLANA_PRIVATE_KEY!,
      process.env.RPC_URL,
      process.env.OPENAI_API_KEY!
    );

    const tools = createSolanaTools(solanaKit);
    const memory = new MemorySaver();
    const config = { configurable: { thread_id: userId } };
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are a helpful agent that can interact onchain using the Solana Agent Kit. You are
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the
        faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
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
bot.on('message:text', async (ctx:any) => {
  const userId = ctx.from?.id.toString();
  if (!userId) return;
  const {agent, config} = await initializeAgent(userId);
  const stream = await agent.stream({ messages: [new HumanMessage(ctx.message.text)] }, config);
  const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 20000));
  try {
    for await (const chunk of await Promise.race([stream, timeoutPromise]) as AsyncIterable<{ agent?: any; tools?: any }>) {
      if ("agent" in chunk) {
        if (chunk.agent.messages[0].content) await ctx.reply(String(chunk.agent.messages[0].content));
      } 
    }
  } catch (error: any) {
    if (error.message === 'Timeout') {
      await ctx.reply("I'm sorry, the operation took too long and timed out. Please try again.");
    } else {
      console.error("Error processing stream:", error);
      await ctx.reply("I'm sorry, an error occurred while processing your request.");
    }
  }
});

// Export webhook handler
export const POST = async (req: Request) => {
  // Mark the function as a background function for Vercel
  const headers = new Headers();
  headers.set('x-vercel-background', 'true');

  const handler = webhookCallback(bot, 'std/http'); // Use the correct callback

  // Handle the incoming webhook request
  return handler(req);
};