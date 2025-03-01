import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { claimWithheldTokens } from "../../tools";
import { Action } from "../../types";

// Action for claiming all withheld tokens
const ClaimWithheldTokensAction: Action = {
  name: "CLAIM_WITHHELD_TOKENS_ACTION",
  similes: [
    "claim all withheld tokens from accounts and mint",
    "withdraw all withheld tokens",
    "collect all withheld tokens",
    "gather withheld tokens from all sources",
  ],
  description: `Claims all withheld tokens from both the mint and specified source accounts.
    If no payer is provided, then the agent's wallet address is used as the payer.`,
  examples: [
    [
      {
        input: {
          mint: "Exneu2TBk8Jo45AAFJ43PKH1ZDCVD9mbzHM1CvnFT94i",
          authority: "JANiiyQqkoH5RqQAhZzQTE4aDWbWobaXv9V9pnxqSGjy",
          srcAccounts: ["Account1PubKey", "Account2PubKey"],
          payer: "PayerPubKey",
        },
        output: {
          status: "success",
          signatures: [
            "2wzm8Skitg3ucvVxcPSLzj7oCgz6foLG4NiuExtjU856w8MWQ6y7gYsFjxXGezFP3S79gXKAp8duaBgNa4StnSLQ",
          ],
        },
        explanation:
          "Claim all withheld tokens from specified accounts and mint",
      },
    ],
  ],
  schema: z.object({
    mint: z.string(),
    authority: z.string(),
    srcAccounts: z.array(z.string()),
    payer: z.string().optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const signatures = await claimWithheldTokens(
        agent,
        new PublicKey(input.mint),
        new PublicKey(input.authority),
        input.srcAccounts.map((acc: string) => new PublicKey(acc)),
        input.payer ? new PublicKey(input.payer) : undefined,
      );
      return {
        status: "success",
        signatures,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to claim withheld tokens: ${error.message}`,
      };
    }
  },
};

export default ClaimWithheldTokensAction;
