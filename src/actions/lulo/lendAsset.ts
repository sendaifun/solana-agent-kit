import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { lendAsset } from "../../tools/lulo";

const lendAssetAction: Action = {
  name: "LEND_ASSET",
  similes: [
    "lend usdc",
    "deposit for yield",
    "earn yield",
    "lend with lulo",
    "deposit usdc",
    "lending",
  ],
  description: "Lend USDC tokens to earn yield using Lulo protocol",
  examples: [
    [
      {
        input: {
          amount: 100,
        },
        output: {
          status: "success",
          signature: "4xKpN2...",
          message: "Successfully lent 100 USDC",
        },
        explanation: "Lend 100 USDC to earn yield on Lulo",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().positive().describe("Amount of USDC to lend"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const amount = input.amount as number;

      const response = await lendAsset(agent, amount);

      return {
        status: "success",
        signature: response,
        message: `Successfully lent ${amount} USDC`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Lending failed: ${error.message}`,
      };
    }
  },
};

export default lendAssetAction;
