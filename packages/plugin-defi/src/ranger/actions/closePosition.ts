import { z } from "zod";
import type { Action } from "solana-agent-kit";
import { RANGER_SOR_API_BASE } from "../index";

export const closePositionSchema = z.object({
  fee_payer: z.string(),
  symbol: z.string(),
  side: z.enum(["Long", "Short"]),
  adjustment_type: z.enum([
    "CloseFlash",
    "CloseJupiter",
    "CloseDrift",
    "CloseAdrena",
    "CloseAll",
  ]),
  slippage_bps: z.number().int().optional(),
  priority_fee_micro_lamports: z.number().int().optional(),
  expected_price: z.number().optional(),
});

export type ClosePositionInput = z.infer<typeof closePositionSchema>;

interface ClosePositionContext {
  apiKey: string;
}

export const closePositionAction: Action = {
  name: "CLOSE_POSITION",
  similes: ["close position", "exit trade", "close perp"],
  description: "Close an existing perp position using the Ranger SOR API.",
  examples: [
    [
      {
        input: {
          fee_payer: "YOUR_PUBLIC_KEY",
          symbol: "SOL",
          side: "Long",
          adjustment_type: "CloseFlash",
        },
        output: { message: "...", meta: { venues: [] } },
        explanation: "Close a long SOL position via Flash venue.",
      },
    ],
  ],
  schema: closePositionSchema,
  handler: async (
    _agent: unknown,
    input: ClosePositionInput,
    { apiKey }: ClosePositionContext
  ) => {
    const response = await fetch(`${RANGER_SOR_API_BASE}/v1/close_position`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Close position request failed: ${error.message}`);
    }
    return response.json();
  },
};
