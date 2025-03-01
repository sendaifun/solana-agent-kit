import { Action } from "../../types/action";
import { z } from "zod";
import type{ SolanaAgentKit } from "../../agent";

const getParaPregenWalletsAction: Action = {
  name: "GET_PARA_PREGEN_WALLETS",
  similes: [
    "get pregen wallets",
    "list pregen wallets",
    "get para pregen wallets",
 
  ],
  description:
    "Get pregen wallets for the given email address.",
  examples: [
    [
      {
        input: {
          email: "test@test.com",
        },
        output: {
          status: "success",
        listAllPregenWallets:[]
        },
        explanation: "List all pregen wallets created by Para based on email",
      },
    ],
  ],
  schema: z.object({   
    email: z
      .string()
            .describe("The email address assosciated with the pregen wallet"),
  }),
  handler: async ( agent: SolanaAgentKit , input: Record<string, any>) => {
    try {
      

      const response = await agent.getParaPregenWallets(input.email);

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

export default getParaPregenWalletsAction;
