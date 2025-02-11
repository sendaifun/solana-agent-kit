import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { luloLend } from "../../tools/lulo";

const luloLendAction: Action = {
  name: "LULO_LEND",
  similes: [
    "lend USDC with lulo",
    "lend PYUSD with lulo",
    "lend USDS with lulo",
    "lend USDT with lulo",
    "lend SQL with lulo",
    "lend jitoSQL with lulo",
    "lend bSQL with lulo",
    "lend mSQL with lulo",
    "lend BONK with lulo",
    "lend JUP with lulo",
  ],
  description: "Lend SPL tokens using Lulo protocol",
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
          message: "Successfully lend 100 USDC",
        },
        explanation: "Lend 100 USDC on Lulo",
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

      const response = await luloLend(agent, mintAddress, amount);

      return {
        status: "success",
        signature: response,
        message: `Successfully lend ${amount} of token ${mintAddress}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Lend failed: ${error.message}`,
      };
    }
  },
};

export default luloLendAction;
