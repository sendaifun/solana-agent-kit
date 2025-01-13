import { PublicKey } from "@solana/web3.js";
import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { getOwnedAllDomains } from "../../tools";

const getOwnedAllDomainsAction: Action = {
  name: "GET_OWNED_ALL_DOMAINS",
  similes: [
    "list owned domains",
    "get my domains",
    "fetch wallet domains",
    "get owned names",
    "list my domains",
    "get address domains",
  ],
  description:
    "Get all domains owned by a specific wallet address across all TLDs",
  examples: [
    [
      {
        input: {
          address: "7nxQB...",
        },
        output: {
          status: "success",
          domains: ["solana.sol", "wallet.abc", "user.backpack"],
          total: 3,
          message: "Successfully retrieved owned domains",
        },
        explanation: "Get all domain names owned by a specific wallet address",
      },
    ],
  ],
  schema: z.object({
    address: z
      .string()
      .min(1)
      .describe("The wallet address to get owned domains for"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const address = new PublicKey(input.address);

      // Get owned domains
      const domains = await getOwnedAllDomains(agent, address);

      return {
        status: "success",
        domains,
        total: domains.length,
        message: `Successfully retrieved ${domains.length} owned domain${domains.length === 1 ? "" : "s"}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get owned domains: ${error.message}`,
      };
    }
  },
};

export default getOwnedAllDomainsAction;
