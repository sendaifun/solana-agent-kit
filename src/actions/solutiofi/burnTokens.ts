import type { Action } from "../../types";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";

const burnTokensAction: Action = {
  name: "SOLUTIOFI_BURN_TOKENS",
  description: "Burn tokens using SolutioFi",
  similes: [
    "burn tokens",
    "burn spl tokens",
    "burn spl-token",
    "destroy tokens",
    "burn assets",
    "burn nfts",
    "burn an nft",
    "permanently delete an nft or a token",
    "remove tokens from circulation",
    "delete my tokens",
    "permanently remove my tokens",
    "burn tokens with solutiofi",
    "burn nfts with solutiofi",
  ],
  examples: [
    [
      {
        input: {
          mints: ["tokenMint123", "tokenMint456"],
        },
        output: {
          status: "success",
          message: "Successfully burnt tokens",
          transactions: ["tx_signature"],
        },
        explanation: "Burn specified tokens",
      },
    ],
  ],
  schema: z.object({
    mints: z.array(z.string()).describe("Array of mint addresses to burn"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { mints } = input;
      const transactions = await agent.burnTokens(mints);

      return {
        status: "success",
        transactions,
        message: "Successfully burned tokens",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to burn tokens: ${error.message}`,
        code: error.code || "BURN_TOKENS_ERROR",
      };
    }
  },
};

export default burnTokensAction;
