import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { Action } from "../../types";
import { e } from "@raydium-io/raydium-sdk-v2/lib/api-0eb57ba2";

const getRealmInfoAction: Action = {
  name: "SPL_GET_REALM_INFO",
  similes: [
    "view dao information",
    "check realm status",
    "get dao details",
    "retrieve governance realm info",
    "fetch dao configuration",
    "lookup realm data",
  ],
  description: "Get detailed information about a DAO realm",
  examples: [
    [
      {
        input: {
          realm: "7nxQB...",
        },
        output: {
          status: "success",
          realmInfo: {
            name: "My Community DAO",
            communityMint: "EPjF...",
            councilMint: "So11...",
            // other realm data
          },
          message: "Successfully retrieved realm information",
        },
        explanation: "Retrieve configuration details for a DAO realm",
      },
    ],
  ],
  schema: z.object({
    realm: z.string().min(1).describe("Address of the DAO realm"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await agent.getRealm(new PublicKey(input.realm));

      return {
        status: "success",
        realmInfo: result,
        message: "Successfully retrieved realm information",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get realm info: ${error.message}`,
      };
    }
  },
};
 
export default getRealmInfoAction;