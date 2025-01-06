import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { resolveSolDomain } from "../tools";

const resolveSolDomainAction: Action = {
  name: "RESOLVE_SOL_DOMAIN",
  similes: [
    "resolve sol domain",
    "lookup sol domain",
    "get sol domain owner",
    "check sol domain",
    "find sol domain owner",
    "resolve .sol",
  ],
  description:
    "Resolve a .sol domain to its corresponding Solana wallet address using Bonfida Name Service",
  examples: [
    [
      {
        input: {
          domain: "vitalik.sol",
        },
        output: {
          status: "success",
          owner: "7nxQB...",
          message: "Successfully resolved vitalik.sol",
        },
        explanation: "Resolve a .sol domain to get the owner's wallet address",
      },
    ],
  ],
  schema: z.object({
    domain: z
      .string()
      .min(1)
      .describe("The .sol domain to resolve (with or without .sol suffix)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const domain = input.domain as string;

      const res = await resolveSolDomain(agent, domain);

      return {
        status: "success",
        owner: res.toString(),
        message: `Successfully resolved ${res}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to resolve domain: ${error.message}`,
      };
    }
  },
};

export default resolveSolDomainAction;
