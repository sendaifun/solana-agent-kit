import { Action } from "solana-agent-kit";
import { z } from "zod";
import { getWealthvillePoolScore } from "../tools";
import { WEALTHVILLE_DISCLAIMER } from "../utils";

const getWealthvillePoolScoreAction: Action = {
  name: "WEALTHVILLE_GET_POOL_SCORE",
  similes: [
    "check pool score",
    "is this pool safe to LP",
    "pool quality rating",
    "should I provide liquidity to this pool",
    "wealthville verdict for pool",
  ],
  description:
    "Get the Wealthville verdict (ENTER/HOLD/EXIT/AVOID) and 0-100 action scores for one liquidity pool. " +
    "Useful before opening or recommending any LP position. Accepts a Solana base58 pool address, " +
    "an EVM 0x address, or a DefiLlama pool UUID. Scores are backed by a public, miss-inclusive " +
    "track record at wealthville.net/track-record.",
  examples: [
    [
      {
        input: { poolAddress: "Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE" },
        output: {
          status: "success",
          pool_name: "SOL/USDC",
          protocol: "orca-whirlpool",
          verdict: "ENTER",
          wealthville_score: 92,
          enter_score: 91,
          hold_score: 93,
          exit_score: 6,
        },
        explanation:
          "SOL/USDC on Orca is rated ENTER with a composite Wealthville Score of 92/100.",
      },
    ],
  ],
  schema: z.object({
    poolAddress: z
      .string()
      .min(8)
      .describe("Pool address: Solana base58, EVM 0x, or DefiLlama UUID"),
  }),
  handler: async (agent, input: Record<string, any>) => {
    try {
      const data = await getWealthvillePoolScore(
        agent,
        String(input.poolAddress),
      );
      return { status: "success", ...data, disclaimer: WEALTHVILLE_DISCLAIMER };
    } catch (error: any) {
      return { status: "error", message: error.message };
    }
  },
};

export default getWealthvillePoolScoreAction;
