import { Action } from "solana-agent-kit";
import { z } from "zod";
import { madeonsol_kol_leaderboard } from "../tools";

const madeonsolKolLeaderboardAction: Action = {
  name: "MADEONSOL_KOL_LEADERBOARD_ACTION",
  similes: [
    "kol leaderboard",
    "best performing kols",
    "top kol traders",
    "kol rankings",
    "who are the best solana kols",
  ],
  description:
    "Get the top-performing Solana KOL traders ranked by PnL via MadeOnSol. Shows win rate, total volume, and realized profit for each tracked KOL wallet.",
  examples: [
    [
      {
        input: { period: "7d", limit: 10 },
        output: {
          status: "success",
          result: {
            leaderboard: [
              {
                kol: "ansem",
                pnl_usd: 120000,
                win_rate: 0.72,
                trade_count: 45,
              },
            ],
          },
        },
        explanation: "Get the top 10 KOLs by PnL over the last 7 days",
      },
    ],
  ],
  schema: z.object({
    period: z
      .string()
      .default("7d")
      .describe("Time period (e.g. 24h, 7d, 30d)"),
    limit: z
      .number()
      .min(1)
      .max(100)
      .default(10)
      .describe("Number of KOLs to return"),
  }),
  handler: async (agent, input) => {
    try {
      const data = await madeonsol_kol_leaderboard(agent, input);
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

export default madeonsolKolLeaderboardAction;
