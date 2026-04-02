import { Action } from "solana-agent-kit";
import { z } from "zod";
import { madeonsol_kol_feed } from "../tools";

const madeonsolKolFeedAction: Action = {
  name: "MADEONSOL_KOL_FEED_ACTION",
  similes: [
    "kol trades",
    "what are kols buying",
    "kol feed",
    "smart money trades",
    "kol wallet activity",
  ],
  description:
    "Get real-time Solana KOL (Key Opinion Leader) trades from 946 tracked wallets via MadeOnSol. Returns recent buys and sells with token, amount, and KOL identity.",
  examples: [
    [
      {
        input: { limit: 10, action: "buy" },
        output: {
          status: "success",
          result: {
            trades: [
              {
                kol: "ansem",
                action: "buy",
                token: "BONK",
                amount_usd: 50000,
              },
            ],
          },
        },
        explanation: "Fetch the 10 most recent KOL buy trades",
      },
    ],
  ],
  schema: z.object({
    limit: z
      .number()
      .min(1)
      .max(100)
      .default(10)
      .describe("Number of trades to return"),
    action: z
      .enum(["buy", "sell"])
      .optional()
      .describe("Filter by trade type"),
    kol: z.string().optional().describe("Filter by KOL name"),
  }),
  handler: async (agent, input) => {
    try {
      const data = await madeonsol_kol_feed(agent, input);
      return { status: "success", result: data };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error is not a property of unknown
        message: e.message,
      };
    }
  },
};

export default madeonsolKolFeedAction;
