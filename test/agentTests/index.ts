import { chooseAgent } from "utils";
import vercelAITests from "./vercel-ai";
import { SolanaAgentKit } from "solana-agent-kit";

export default async function aiTests(agentKit: SolanaAgentKit) {
  const agent = await chooseAgent(["vercel-ai"] as const);

  switch (agent) {
    case "vercel-ai":
      await vercelAITests(agentKit);
      break;
  }
}
