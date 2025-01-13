import { PublicKey } from "@solana/web3.js";
import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { getPrimaryDomain } from "../../tools";

const getPrimaryDomainAction: Action = {
  name: "GET_PRIMARY_DOMAIN",
  similes: [
    "get primary domain",
    "lookup primary domain",
    "check primary domain",
    "find primary domain",
    "get main domain",
    "primary sol domain",
  ],
  description:
    "Get the primary .sol domain associated with a Solana wallet address",
  examples: [
    [
      {
        input: {
          account: "7nxQB...",
        },
        output: {
          status: "success",
          domain: "vitalik.sol",
          message: "Primary domain: vitalik.sol",
        },
        explanation: "Get the primary .sol domain for a wallet address",
      },
    ],
  ],
  schema: z.object({
    account: z.string().min(1).describe("The Solana wallet address to lookup"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const account = new PublicKey(input.account);

      const response = await getPrimaryDomain(agent, account);

      return {
        status: "success",
        domain: response,
        message: `Primary domain: ${response}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get primary domain: ${error.message}`,
      };
    }
  },
};

export default getPrimaryDomainAction;
