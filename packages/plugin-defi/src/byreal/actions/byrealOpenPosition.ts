import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { byrealOpenPosition } from "../tools";

export const byrealOpenPositionAction: Action = {
  name: "BYREAL_OPEN_POSITION",
  similes: [
    "open byreal position",
    "add liquidity on byreal",
    "create byreal CLMM position",
    "provide liquidity byreal",
  ],
  description:
    "Open a new concentrated liquidity (CLMM) position on Byreal DEX within a specified price range",
  examples: [
    [
      {
        input: {
          poolAddress: "PoolAddr...",
          priceLower: "18.5",
          priceUpper: "22.0",
          amountUsd: 100,
        },
        output: {
          status: "success",
          message: "Position opened successfully on Byreal",
        },
        explanation: "Open a $100 CLMM position in the 18.5-22.0 price range",
      },
    ],
  ],
  schema: z.object({
    poolAddress: z.string().describe("The Byreal pool address"),
    priceLower: z
      .union([z.string(), z.number()])
      .describe("Lower bound of the price range"),
    priceUpper: z
      .union([z.string(), z.number()])
      .describe("Upper bound of the price range"),
    base: z
      .enum(["MintA", "MintB"])
      .optional()
      .describe("Base token (required when using amount)"),
    amount: z.string().optional().describe("Amount of base token in UI units"),
    amountUsd: z
      .number()
      .optional()
      .describe("Investment amount in USD (auto-calculates token split)"),
    slippageBps: z
      .number()
      .optional()
      .describe("Slippage tolerance in basis points"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await byrealOpenPosition(
        agent,
        input.poolAddress,
        input.priceLower,
        input.priceUpper,
        {
          base: input.base,
          amount: input.amount,
          amountUsd: input.amountUsd,
          slippageBps: input.slippageBps,
        },
      );
      return {
        status: "success",
        message:
          typeof result === "string"
            ? "Position opened successfully on Byreal"
            : "Position transaction signed. Please send to network.",
        transaction: result,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to open Byreal position: ${error.message}`,
      };
    }
  },
};
