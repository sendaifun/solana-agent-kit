import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { luloWithdraw } from "../../tools/lulo";

const luloWithdrawAction: Action = {
  name: "LULO_WITHDRAW",
  similes: [
    "withdraw USDC with lulo",
    "withdraw PYUSD with lulo",
    "withdraw USDS with lulo",
    "withdraw USDT with lulo",
    "withdraw SQL with lulo",
    "withdraw jitoSQL with lulo",
    "withdraw bSQL with lulo",
    "withdraw mSQL with lulo",
    "withdraw BONK with lulo",
    "withdraw JUP with lulo",
  ],
  description: "Withdraw SPL tokens using Lulo protocol",
  examples: [
    [
      {
        input: {
          mintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          amount: 100,
        },
        output: {
          status: "success",
          signature: "4xKpN2...",
          message: "Successfully withdraw 100 USDC",
        },
        explanation: "Withdraw 100 USDC on Lulo",
      },
    ],
  ],
  schema: z.object({
    mintAddress: z.string().describe("SPL Mint address"),
    amount: z.number().positive().describe("Amount to lend"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const mintAddress = input.mintAddress as string;
      const amount = input.amount as number;

      const response = await luloWithdraw(agent, mintAddress, amount);

      return {
        status: "success",
        signature: response,
        message: `Successfully withdraw ${amount} of token ${mintAddress}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Withdraw failed: ${error.message}`,
      };
    }
  },
};

export default luloWithdrawAction;
