import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { claimWithheldTokensToMint } from "../../tools";
import { Action } from "../../types";
import ClaimWithheldTokensAction from "./claim_withheld_tokens";

// Action for harvesting withheld tokens to mint
const claimWithheldTokensToMintAction: Action = {
  name: "CLAIM_WITHHELD_TOKENS_TO_MINT_ACTION",
  similes: [
    "harvest withheld tokens to mint",
    "collect tokens to mint account",
    "gather withheld tokens into mint",
    "consolidate withheld tokens to mint",
  ],
  description:
    "Harvests withheld tokens from source accounts to the mint (permissionless operation).",
  examples: [
    [
      {
        input: {
          mint: "Exneu2TBk8Jo45AAFJ43PKH1ZDCVD9mbzHM1CvnFT94i",
          srcAccounts: ["Account1PubKey", "Account2PubKey"],
        },
        output: {
          status: "success",
          signatures: [
            "2wzm8Skitg3ucvVxcPSLzj7oCgz6foLG4NiuExtjU856w8MWQ6y7gYsFjxXGezFP3S79gXKAp8duaBgNa4StnSLQ",
          ],
        },
        explanation: "Harvest withheld tokens from accounts to the mint",
      },
    ],
  ],
  schema: z.object({
    mint: z.string(),
    srcAccounts: z.array(z.string()),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const signatures = await claimWithheldTokensToMint(
        agent,
        new PublicKey(input.mint),
        input.srcAccounts.map((acc: string) => new PublicKey(acc)),
      );
      return {
        status: "success",
        signatures,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to harvest tokens to mint: ${error.message}`,
      };
    }
  },
};

export default claimWithheldTokensToMintAction;
