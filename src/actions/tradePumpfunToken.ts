import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { tradePumpFunToken } from "../tools";

const tradePumpfunTokenAction: Action = {
  name: "TRADE_PUMPFUN_TOKEN",
  similes: [
    "buy pumpfun token",
    "buy token on pumpfun",
    "sell pumpfun token",
    "sell token on pumpfun",
    "buy meme token",
    "buy memecoin",
    "buy pump token",
  ],
  description:
    "Buy or sell a token on Pump.fun",
  examples: [
    [
      {
        input: {
          action: "buy",
          tokenTicker: "SMPL",
          solAmount: 0.1,
          slippageBps: 10,
          priorityFee: 0.0001,
        },
        output: {
          status: "success",
          signature: "2ZE7Rz...",
          message: "Successfully buy token on Pump.fun",
        },
        explanation:
          "Buy a token with 0.1 SOL",
      },
    ],
  ],
  schema: z.object({
    action: z
      .string()
      .min(1)
      .max(10)
      .describe("Action to perform (buy or sell)"),
    tokenTicker: z
      .string()
      .min(2)
      .max(10)
      .describe("Ticker symbol of the token"),
    solAmount: z
      .number()
      .min(0.0001)
      .default(0.0001)
      .describe("Initial liquidity in SOL"),
    slippageBps: z
      .number()
      .min(1)
      .max(1000)
      .default(5)
      .describe("Slippage tolerance in basis points"),
    priorityFee: z
      .number()
      .min(0.00001)
      .default(0.00005)
      .describe("Priority fee in SOL"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { action, tokenTicker, solAmount } = input;
      const result = await tradePumpFunToken(
        agent,
        action,
        tokenTicker,
        solAmount,
        input,
      );

      return {
        status: "success",
        signature: result.signature,
        message: "Successfully traded token on Pump.fun",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to trade token: ${error.message}`,
      };
    }
  },
};

export default tradePumpfunTokenAction;
