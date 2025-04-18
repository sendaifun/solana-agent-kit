import { z } from "zod";
import type { Action } from "solana-agent-kit";
import { RANGER_DATA_API_BASE } from "../index";

export const getFundingRatesOiWeightedSchema = z.object({});
export type GetFundingRatesOiWeightedInput = z.infer<
  typeof getFundingRatesOiWeightedSchema
>;

interface GetFundingRatesOiWeightedContext {
  apiKey: string;
}

export const getFundingRatesOiWeightedAction: Action = {
  name: "GET_FUNDING_RATES_OI_WEIGHTED",
  similes: [
    "get oi weighted funding rates",
    "fetch open interest weighted funding",
    "oi weighted funding rates",
  ],
  description:
    "Fetch open interest weighted funding rates from the Ranger API.",
  examples: [
    [
      {
        input: {},
        output: { rates: [] },
        explanation: "Get open interest weighted funding rates.",
      },
    ],
  ],
  schema: getFundingRatesOiWeightedSchema,
  handler: async (
    _agent: unknown,
    _input: GetFundingRatesOiWeightedInput,
    { apiKey }: GetFundingRatesOiWeightedContext
  ) => {
    const response = await fetch(
      `${RANGER_DATA_API_BASE}/v1/funding_rates/oi_weighted`,
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
        `Get funding rates oi weighted request failed: ${error.message}`
      );
    }
    return response.json();
  },
};
