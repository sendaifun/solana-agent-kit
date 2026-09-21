import { Action } from "solana-agent-kit";
import { SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import {
  getWalletEnhancedTransactions,
  summarizeWalletIntelligence,
} from "../tools";

const getWalletIntelligenceAction: Action = {
  name: "GET_WALLET_INTELLIGENCE",
  similes: [
    "analyze wallet",
    "track wallet activity",
    "smart money wallet",
    "wallet on-chain history",
    "whale wallet analysis",
  ],
  description:
    "Analyze a Solana wallet's recent on-chain activity using the Helius Enhanced Transactions API. Returns DEX swaps, top venues, and trading-behavior signals for an AI agent.",
  examples: [
    [
      {
        input: {
          walletAddress: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
          limit: 20,
        },
        output: {
          status: "success",
          intelligence: {
            walletAddress: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
            transactionsAnalyzed: 20,
            totalSwapCount: 5,
            topProtocols: ["JUPITER"],
            recentSwaps: [],
            lastActiveAt: 1787933918,
            signals: [
              "Executed 5 DEX swap(s) across 20 recent transaction(s).",
              "Top venue(s): JUPITER.",
            ],
          },
          message:
            "Analyzed 20 transactions for wallet JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
        },
        explanation:
          "Decode a wallet's recent on-chain behavior into structured intelligence so an AI agent can reason about it without parsing raw RPC data.",
      },
    ],
  ],
  schema: z.object({
    walletAddress: z
      .string()
      .min(1)
      .describe("The Solana wallet address to analyze"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Number of recent transactions to analyze (default 20)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const limit = typeof input.limit === "number" ? input.limit : 20;
      const transactions = await getWalletEnhancedTransactions(
        agent,
        input.walletAddress,
        limit,
      );
      const intelligence = summarizeWalletIntelligence(
        input.walletAddress,
        transactions,
      );
      return {
        status: "success",
        intelligence,
        message: `Analyzed ${transactions.length} transactions for wallet ${input.walletAddress}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to analyze wallet: ${error.message}`,
      };
    }
  },
};

export default getWalletIntelligenceAction;
