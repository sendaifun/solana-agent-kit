import { SolanaAgentKit, createOpenAITools } from "solana-agent-kit";
import { OpenAI } from "openai";
import {
  setDefaultOpenAIClient,
  run,
  Agent,
  AgentInputItem,
} from "@openai/agents";
import { question } from "../utils";

export default async function (agent: SolanaAgentKit) {
  const tools = createOpenAITools(agent, agent.actions);
  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY as string,
  });
  // @ts-expect-error false type mismatch
  setDefaultOpenAIClient(openaiClient);
  const openAIAgent = new Agent({
    name: "Solana agent kit agent",
    tools,
    instructions:
      "You are a helpful agent that can interact onchain using the Solana Agent Kit. You are empowered to interact onchain using your tools. If you ever need funds, you can request them from the faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you can't do with your currently available tools, you must say so, and encourage them to implement it themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.",
  });
  let messages: AgentInputItem[] = [];

  try {
    while (true) {
      const prompt = await question("\nYou: ");

      if (prompt === "exit") {
        break;
      }

      messages.push({
        content: prompt,
        role: "user",
      });

      const response = await run(openAIAgent, messages);

      console.log("Agent:", response.finalOutput);
      messages = response.history;
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error("Error:", e.message);
    }
    process.exit(1);
  }
}
