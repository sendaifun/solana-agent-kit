import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { swapchanGetQuote } from "../tools";

export const swapchanQuoteSchema = z.object({
  inputMint: z.string().describe("Mint of the token to sell (SOL: So11111111111111111111111111111111111111112)"),
  outputMint: z
    .string()
    .describe("Token to buy: a Solana mint, or a token address on toChainId for cross-chain"),
  amount: z.number().positive().describe("Amount of inputMint to sell, human-readable (e.g. 0.5)"),
  slippageBps: z.number().int().min(0).max(5000).optional().describe("Max slippage in bps (default 50)"),
  toChainId: z
    .number()
    .optional()
    .describe("Destination chain for cross-chain swaps: 1 Ethereum, 8453 Base, 42161 Arbitrum, 10 Optimism, 137 Polygon, 56 BNB, 43114 Avalanche, 8253038 Bitcoin, 728126428 Tron. Omit for Solana"),
  toAddress: z.string().optional().describe("Recipient on the destination chain (required for cross-chain)"),
});

const swapchanQuoteAction: Action = {
  name: "SWAPCHAN_GET_QUOTE",
  similes: ["best swap price", "compare swap routes", "cross-chain quote", "bridge quote from solana", "swapchan quote"],
  description:
    "Compare Solana swap and Solana-to-other-chain bridge routes across Jupiter, LI.FI, Relay, deBridge, THORChain and more via SwapChan. Returns routes ranked best-first by net output. Read-only.",
  examples: [
    [
      {
        input: { inputMint: "So11111111111111111111111111111111111111112", outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", amount: 1 },
        output: { status: "success", best: "jupiter:...", quotes: [{ provider: "jupiter", outAmount: 185.2 }] },
        explanation: "Best price for 1 SOL to USDC",
      },
    ],
  ],
  schema: swapchanQuoteSchema,
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      return { status: "success", ...(await swapchanGetQuote(agent, input as any)) };
    } catch (error: any) {
      return { status: "error", message: error.message };
    }
  },
};

export default swapchanQuoteAction;
