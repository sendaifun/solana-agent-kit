import { Action } from "../../types/action";
import { z } from "zod";
import type { SolanaAgentKit } from "../../agent";
const createParaPregenWalletAction: Action = {
  name: "CREATE_PARA_PREGEN_WALLET",
  similes: [
    "create para pregen wallet",
    "generate para pregen wallet",
    "make para pregen wallet"
 
  ],
  description:
    "Create a pregen wallet for Para",
  examples: [
    [
      {
        input: {
          email: "test@test.com"
        },
        output: {
          status: "success",
          message: "Pre-generated wallet created successfully.",
          address: "0xdasdnas",
        walletId:"1234567890",
        userShare:"sdfsdfsdfsd"
        },
        explanation: "Create a pregen wallet for Para",
      },
    ],
  ],
  schema: z.object({
    email: z
      .string()
            .describe("The email address to create the wallet for")
  }),
  handler: async ( agent: SolanaAgentKit , input: Record<string, any>) => {
    try {
      

      const { email } = input;
      const response = await agent.createParaPregenWallet(email);

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

export default createParaPregenWalletAction;
