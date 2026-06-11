import { Action } from "solana-agent-kit";
import { z } from "zod";
import { computeLiquidationPrice } from "../tools";

const computeLiquidationPriceAction: Action = {
  name: "QUANTORACLE_LIQUIDATION_PRICE",
  description:
    "Calculate the liquidation price of a leveraged position (long or short) given entry, collateral, leverage, and maintenance margin. Supports perpetuals, futures, and margin accounts. $0.002 per call via x402 past the free tier.",
  similes: [
    "liquidation price for my leveraged position",
    "where would i get liquidated",
    "margin call price",
    "perp liquidation price",
    "distance to liquidation",
  ],
  examples: [
    [
      {
        input: {
          entry_price: 50000,
          collateral: 1000,
          position_size: 5000,
          leverage: 5,
          direction: "long",
        },
        output: { liquidation_price: 40000, distance_pct: 20 },
        explanation: "5x long BTC at $50k with $1k collateral liquidates at $40k (20% drop).",
      },
    ],
  ],
  schema: z.object({
    entry_price: z.number().positive(),
    collateral: z.number().positive(),
    position_size: z.number().positive(),
    leverage: z.number().positive(),
    direction: z.enum(["long", "short"]),
    maintenance_margin: z.number().optional().describe("Maintenance margin as fraction. Default 0.005"),
  }),
  handler: async (agent, input) => {
    try {
      const result = await computeLiquidationPrice(agent, input as any);
      return { status: "success", result };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error is not a property of unknown
        message: e.message,
      };
    }
  },
};

export default computeLiquidationPriceAction;
