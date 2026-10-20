import { Action } from "solana-agent-kit";
import { z } from "zod";
import { dexraSwapPreflight } from "../tools";

const dexraSwapPreflightAction: Action = {
  name: "DEXRA_SWAP_PREFLIGHT",
  description:
    "Check a Solana swap before sending it: price impact on the best route, sandwich share on the pool, Token-2022 transfer fees, hooks and permanent delegate, and mint and freeze authority. Returns a verdict (ok, caution, avoid) with reasons.",
  similes: [
    "is this swap safe",
    "check swap before executing",
    "price impact",
    "sandwich risk",
  ],
  examples: [
    [
      {
        input: {
          mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
          side: "buy",
          amount: 1,
        },
        output: {
          status: "success",
          result: { verdict: "ok", assessment: "ok", reasons: [] },
        },
        explanation: "Check buying BONK for 1 SOL",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().min(32).describe("Token to buy or sell"),
    side: z.enum(["buy", "sell"]),
    amount: z
      .number()
      .positive()
      .describe(
        "Quote units for a buy (SOL by default), token units for a sell",
      ),
    quote: z.string().min(32).optional().describe("Quote mint, SOL by default"),
  }),
  handler: async (agent, input) => {
    try {
      const result = await dexraSwapPreflight(
        agent,
        input.mint,
        input.side,
        input.amount,
        input.quote,
      );
      return { status: "success", result };
    } catch (error: any) {
      return { status: "error", message: error.message };
    }
  },
};

export default dexraSwapPreflightAction;
