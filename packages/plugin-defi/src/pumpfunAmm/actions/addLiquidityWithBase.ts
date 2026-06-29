import { Action } from "solana-agent-kit";
import { z } from "zod";
import { addLiquidityWithBase } from "../tools";

const addLiquidityBaseSchema = z.object({
  pool: z.string().describe("The PumpFun liquidity pool address"),
  amount: z.number().describe("Amount of Base Token to deposit"),
  slippage: z
    .number()
    .optional()
    .default(1)
    .describe("Slippage tolerance in percentage (default 1%)"),
});

export const addLiquidityWithBaseAction: Action = {
  name: "add_liquidity_pumpfun_base",
  similes: [
    "provide liquidity pumpfun token",
    "deposit pumpfun pool token",
    "add pumpfun lp token",
  ],
  description: "Add liquidity to a PumpFun AMM pool using Base Token",
  examples: [
    [
      {
        input: {
          pool: "PoolAddress123",
          amount: 5000,
          slippage: 0.5,
        },
        output: {
          status: "success",
          signature: "TransactionSignature...",
          lpAmount: "123.45",
          baseAmount: "5000000000",
          quoteAmount: "1000000000",
        },
        explanation: "Deposit 5000 Tokens (Base) into the pool.",
      },
    ],
  ],
  schema: addLiquidityBaseSchema,
  handler: async (agent, input) => {
    return await addLiquidityWithBase(
      agent,
      input.pool,
      input.amount,
      input.slippage,
    );
  },
};

export default addLiquidityWithBaseAction;
