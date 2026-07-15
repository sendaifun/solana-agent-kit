import { Action } from "solana-agent-kit";
import { z } from "zod";
import { getWealthvilleTrackRecord } from "../tools";
import { WEALTHVILLE_DISCLAIMER } from "../utils";

const getWealthvilleTrackRecordAction: Action = {
  name: "WEALTHVILLE_GET_TRACK_RECORD",
  similes: [
    "wealthville score accuracy",
    "can I trust these pool scores",
    "LP signal hit rate",
    "how has the ENTER signal performed",
  ],
  description:
    "Get Wealthville's live signal track record: per-action hit rates and IL-adjusted 7-day PnL, " +
    "misses included. Every published signal is immutable at publish time and outcome-labeled " +
    "after the fact, so the numbers cannot be retro-edited.",
  examples: [
    [
      {
        input: { days: 30 },
        output: {
          status: "success",
          window_days: 30,
          by_action: [
            {
              final_action: "ENTER",
              resolved: 3819,
              hit_rate: "0.599",
              avg_pnl_7d: "0.0197",
            },
            { final_action: "EXIT", resolved: 4039, hit_rate: "0.801" },
          ],
        },
        explanation:
          "Aggregated outcomes of every published signal over the last 30 days, misses included.",
      },
    ],
  ],
  schema: z.object({
    days: z
      .number()
      .int()
      .min(7)
      .max(90)
      .optional()
      .describe("Window in days (default 30)"),
  }),
  handler: async (agent, input: Record<string, any>) => {
    try {
      const data = await getWealthvilleTrackRecord(agent, input.days ?? 30);
      return { status: "success", ...data, disclaimer: WEALTHVILLE_DISCLAIMER };
    } catch (error: any) {
      return { status: "error", message: error.message };
    }
  },
};

export default getWealthvilleTrackRecordAction;
