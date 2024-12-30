// SolanaRegisterDomainAction.ts
import { SolanaAgentKit } from "../agent";
import { Action } from "../types";
import { z } from "zod";

export const SolanaRegisterDomainAction: Action = {
  name: "solana_register_domain",
  similes: ["register_domain", "create_domain"],
  description: `Register a .sol domain name for your wallet.

  Inputs:
  name: string, eg "mydomain.sol" (required)
  spaceKB: number, eg 1 (optional, default is 1)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                domain: "example.sol",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: {
            domainAddress: "So11111111111111111111111111111111111111112",
          },
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const tx = await agent.registerDomain(input.name, input.spaceKB || 1);

    return {
      success: true,
      data: {
        transaction: tx,
        domain: `${input.name}.sol`,
        spaceKB: input.spaceKB || 1,
      },
    };
  },

  validate: async (input: Record<string, any>) => {
    try {
      const schema = z.object({
        name: z.string().nonempty("name is required and must be a string"),
        spaceKB: z
          .number()
          .positive("spaceKB must be a positive number when provided")
          .optional(),
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
