import { Action } from "solana-agent-kit";
import { z } from "zod";
import { addLiquidityWithQuote } from "../tools";

const addLiquiditySchema = z.object({
  pool: z.string().describe("The PumpFun liquidity pool address"),
  amount: z.number().describe("Amount of SOL (initial liquidity) to deposit"),
  slippage: z
    .number()
    .optional()
    .default(1)
    .describe("Slippage tolerance in percentage (default 1%)"),
});

export const addLiquidityWithQuoteAction: Action = {
  name: "add_liquidity_pumpfun_quote",
  similes: [
    "provide liquidity pumpfun sol",
    "deposit pumpfun pool sol",
    "add pumpfun lp sol",
  ],
  description: "Add liquidity to a PumpFun AMM pool using SOL (Quote Token)",
  examples: [
    [
      {
        input: {
          pool: "PoolAddress123",
          amount: 1,
          slippage: 0.5,
        },
        output: {
          status: "success",
          signature: "TransactionSignature...",
          lpAmount: "123.45",
          baseAmount: "5000",
          quoteAmount: "1000000000",
        },
        explanation: "Deposit 1 SOL into the pool with 0.5% slippage.",
      },
    ],
  ],
  schema: addLiquiditySchema,
  handler: async (agent, input) => {
    return await addLiquidityWithQuote(
      agent,
      input.pool,
      input.amount,
      input.slippage,
    );
  },
};

export default addLiquidityWithQuoteAction;
