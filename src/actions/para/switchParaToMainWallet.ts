import { Action } from "../../types/action";
import { z } from "zod";
import type { SolanaAgentKit } from "../../agent";

const switchParaToMainWalletAction: Action = {
  name: "SWITCH_PARA_TO_MAIN_WALLET",
  similes: ["switch para to main wallet"],
  description: "Switch a pre-generated wallet for Para to the main wallet",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          message: "Pre-generated wallet switched to main wallet successfully.",
          address: "0xdasdnas",
        },
        explanation:
          "Switch a pre-generated wallet for Para to the main wallet",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const response = await agent.switchParaToMainWallet();

      return {
        status: "success",
        ...response,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
      };
    }
  },
};

export default switchParaToMainWalletAction;
