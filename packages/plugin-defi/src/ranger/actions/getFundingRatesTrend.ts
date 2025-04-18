import { z } from "zod";
import type { Action } from "solana-agent-kit";
import { RANGER_DATA_API_BASE } from "../index";

export const getFundingRatesTrendSchema = z.object({
  symbol: z.string(),
  platform: z.string().optional(),
});
export type GetFundingRatesTrendInput = z.infer<
  typeof getFundingRatesTrendSchema
>;

interface GetFundingRatesTrendContext {
  apiKey: string;
}

export const getFundingRatesTrendAction: Action = {
  name: "GET_FUNDING_RATES_TREND",
  similes: [
    "get funding rates trend",
    "fetch funding trend",
    "funding rates history",
  ],
  description: "Fetch funding rates trend from the Ranger API.",
  examples: [
    [
      {
        input: { symbol: "BTC-PERP", platform: "Drift" },
        output: { trend: [] },
        explanation: "Get funding rates trend for BTC-PERP on Drift.",
      },
    ],
  ],
  schema: getFundingRatesTrendSchema,
  handler: async (
    _agent: unknown,
    input: GetFundingRatesTrendInput,
    { apiKey }: GetFundingRatesTrendContext
  ) => {
    const params = new URLSearchParams();
    params.set("symbol", input.symbol);
    if (input.platform) params.set("platform", input.platform);

    const response = await fetch(
      `${RANGER_DATA_API_BASE}/v1/funding_rates/trend?${params.toString()}`,
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
      throw new Error(
        `Get funding rates trend request failed: ${error.message}`
      );
    }
    return response.json();
  },
};
