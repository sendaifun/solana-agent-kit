import { z } from "zod";
import type { Action } from "solana-agent-kit";
import { RANGER_DATA_API_BASE } from "../index";

export const getLiquidationsLargestSchema = z.object({
  granularity: z.string().optional(),
  limit: z.number().int().optional(),
});
export type GetLiquidationsLargestInput = z.infer<
  typeof getLiquidationsLargestSchema
>;

interface GetLiquidationsLargestContext {
  apiKey: string;
}

export const getLiquidationsLargestAction: Action = {
  name: "GET_LIQUIDATIONS_LARGEST",
  similes: [
    "get largest liquidations",
    "fetch largest liquidations",
    "liquidations biggest",
  ],
  description: "Fetch the largest liquidations from the Ranger API.",
  examples: [
    [
      {
        input: { granularity: "1h", limit: 10 },
        output: { liquidations: [] },
        explanation: "Get the 10 largest liquidations with 1h granularity.",
      },
    ],
  ],
  schema: getLiquidationsLargestSchema,
  handler: async (
    _agent: unknown,
    input: GetLiquidationsLargestInput,
    { apiKey }: GetLiquidationsLargestContext
  ) => {
    const params = new URLSearchParams();
    if (input.granularity) params.set("granularity", input.granularity);
    if (input.limit !== undefined) params.set("limit", input.limit.toString());

    const response = await fetch(
      `${RANGER_DATA_API_BASE}/v1/liquidations/largest?${params.toString()}`,
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
        `Get liquidations largest request failed: ${error.message}`
      );
    }
    return response.json();
  },
};
