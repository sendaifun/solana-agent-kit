import { SolanaAgentKit, type BaseWallet } from "solana-agent-kit";


// Create the Solana Agent
export let solanaAgent = new SolanaAgentKit(
  {} as BaseWallet, // Temporary wallet, will be replaced
  process.env.NEXT_PUBLIC_RPC_URL as string,
  {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY as string || "",
  }
);