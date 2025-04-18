import { z } from "zod";
import type { Action } from "solana-agent-kit";
import { RANGER_DATA_API_BASE } from "../index";

export const getLiquidationsCapitulationSchema = z.object({
  granularity: z.string().optional(),
  threshold: z.number().optional(),
});
export type GetLiquidationsCapitulationInput = z.infer<
  typeof getLiquidationsCapitulationSchema
>;

interface GetLiquidationsCapitulationContext {
  apiKey: string;
}

export const getLiquidationsCapitulationAction: Action = {
  name: "GET_LIQUIDATIONS_CAPITULATION",
  similes: [
    "get liquidations capitulation",
    "fetch liquidation capitulation",
    "liquidations threshold",
  ],
  description: "Fetch liquidations capitulation data from the Ranger API.",
  examples: [
    [
      {
        input: { granularity: "1h", threshold: 10000 },
        output: { data: [] },
        explanation:
          "Get liquidations capitulation with 1h granularity and threshold 10000.",
      },
    ],
  ],
  schema: getLiquidationsCapitulationSchema,
  handler: async (
    _agent: unknown,
    input: GetLiquidationsCapitulationInput,
    { apiKey }: GetLiquidationsCapitulationContext
  ) => {
    const params = new URLSearchParams();
    if (input.granularity) params.set("granularity", input.granularity);
    if (input.threshold !== undefined)
      params.set("threshold", input.threshold.toString());

    const response = await fetch(
      `${RANGER_DATA_API_BASE}/v1/liquidations/capitulation?${params.toString()}`,
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
        `Get liquidations capitulation request failed: ${error.message}`
      );
    }
    return response.json();
  },
};
