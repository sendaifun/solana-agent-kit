import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { getAllDomainsTLDs } from "../../tools";

const getAllDomainsTLDsAction: Action = {
  name: "GET_ALL_TLDS",
  similes: [
    "list domain tlds",
    "get domain extensions",
    "fetch domain tlds",
    "get top level domains",
    "list available tlds",
    "get domain suffixes",
  ],
  description:
    "Get a list of all available top-level domains (TLDs) for Solana domains",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          tlds: [".sol", ".abc", ".backpack", ".bonk"],
          message: "Successfully retrieved all domain TLDs",
        },
        explanation:
          "Get a list of all available TLDs that can be used for Solana domains",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentKit) => {
    try {
      // Get all domain TLDs
      const tlds = await getAllDomainsTLDs(agent);

      return {
        status: "success",
        tlds,
        message: "Successfully retrieved all domain TLDs",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get domain TLDs: ${error.message}`,
      };
    }
  },
};

export default getAllDomainsTLDsAction;
