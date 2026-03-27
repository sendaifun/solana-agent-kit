import { z } from "zod";
import { getMyIdentity } from "../shared";
import type { PluginAction, SolanaAgentLike } from "../types";

const getMyIdentityAction: PluginAction = {
  name: "DESIDE_GET_MY_IDENTITY",
  similes: [
    "get my deside identity",
    "show my deside profile",
    "check my deside identity",
  ],
  description: "Get the public Deside identity exposed for the connected wallet.",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          identity: {
            wallet: "9msyfXaZNffdQiqo68BTPNeuez3moU1vqdBmM86W5BWH",
            recognized: false,
            role: "user",
          },
        },
        explanation: "Retrieve the Deside identity of the connected wallet.",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentLike) => {
    try {
      const identity = await getMyIdentity(agent);
      return {
        status: "success",
        identity,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get Deside identity: ${error.message}`,
      };
    }
  },
};

export default getMyIdentityAction;
