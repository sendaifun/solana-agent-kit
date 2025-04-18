import { z } from "zod";
import type { Action } from "solana-agent-kit";
import { RANGER_SOR_API_BASE } from "../index";

export const depositCollateralSchema = z.object({
  fee_payer: z.string(),
  symbol: z.string(),
  side: z.enum(["Long", "Short"]),
  collateral: z.number().positive(),
  collateral_denomination: z.literal("USDC"),
  adjustment_type: z.enum([
    "DepositCollateralFlash",
    "DepositCollateralJupiter",
    "DepositCollateralDrift",
  ]),
});

export type DepositCollateralInput = z.infer<typeof depositCollateralSchema>;

interface DepositCollateralContext {
  apiKey: string;
}

export const depositCollateralAction: Action = {
  name: "DEPOSIT_COLLATERAL",
  similes: ["deposit collateral", "add margin", "add funds"],
  description:
    "Deposit collateral to a perp position using the Ranger SOR API.",
  examples: [
    [
      {
        input: {
          fee_payer: "YOUR_PUBLIC_KEY",
          symbol: "SOL",
          side: "Long",
          collateral: 100.0,
          collateral_denomination: "USDC",
          adjustment_type: "DepositCollateralFlash",
        },
        output: { message: "...", meta: { venues: [] } },
        explanation:
          "Deposit 100 USDC collateral to a long SOL position via Flash.",
      },
    ],
  ],
  schema: depositCollateralSchema,
  handler: async (
    _agent: unknown,
    input: DepositCollateralInput,
    { apiKey }: DepositCollateralContext
  ) => {
    const response = await fetch(
      `${RANGER_SOR_API_BASE}/v1/deposit_collateral`,
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
      throw new Error(`Deposit collateral request failed: ${error.message}`);
    }
    return response.json();
  },
};
