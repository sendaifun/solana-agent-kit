import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";
import { Action, ActionResult } from "../types";
import { z } from "zod";

export const SolanaBalanceAction: Action = {
  name: "solana_balance",
  similes: ["check_balance", "get_wallet_balance"],
  description: `Get the balance of a Solana wallet or token account,

  If you want to get the balance of your wallet, you don't need to provide the tokenAddress.
  If no tokenAddress is provided, the balance will be in SOL.

  Inputs:
  tokenAddress: string, eg "So11111111111111111111111111111111111111112" (optional)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: { text: "Get my balance" },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: { success: true, data: { balance: "100 SOL" } },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const convert = async (): Promise<ActionResult> => {
      const publicKey = new PublicKey(input.tokenAddress);
      const promise_string = await agent.getBalance(publicKey);
      const result: ActionResult = {
        success: true,
        data: { balance: promise_string },
      };
      return result;
    };
    return convert();
  },

  validate: async (context, ...args) => {
    const input = args[0];
    try {
      const schema = z.string().optional();
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
