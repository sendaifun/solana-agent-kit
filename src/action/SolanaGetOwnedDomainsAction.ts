import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";
import { Action, ActionResult } from "../types";
import { z } from "zod";

export const SolanaGetOwnedDomainsAction: Action = {
  name: "solana_get_owned_domains",
  similes: ["get_owned_domains", "fetch_owned_domains"],
  description: `Get all domains owned by a specific wallet address.

  Inputs:
  owner: string, eg "4Be9CvxqHW6BYiRAxW9Q3xu1ycTMWaL5z8NX4HR3ha7t" (required)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                owner: "4Be9CvxqHW6BYiRAxW9Q3xu1ycTMWaL5z8NX4HR3ha7t"
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { domains: ["example1.sol", "example2.sol"] }
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const ownerPubkey = new PublicKey(input.owner.trim());
    const domains = await agent.getOwnedAllDomains(ownerPubkey);
    return {
      success: true,
      data: {
        domains,
        owner: input.owner
      }
    };
  },

  validate: async (context, ...args) => {
    const input = args[0];
    try {
      const schema = z.object({
        owner: z.string()
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
