
import { SolanaAgentKit } from "../agent";
import { Action, ActionResult } from "../types";
import { z } from "zod";

export const SolanaGetOwnedTldDomainsAction: Action = {
  name: "solana_get_owned_tld_domains",
  similes: ["get_owned_tld_domains", "fetch_owned_tld_domains"],
  description: `Get all domains owned by the agent's wallet for a specific TLD.

  Inputs:
  tld: string, eg "bonk" (required)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                tld: "bonk"
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { domains: ["example1.bonk", "example2.bonk"] }
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const domains = await agent.getOwnedDomainsForTLD(input.tld);
    return {
      success: true,
      data: {
        domains,
        tld: input.tld
      }
    };
  },

  validate: async (input: Record<string, any>) => {
    try {
      const schema = z.object({
        tld: z.string()
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
