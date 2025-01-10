import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { resolveAllDomains } from "../../tools";

const resolveDomainAction: Action = {
  name: "RESOLVE_ALL_DOMAINS",
  similes: [
    "resolve domain",
    "lookup domain",
    "get domain owner",
    "check domain",
    "find domain owner",
  ],
  description: "Resolve a Solana domain name to get its owner's public key",
  examples: [
    [
      {
        input: {
          domain: "example.sol",
        },
        output: {
          status: "success",
          owner: "7nxQB...",
        },
        explanation: "Resolve a .sol domain name to get the owner's public key",
      },
    ],
  ],
  schema: z.object({
    domain: z.string().min(1).describe("The domain name to resolve"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const domain = input.domain as string;
      const tld = await resolveAllDomains(agent, domain);
      return {
        status: "success",
        owner: tld,
        message: `Successfully resolved domain ${domain}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to resolve domain: ${error.message}`,
      };
    }
  },
};

export default resolveDomainAction;
