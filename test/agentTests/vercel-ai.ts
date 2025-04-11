import { randomUUID } from "node:crypto";
import { createOpenAI } from "@ai-sdk/openai";
import { type Message, streamText } from "ai";
import { createVercelAITools } from "solana-agent-kit";
import type { SolanaAgentKit } from "solana-agent-kit";
import { question, rl } from "../utils";

export default async function (agent: SolanaAgentKit) {
  const tools = createVercelAITools(agent, agent.actions);
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY as string,
  });
  const messages: Message[] = [];

  try {
    while (true) {
      const prompt = await question("\nYou: ");

      if (prompt === "exit") {
        break;
      }

      messages.push({
        content: prompt,
        id: randomUUID(),
        role: "user",
      });

      const response = streamText({
        // @ts-expect-error false type mismatch
        model: openai("gpt-4o"),
        tools,
        messages,
        system: `You are a helpful agent that can interact onchain using the Solana Agent Kit. You are
                empowered to interact onchain using your tools. If you ever need funds, you can request them from the
                faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
                (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
                can't do with your currently available tools, you must say so, and encourage them to implement it
                themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be
                concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.`,
        maxSteps: 5,
      });

      process.stdout.write("Agent: ");
      for await (const textPart of response.textStream) {
        process.stdout.write(textPart);
      }
      console.log();

      messages.push({
        content: await response.text,
        id: randomUUID(),
        role: "assistant",
      });
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error("Error:", e.message);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}
