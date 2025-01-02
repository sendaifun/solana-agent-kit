import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { withdrawWithLulo } from "../tools";

const withdrawWithLuloAction: Action = {
  name: "WITHDRAW_WITH_LULO",
  similes: [
    "withdraw with lulo",
    "withdraw usdc with lulo",
    "withdraw pyusc with lulo",
    "withdraw usds with lulo",
    "withdraw usdt with lulo",
    "withdraw SOL with lulo",
    "withdraw jitoSOL with lulo",
    "withdraw bSOL with lulo",
    "withdraw mSOL with lulo",
    "withdraw BONK with lulo",
    "withdraw JUP with lulo",
  ],
  description:
    "Withdraw tokens with Lulo staking protocol",
  examples: [
    [
      {
        input: {
          mintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          amount: 1.5,
        },
        output: {
          status: "success",
          signature: "5KtPn3...",
          message: "Successfully withdrawed 1.5 SOL with lulo",
        },
        explanation: "Withdraw 1.5 SOL with lulo",
      },
    ],
  ],
  schema: z.object({
    mintAddress: z.string().describe("Token mint address to withdraw"),
    amount: z.number().positive().describe("Amount to withdraw"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const mintAddress = input.mintAddress as string;
      const amount = input.amount as number;

      const res = await withdrawWithLulo(agent, mintAddress, amount);
      return {
        status: "success",
        res,
        message: `Successfully withdrawed ${amount} of ${mintAddress}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `withdraw failed: ${error.message}`,
      };
    }
  },
};

export default withdrawWithLuloAction;
