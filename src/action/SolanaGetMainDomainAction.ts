import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";
import { Action, ActionResult } from "../types";
import { z } from "zod";

export const SolanaGetMainDomainAction: Action = {
  name: "solana_get_main_domain",
  similes: ["get_main_domain", "fetch_main_domain"],
  description: `Get the main/favorite domain for a given wallet address.

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
                owner: "4Be9CvxqHW6BYiRAxW9Q3xu1ycTMWaL5z8NX4HR3ha7t",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { mainDomain: "example.sol" },
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const ownerPubkey = new PublicKey(input.owner.trim());
    const mainDomain = await agent.getMainAllDomainsDomain(ownerPubkey);
    return {
      success: true,
      data: {
        domain: mainDomain,
        owner: input.owner,
      },
    };
  },

  validate: async (input: Record<string, any>) => {
    try {
      const schema = z.object({
        owner: z.string(),
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
