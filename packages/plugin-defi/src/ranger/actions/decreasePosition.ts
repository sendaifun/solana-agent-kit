import { z } from "zod";
import type { Action } from "solana-agent-kit";
import { RANGER_SOR_API_BASE } from "../index";

export const decreasePositionSchema = z.object({
  fee_payer: z.string(),
  symbol: z.string(),
  side: z.enum(["Long", "Short"]),
  size: z.number().positive(),
  collateral: z.number().positive(),
  size_denomination: z.string(),
  collateral_denomination: z.literal("USDC"),
  adjustment_type: z.enum([
    "DecreaseFlash",
    "DecreaseJupiter",
    "DecreaseDrift",
    "DecreaseAdrena",
  ]),
  target_venues: z.array(z.enum(["Jupiter", "Flash", "Drift"])).optional(),
  slippage_bps: z.number().int().optional(),
  priority_fee_micro_lamports: z.number().int().optional(),
  expected_price: z.number().optional(),
});

export type DecreasePositionInput = z.infer<typeof decreasePositionSchema>;

interface DecreasePositionContext {
  apiKey: string;
}

export const decreasePositionAction: Action = {
  name: "DECREASE_POSITION",
  similes: ["reduce position", "decrease position", "partial close perp"],
  description: "Decrease a perp position using the Ranger SOR API.",
  examples: [
    [
      {
        input: {
          fee_payer: "YOUR_PUBLIC_KEY",
          symbol: "SOL",
          side: "Long",
          size: 0.5,
          collateral: 5.0,
          size_denomination: "SOL",
          collateral_denomination: "USDC",
          adjustment_type: "DecreaseFlash",
        },
        output: { message: "...", meta: { venues: [] } },
        explanation: "Decrease a long SOL position via Flash venue.",
      },
    ],
  ],
  schema: decreasePositionSchema,
  handler: async (
    _agent: unknown,
    input: DecreasePositionInput,
    { apiKey }: DecreasePositionContext
  ) => {
    const response = await fetch(
      `${RANGER_SOR_API_BASE}/v1/decrease_position`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(input),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Decrease position request failed: ${error.message}`);
    }
    return response.json();
  },
};
