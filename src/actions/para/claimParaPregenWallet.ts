import { Action } from "../../types/action";
import { z } from "zod";
import type { SolanaAgentKit } from "../../agent";

const claimParaPregenWalletAction: Action = {
  name: "CLAIM_PARA_PREGEN_WALLET",
  similes: [
    "claim para pregen wallet"
 
  ],
  description:
    "Claim a pregen wallet for Para",
  examples: [
    [
      {
        input: {
          email: "sdsd@gmail.com"
        },
        output: {
          status: "success",
          message: "Pre-generated wallet claimed successfully.",
          recoverySecret: "0xdasdnas",  
          email: "sdsd@gmail.com"
        },
        explanation: "Claim a pregen wallet created with the CREATE_PARA_PREGEN_WALLET action",
      },
    ],
  ],
  schema: z.object({
    email: z
      .string()
            .describe("The email address to claim the wallet for")
  }),
  handler: async ( agent: SolanaAgentKit , input: Record<string, any>) => {
    try {
      

      const { email } = input;
      const response = await agent.claimParaPregenWallet(email);

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

export default claimParaPregenWalletAction;
