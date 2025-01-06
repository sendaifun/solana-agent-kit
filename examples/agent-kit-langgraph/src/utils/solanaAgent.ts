import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";

export const agentKit = new SolanaAgentKit(
  process.env.SOLANA_PRIVATE_KEY!,
  process.env.RPC_URL!,
  process.env.OPENAI_API_KEY!,
);

export const solanaTools = createSolanaTools(agentKit);
