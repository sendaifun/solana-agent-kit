// SolanaResolveDomainAction.ts
import { SolanaAgentKit } from "../agent";
import { Action } from "../types";
import { z } from "zod";

export const SolanaResolveDomainAction: Action = {
  name: "solana_resolve_domain",
  similes: ["resolve_domain", "get_domain_address"],
  description: `Resolve ONLY .sol domain names to a Solana PublicKey.
  This tool is exclusively for .sol domains.
  DO NOT use this for other domain types like .blink, .bonk, etc.

  Inputs:
  domain: string, eg "mydomain.sol" (required)`,
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
          data: { address: "So11111111111111111111111111111111111111112" },
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const publicKey = await agent.resolveSolDomain(input.domain.trim());
    return {
      success: true,
      data: {
        publicKey: publicKey.toBase58(),
      }
    };
  },

  validate: async (input: Record<string, any>) => {
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
