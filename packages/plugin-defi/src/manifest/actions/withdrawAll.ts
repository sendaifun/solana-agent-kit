import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { withdrawAll } from "../tools";

const withdrawAllAction: Action = {
  name: "WITHDRAW_ALL_MANIFEST_FUNDS",
  similes: [
    "withdraw all funds",
    "withdraw manifest funds",
    "remove all funds",
    "withdraw everything",
    "clear manifest balance",
    "withdraw total balance",
  ],
  description: "Withdraw all funds from a Manifest market",
  examples: [
    [
      {
        input: {
          marketId: "7nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkN",
        },
        output: {
          status: "success",
          signature: "2ZE7Rz...",
          message: "Successfully withdrew all funds",
        },
        explanation: "Withdraw all funds from the specified market",
      },
    ],
  ],
  schema: z.object({
    marketId: z.string().min(32, "Invalid market ID"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const transaction = await withdrawAll(
        agent,
        new PublicKey(input.marketId),
      );

      return {
        status: "success",
        transaction,
        message: "Successfully withdrew all funds",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to withdraw funds: ${error.message}`,
      };
    }
  },
};

export default withdrawAllAction;
