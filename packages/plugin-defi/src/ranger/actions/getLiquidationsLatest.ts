import { z } from "zod";
import type { Action } from "solana-agent-kit";
import { RANGER_DATA_API_BASE } from "../index";

export const getLiquidationsLatestSchema = z.object({});
export type GetLiquidationsLatestInput = z.infer<
  typeof getLiquidationsLatestSchema
>;

interface GetLiquidationsLatestContext {
  apiKey: string;
}

export const getLiquidationsLatestAction: Action = {
  name: "GET_LIQUIDATIONS_LATEST",
  similes: [
    "get latest liquidations",
    "fetch liquidations",
    "liquidations latest",
  ],
  description: "Fetch the latest liquidations from the Ranger API.",
  examples: [
    [
      {
        input: {},
        output: { liquidations: [] },
        explanation: "Get the latest liquidations.",
      },
    ],
  ],
  schema: getLiquidationsLatestSchema,
  handler: async (
    _agent: unknown,
    _input: GetLiquidationsLatestInput,
    { apiKey }: GetLiquidationsLatestContext
  ) => {
    const response = await fetch(
      `${RANGER_DATA_API_BASE}/v1/liquidations/latest`,
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
        `Get liquidations latest request failed: ${error.message}`
      );
    }
    return response.json();
  },
};
