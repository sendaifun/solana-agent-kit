import { Action } from "../../types/action";
import { z } from "zod";
import type { SolanaAgentKit } from "../../agent";
const updateParaPregenWalletAction: Action = {
  name: "UPDATE_PARA_PREGEN_WALLET",
  similes: [
    "update para pregen wallet"
   
 
  ],
  description:
    "Update a pregen wallet for Para",
  examples: [
    [
      {
        input: {
          email: "test@test.com",
          walletId: "1234567890"
        },
        output: {
          status: "success",
          message: "Pre-generated wallet updated successfully.",
          walletId: "1234567890",
          email: "test@test.com"
        },
        explanation: "Update a pregen wallet for Para",
      },
    ],
  ],
  schema: z.object({
    email: z
      .string()
            .describe("The email address to update the wallet for"),
    walletId: z
      .string()
            .describe("The wallet id to update the wallet for"),
   
  }),
  handler: async ( agent: SolanaAgentKit , input: Record<string, any>) => {
    try {
      

      const { email,walletId } = input;
      const response = await agent.updateParaPregenWallet(email,walletId);

      return {
        status: "success",
       ...response
      };
    } catch (error: any) {
   

      return {
              status: "error",
        message: error.message,
      };
    }
  },
};

export default updateParaPregenWalletAction;
