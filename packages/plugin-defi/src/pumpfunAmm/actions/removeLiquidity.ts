import { Action } from "solana-agent-kit";
import { z } from "zod";
import { removeLiquidity } from "../tools";

const removeLiquiditySchema = z.object({
  pool: z.string().describe("The PumpFun liquidity pool address"),
  lpAmount: z.number().describe("Amount of LP tokens to burn"),
  slippage: z
    .number()
    .optional()
    .default(1)
    .describe("Slippage tolerance in percentage (default 1%)"),
});

export const removeLiquidityAction: Action = {
  name: "remove_liquidity_pumpfun",
  similes: [
    "withdraw liquidity pumpfun",
    "remove pumpfun lp",
    "burn pumpfun lp",
  ],
  description: "Remove liquidity from a PumpFun AMM pool by burning LP tokens",
  examples: [
    [
      {
        input: {
          pool: "PoolAddress123",
          lpAmount: 50,
        },
        output: {
          status: "success",
          signature: "TransactionSignature...",
          baseAmountOut: "100.5",
          quoteAmountOut: "2.5",
        },
        explanation: "Remove 50 LP tokens from the pool.",
      },
    ],
  ],
  schema: removeLiquiditySchema,
  handler: async (agent, input) => {
    return await removeLiquidity(
      agent,
      input.pool,
      input.lpAmount,
      input.slippage,
    );
  },
};

export default removeLiquidityAction;
