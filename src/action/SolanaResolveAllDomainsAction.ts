import { SolanaAgentKit } from "../agent";
import { Action, ActionResult } from "../types";
import { z } from "zod";

export const SolanaResolveAllDomainsAction: Action = {
  name: "solana_resolve_all_domains",
  similes: ["resolve_all_domains", "get_all_domains"],
  description: `Resolve domain names to a public key for ALL domain types EXCEPT .sol domains.
  Use this for domains like .blink, .bonk, etc.
  DO NOT use this for .sol domains.

  Inputs:
  domain: string, eg "mydomain.blink" or "mydomain.bonk" (required)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                domain: "example.blink"
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { owner: "So11111111111111111111111111111111111111112" }
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const owner = await agent.resolveAllDomains(input.domain);
    return {
      success: true,
      data: {
        owner: owner?.toString(),
        domain: input.domain
      }
    };
  },

  validate: async (context, ...args) => {
    const input = args[0];
    try {
      const schema = z.object({
        domain: z.string()
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
