import { Action } from "../../types/action";
import { z } from "zod";
import type { SolanaAgentKit } from "../../agent";

const deactivateParaPregenWalletAction: Action = {
  name: "DEACTIVATE_PARA_PREGEN_WALLET",
  similes: [
    "deactivate para pregen wallet"
 
  ],
  description:
    "Deactivate a pregen wallet for Para",
  examples: [
    [
      {
        input: {
          
        },
        output: {
          status: "success",
          message: "Pre-generated wallet deactivated successfully.",
          address: "0xdasdnas",
     
        },
        explanation: "Deactivate a pregen wallet created with the CREATE_PARA_PREGEN_WALLET action",
      },
    ],
  ],
  schema: z.object({}),
  handler: async ( agent: SolanaAgentKit , input: Record<string, any>) => {
    try {
      

      const response = await agent.deactivateParaPregenWallet();

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

export default deactivateParaPregenWalletAction;
