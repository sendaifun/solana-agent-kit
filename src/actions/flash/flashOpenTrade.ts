import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { flashOpenTrade } from "../../tools/flash";

const flashOpenTradeAction: Action = {
  name: "FLASH_OPEN_TRADE",
  similes: [
    "open trade",
    "open leveraged trade",
    "start trading position",
    "open position",
    "long position",
    "short position",
    "leverage trade",
    "margin trade",
  ],
  description: "Open a leveraged trading position on Flash.Trade protocol",
  examples: [
    [
      {
        input: {
          token: "SOL",
          side: "long",
          collateralUsd: 100,
          leverage: 5,
        },
        output: {
          status: "success",
          signature: "4xKpN2...",
          message:
            "Successfully opened 5x long position on SOL with $100 collateral",
        },
        explanation:
          "Open a 5x leveraged long position on SOL using $100 as collateral",
      },
    ],
  ],
  schema: z.object({
    token: z.string().describe("Token symbol to trade (e.g. SOL, ETH)"),
    side: z
      .enum(["long", "short"])
      .describe("Trading direction - long or short"),
    collateralUsd: z
      .number()
      .positive()
      .describe("Amount of collateral in USD"),
    leverage: z
      .number()
      .positive()
      .describe("Leverage multiplier for the trade"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const params = {
        token: input.token as string,
        side: input.side as "long" | "short",
        collateralUsd: input.collateralUsd as number,
        leverage: input.leverage as number,
      };

      const response = await flashOpenTrade(agent, params);

      return {
        status: "success",
        signature: response,
        message: `Successfully opened ${params.leverage}x ${params.side} position on ${params.token} with $${params.collateralUsd} collateral`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Flash trade failed: ${error.message}`,
      };
    }
  },
};

export default flashOpenTradeAction;
