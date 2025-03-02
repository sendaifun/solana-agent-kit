import { Action } from "../../types/action";
import { z } from "zod";
import type { SolanaAgentKit } from "../../agent";

const useParaPregenWalletAction: Action = {
  name: "USE_PARA_PREGEN_WALLET",
  similes: [
    "use para pregen wallet"
 
  ],
  description:
    "Use a pregen wallet created with the CREATE_PARA_PREGEN_WALLET action",
  examples: [
    [
      {
        input: {
          userShare: "dawdaawdaw",
        },
        output: {
          status: "success",
          message: "Pre-generated wallet used successfully.",
          address: "0xdasdnas"
        },
        explanation: "Use a pregen wallet created with the CREATE_PARA_PREGEN_WALLET action",
      },
    ],
  ],
  schema: z.object({
    userShare: z
      .string()
            .describe("The user share to use the wallet for"),
  }),
  handler: async ( agent: SolanaAgentKit , input: Record<string, any>) => {
    try {
      

      const { userShare } = input;
      const response = await agent.useParaPregenWallet(userShare);

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

export default useParaPregenWalletAction;
