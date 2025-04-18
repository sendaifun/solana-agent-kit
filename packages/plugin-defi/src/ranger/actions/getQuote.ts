import { z } from "zod";
import { RANGER_SOR_API_BASE } from "../index";
import { Action } from "solana-agent-kit";

export const getQuoteSchema = z.object({
  fee_payer: z.string().describe("The public key of the fee payer account."),
  symbol: z.string().describe("Trading symbol (e.g., 'SOL', 'BTC', 'ETH')."),
  side: z.enum(["Long", "Short"]).describe("Trading side."),
  size: z
    .number()
    .positive()
    .describe("The size of the position in base asset."),
  collateral: z
    .number()
    .positive()
    .describe("The amount of collateral to use (in USDC)."),
  size_denomination: z
    .string()
    .describe("Denomination of the size (must match symbol)."),
  collateral_denomination: z
    .literal("USDC")
    .describe("Denomination of the collateral (must be 'USDC')."),
  adjustment_type: z
    .enum([
      "Increase",
      "DecreaseFlash",
      "DecreaseJupiter",
      "DecreaseDrift",
      "DecreaseAdrena",
      "CloseFlash",
      "CloseJupiter",
      "CloseDrift",
      "CloseAdrena",
      "CloseAll",
    ])
    .describe("Type of position adjustment or quote context."),
  target_venues: z
    .array(z.enum(["Jupiter", "Flash", "Drift"]).describe("Venue"))
    .optional(),
  slippage_bps: z.number().int().optional(),
  priority_fee_micro_lamports: z.number().int().optional(),
});

export type GetQuoteInput = z.infer<typeof getQuoteSchema>;

export const getQuoteAction: Action = {
  name: "GET_QUOTE",
  similes: ["get quote", "fetch quote", "quote perp"],
  description:
    "Get a trade quote for a perp position using the Ranger SOR API.",
  examples: [
    [
      {
        input: {
          fee_payer: "YOUR_PUBLIC_KEY",
          symbol: "SOL",
          side: "Long",
          size: 1.0,
          collateral: 10.0,
          size_denomination: "SOL",
          collateral_denomination: "USDC",
          adjustment_type: "Increase",
        },
        output: {
          venues: [],
          total_collateral: 10.0,
          total_size: 1.0,
          average_price: 20.625,
        },
        explanation: "Get a quote for opening a long SOL position.",
      },
    ],
  ],
  schema: getQuoteSchema,
  handler: async (_agent, input, { apiKey }) => {
    const response = await fetch(`${RANGER_SOR_API_BASE}/v1/order_metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Quote request failed: ${error.message}`);
    }
    return response.json();
  },
};
