import { z } from "zod";
import { getUserInfo } from "../shared";
import type { PluginAction, SolanaAgentLike } from "../types";

const getUserInfoAction: PluginAction = {
  name: "DESIDE_GET_USER_INFO",
  similes: [
    "get deside user info",
    "lookup deside wallet",
    "show deside profile",
  ],
  description: "Get the public Deside profile for a wallet.",
  examples: [
    [
      {
        input: {
          wallet: "Gwrn3UyMvrdSP8VsQZyTfAYp9qwrcu5ivBujKHufZJFZ",
        },
        output: {
          status: "success",
          profile: {
            wallet: "Gwrn3UyMvrdSP8VsQZyTfAYp9qwrcu5ivBujKHufZJFZ",
          },
        },
        explanation: "Fetch Deside public profile data for a wallet.",
      },
    ],
  ],
  schema: z.object({
    wallet: z.string().describe("The wallet address to inspect on Deside."),
  }),
  handler: async (agent: SolanaAgentLike, input: Record<string, any>) => {
    try {
      const profile = await getUserInfo(agent, {
        wallet: input.wallet,
      });
      return {
        status: "success",
        profile,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get Deside user info: ${error.message}`,
      };
    }
  },
};

export default getUserInfoAction;
