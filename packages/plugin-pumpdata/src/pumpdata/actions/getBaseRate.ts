import { type Action, type SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { pumpDataResultFields, pumpdataGetBaseRate } from "../tools";

const pumpdataGetBaseRateAction: Action = {
  name: "PUMPDATA_GET_BASE_RATE",
  similes: [
    "pump.fun base rate",
    "how often do pump.fun coins 10x",
    "market cap band odds",
    "pumpdata baserate",
  ],
  description:
    "Costs $0.005 in USDC, paid over x402 from the agent's wallet. For a market cap band (such as 15k-28k) and a window of up to 31 days: how many coins first traded inside the band, the share of them that reached 2x, 5x, 10x and 20x within 3 h, and the median peak. Coins that died are counted. Always quote the band and the window used.",
  examples: [
    [
      {
        input: {
          band: "15k-28k",
          from: "2026-10-16T00:00:00Z",
          to: "2026-10-17T00:00:00Z",
        },
        output: {
          status: "success",
          data: {
            crossed: 2059,
            reached: { "2x": 0.343, "5x": 0.112, "10x": 0.051, "20x": 0.02 },
            median_peak: 1.464,
          },
          paidUsd: 0.005,
        },
        explanation:
          "Of 2,059 coins that crossed $15-28K on Oct 16, 2026, 5.1% reached 10x within 3 h",
      },
    ],
  ],
  schema: z.object({
    band: z
      .string()
      .regex(/^[0-9]+k-[0-9]+k$/)
      .describe(
        "Market cap band in USD, such as 15k-28k; edges snap to 5k, 10k, 15k, 20k, 28k, 40k, 60k, 100k, 250k, 1000k",
      ),
    from: z.string().datetime().describe("Start of the window, ISO 8601"),
    to: z
      .string()
      .datetime()
      .describe("End of the window, ISO 8601, at most 31 days after from"),
    venue: z
      .enum(["any", "curve", "pool"])
      .optional()
      .describe("Where the crossing happened (default any)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const response = await pumpdataGetBaseRate(agent, {
        band: input.band,
        from: input.from,
        to: input.to,
        venue: input.venue,
      });
      return {
        status: "success",
        ...pumpDataResultFields(response),
        message: `pumpdata.fun base rate for ${input.band} from ${input.from} to ${input.to} fetched.`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch pumpdata.fun base rate: ${error.message}`,
      };
    }
  },
};

export default pumpdataGetBaseRateAction;
