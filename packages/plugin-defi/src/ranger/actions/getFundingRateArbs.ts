import { z } from "zod";
import type { Action } from "solana-agent-kit";
import { RANGER_DATA_API_BASE } from "../index";

export const getFundingRateArbsSchema = z.object({
  min_diff: z.number().optional(),
});
export type GetFundingRateArbsInput = z.infer<typeof getFundingRateArbsSchema>;

interface GetFundingRateArbsContext {
  apiKey: string;
}

export const getFundingRateArbsAction: Action = {
  name: "GET_FUNDING_RATE_ARBS",
  similes: [
    "get funding rate arbs",
    "fetch funding arbitrage",
    "funding rate opportunities",
  ],
  description:
    "Fetch funding rate arbitrage opportunities from the Ranger API.",
  examples: [
    [
      {
        input: { min_diff: 0.01 },
        output: { arbs: [] },
        explanation:
          "Get funding rate arbitrage opportunities with minimum difference 0.01.",
      },
    ],
  ],
  schema: getFundingRateArbsSchema,
  handler: async (
    _agent: unknown,
    input: GetFundingRateArbsInput,
    { apiKey }: GetFundingRateArbsContext
  ) => {
    const params = new URLSearchParams();
    if (input.min_diff !== undefined)
      params.set("min_diff", input.min_diff.toString());

    const response = await fetch(
      `${RANGER_DATA_API_BASE}/v1/funding_rates/arbs?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Get funding rate arbs request failed: ${error.message}`);
    }
    return response.json();
  },
};
