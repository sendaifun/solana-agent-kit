import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";
import { Action } from "../types";
import { z } from "zod";

export const SolanaGetDomainAction: Action = {
  name: "solana_get_domain",
  similes: ["get_domain", "fetch_domain"],
  description: `Retrieve the .sol domain associated for a given account address.

  Inputs:
  account: string, eg "4Be9CvxqHW6BYiRAxW9Q3xu1ycTMWaL5z8NX4HR3ha7t" (required)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                address: "So11111111111111111111111111111111111111112",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { domain: "example.sol" },
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const account = new PublicKey(input.account.trim());
    const domain = await agent.getPrimaryDomain(account);
    return {
      success: true,
      data: {
        domain,
      },
    };
  },

  validate: async (context, ...args) => {
    const input = args[0];
    try {
      const schema = z.object({
        account: z.string(),
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
