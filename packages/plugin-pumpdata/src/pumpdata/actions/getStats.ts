import { type Action, type SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { pumpDataResultFields, pumpdataGetStats } from "../tools";

const pumpdataGetStatsAction: Action = {
  name: "PUMPDATA_GET_STATS",
  similes: [
    "pump.fun stats yesterday",
    "pump.fun daily summary",
    "how many coins launched on pump.fun",
    "pump.fun volume yesterday",
    "pumpdata stats",
  ],
  description:
    "Free. One UTC day on pump.fun from pumpdata.fun (yesterday by default): coins launched and graduated, SOL and USD volume, trades and traders, the top coins by peak market cap and by volume, the deployers whose coins did best, and launches per hour. Quote `summary`; never quote a number listed in `checks`.",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          summary:
            "On Mon, Oct 19, 2026 (UTC), 51,283 coins launched on pump.fun and 1,022 graduated (1.99%); 6,785,580 SOL ($711.0M) traded.",
          data: { day: "2026-10-19", totals: { launched: 51283 } },
        },
        explanation: "Yesterday's pump.fun numbers, free",
      },
      {
        input: { day: "2026-10-16" },
        output: {
          status: "success",
          data: { day: "2026-10-16" },
        },
        explanation: "The same numbers for a past UTC day",
      },
    ],
  ],
  schema: z.object({
    day: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("A past UTC day as YYYY-MM-DD; omit for yesterday"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const response = await pumpdataGetStats(agent, input.day);
      return {
        status: "success",
        ...pumpDataResultFields(response),
        message: "pumpdata.fun daily stats fetched (free call).",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch pumpdata.fun stats: ${error.message}`,
      };
    }
  },
};

export default pumpdataGetStatsAction;
