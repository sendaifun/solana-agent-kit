import { Action } from "solana-agent-kit";
import { z } from "zod";
import { getWealthvilleTopPools } from "../tools";
import { WEALTHVILLE_DISCLAIMER } from "../utils";

const getWealthvilleTopPoolsAction: Action = {
  name: "WEALTHVILLE_GET_TOP_POOLS",
  similes: [
    "best liquidity pools right now",
    "top rated LP pools",
    "where should I LP",
    "highest scored pools on solana",
    "top pools by wealthville score",
  ],
  description:
    "List liquidity pools ranked by composite Wealthville Score (0-100), freshly scored within " +
    "the last 6 hours. Covers Raydium, Orca and Meteora on Solana plus major EVM chains.",
  examples: [
    [
      {
        input: { limit: 3 },
        output: {
          status: "success",
          scores: [
            {
              pool_name: "SOL/USDC",
              protocol: "raydium-clmm",
              verdict: "ENTER",
              wealthville_score: 94,
            },
            {
              pool_name: "SOL/USDC",
              protocol: "meteora-dlmm",
              verdict: "ENTER",
              wealthville_score: 93,
            },
            {
              pool_name: "SOL/USDC",
              protocol: "orca-whirlpool",
              verdict: "ENTER",
              wealthville_score: 92,
            },
          ],
        },
        explanation: "The three highest-scored Solana pools right now.",
      },
    ],
  ],
  schema: z.object({
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("How many pools to return (default 25)"),
    chain: z
      .string()
      .optional()
      .describe(
        '"solana" (default), "evm" for all EVM chains, or one EVM chain name like "base"',
      ),
  }),
  handler: async (agent, input: Record<string, any>) => {
    try {
      const data = await getWealthvilleTopPools(
        agent,
        input.limit ?? 25,
        input.chain ?? "solana",
      );
      return { status: "success", ...data, disclaimer: WEALTHVILLE_DISCLAIMER };
    } catch (error: any) {
      return { status: "error", message: error.message };
    }
  },
};

export default getWealthvilleTopPoolsAction;
