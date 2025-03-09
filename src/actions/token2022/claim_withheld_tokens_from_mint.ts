import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { claimWithheldTokensFromMint } from "../../tools";
import { Action } from "../../types";

// Action for claiming withheld tokens from mint only
const ClaimWithheldTokensFromMintAction: Action = {
  name: "CLAIM_WITHHELD_TOKENS_FROM_MINT_ACTION",
  similes: [
    "claim withheld tokens from mint",
    "withdraw tokens from mint account",
    "collect withheld tokens from mint",
    "gather mint withheld tokens",
  ],
  description: "Claims withheld tokens specifically from the mint account.",
  examples: [
    [
      {
        input: {
          mint: "Exneu2TBk8Jo45AAFJ43PKH1ZDCVD9mbzHM1CvnFT94i",
          payer: "PayerPubKey",
        },
        output: {
          status: "success",
          signature:
            "2wzm8Skitg3ucvVxcPSLzj7oCgz6foLG4NiuExtjU856w8MWQ6y7gYsFjxXGezFP3S79gXKAp8duaBgNa4StnSLQ",
        },
        explanation: "Claim withheld tokens from the mint account",
      },
    ],
  ],
  schema: z.object({
    mint: z.string(),
    payer: z.string().optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const signature = await claimWithheldTokensFromMint(
        agent,
        new PublicKey(input.mint),
        input.payer ? new PublicKey(input.payer) : undefined,
      );
      return {
        status: "success",
        signature,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to claim tokens from mint: ${error.message}`,
      };
    }
  },
};
