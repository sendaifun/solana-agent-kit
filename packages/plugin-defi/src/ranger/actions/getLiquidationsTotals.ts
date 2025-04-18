import { z } from "zod";
import type { Action } from "solana-agent-kit";
import { RANGER_DATA_API_BASE } from "../index";

export const getLiquidationsTotalsSchema = z.object({});
export type GetLiquidationsTotalsInput = z.infer<
  typeof getLiquidationsTotalsSchema
>;

interface GetLiquidationsTotalsContext {
  apiKey: string;
}

export const getLiquidationsTotalsAction: Action = {
  name: "GET_LIQUIDATIONS_TOTALS",
  similes: [
    "get liquidations totals",
    "fetch liquidation totals",
    "liquidations summary",
  ],
  description: "Fetch the total liquidations from the Ranger API.",
  examples: [
    [
      {
        input: {},
        output: { totals: [] },
        explanation: "Get the total liquidations.",
      },
    ],
  ],
  schema: getLiquidationsTotalsSchema,
  handler: async (
    _agent: unknown,
    _input: GetLiquidationsTotalsInput,
    { apiKey }: GetLiquidationsTotalsContext
  ) => {
    const response = await fetch(
      `${RANGER_DATA_API_BASE}/v1/liquidations/totals`,
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
        `Get liquidations totals request failed: ${error.message}`
      );
    }
    return response.json();
  },
};
