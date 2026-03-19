import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { byrealClaimFees } from "../tools";

export const byrealClaimFeesAction: Action = {
  name: "BYREAL_CLAIM_FEES",
  similes: [
    "claim byreal fees",
    "collect byreal rewards",
    "harvest byreal fees",
  ],
  description: "Claim earned fees and rewards from Byreal CLMM positions",
  examples: [
    [
      {
        input: { nftMints: ["NftMint1...", "NftMint2..."] },
        output: {
          status: "success",
          message: "Fees claimed successfully on Byreal",
        },
        explanation: "Claim fees from two Byreal positions",
      },
    ],
  ],
  schema: z.object({
    nftMints: z
      .array(z.string())
      .describe("NFT mint addresses of positions to claim fees from"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await byrealClaimFees(agent, input.nftMints);
      return {
        status: "success",
        message: "Fees claimed successfully on Byreal",
        transaction: result,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to claim Byreal fees: ${error.message}`,
      };
    }
  },
};
