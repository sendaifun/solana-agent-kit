import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { depositWithLulo } from "../tools";

const depositWithLuloAction: Action = {
  name: "DEPOSIT_WITH_LULO",
  similes: [
    "deposit with lulo",
    "deposit usdc with lulo",
    "deposit pyusc with lulo",
    "deposit usds with lulo",
    "deposit usdt with lulo",
    "deposit SOL with lulo",
    "deposit jitoSOL with lulo",
    "deposit bSOL with lulo",
    "deposit mSOL with lulo",
    "deposit BONK with lulo",
    "deposit JUP with lulo",
  ],
  description:
    "Deposit tokens with Lulo staking protocol",
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
          message: "Successfully deposited 1.5 SOL with lulo",
        },
        explanation: "Deposit 1.5 SOL with lulo",
      },
    ],
  ],
  schema: z.object({
    mintAddress: z.string().describe("Token mint address to deposit"),
    amount: z.number().positive().describe("Amount to deposit"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const mintAddress = input.mintAddress as string;
      const amount = input.amount as number;

      const res = await depositWithLulo(agent, mintAddress, amount);
      return {
        status: "success",
        res,
        message: `Successfully deposited ${amount} of ${mintAddress}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `deposit failed: ${error.message}`,
      };
    }
  },
};

export default depositWithLuloAction;
