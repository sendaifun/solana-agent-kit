import type { SolanaAgentKit } from "solana-agent-kit";
import { chooseAgent } from "../utils";
import langchainAITests from "./langchain";
import vercelAITests from "./vercel-ai";
import openAITests from "./openai";

export default async function aiTests(agentKit: SolanaAgentKit) {
  const agent = await chooseAgent([
    "vercel-ai",
    "langchain",
    "openai",
  ] as const);

  switch (agent) {
    case "vercel-ai":
      await vercelAITests(agentKit);
      break;
    case "langchain":
      await langchainAITests(agentKit);
      break;
    case "openai":
      await openAITests(agentKit);
      break;
  }
}
