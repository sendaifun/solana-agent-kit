import { z } from "zod";
import type { Action } from "solana-agent-kit";
import { RANGER_DATA_API_BASE } from "../index";

export const getLiquidationsHeatmapSchema = z.object({
  granularity: z.string().optional(),
});
export type GetLiquidationsHeatmapInput = z.infer<
  typeof getLiquidationsHeatmapSchema
>;

interface GetLiquidationsHeatmapContext {
  apiKey: string;
}

export const getLiquidationsHeatmapAction: Action = {
  name: "GET_LIQUIDATIONS_HEATMAP",
  similes: [
    "get liquidations heatmap",
    "fetch liquidation heatmap",
    "liquidations by time",
  ],
  description: "Fetch liquidations heatmap data from the Ranger API.",
  examples: [
    [
      {
        input: { granularity: "1h" },
        output: { heatmap: [] },
        explanation: "Get liquidations heatmap with 1h granularity.",
      },
    ],
  ],
  schema: getLiquidationsHeatmapSchema,
  handler: async (
    _agent: unknown,
    input: GetLiquidationsHeatmapInput,
    { apiKey }: GetLiquidationsHeatmapContext
  ) => {
    const params = new URLSearchParams();
    if (input.granularity) params.set("granularity", input.granularity);

    const response = await fetch(
      `${RANGER_DATA_API_BASE}/v1/liquidations/heatmap?${params.toString()}`,
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
        `Get liquidations heatmap request failed: ${error.message}`
      );
    }
    return response.json();
  },
};
