import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { flashCloseTrade } from "../tools";

const flashCloseTradeAction: Action = {
  name: "FLASH_CLOSE_TRADE",
  similes: [
    "close trade",
    "close leveraged trade",
    "exit position",
    "close position",
    "exit trade",
    "close long",
    "close short",
    "take profit",
    "stop loss",
  ],
  description:
    "Close an existing leveraged trading position on Flash.Trade protocol",
  examples: [
    [
      {
        input: {
          token: "SOL",
          side: "long",
        },
        output: {
          status: "success",
          signature: "4xKpN2...",
          message: "Successfully closed long position on SOL",
        },
        explanation: "Close an existing long position on SOL",
      },
    ],
  ],
  schema: z.object({
    token: z
      .string()
      .describe("Token symbol of the position to close (e.g. SOL, ETH)"),
    side: z
      .enum(["long", "short"])
      .describe("Position side to close - long or short"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const params = {
        token: input.token as string,
        side: input.side as "long" | "short",
      };

      const response = await flashCloseTrade(agent, params);

      return {
        status: "success",
        signature: response,
        message: `Successfully closed ${params.side} position on ${params.token}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Flash trade close failed: ${error.message}`,
      };
    }
  },
};

export default flashCloseTradeAction;
