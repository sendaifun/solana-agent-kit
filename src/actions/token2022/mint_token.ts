import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { mintToAccount } from "../../tools";
import { Action } from "../../types";

const fluxbeamMintToAccountAction: Action = {
  name: "MINT_TOKEN_TO_ACCOUNT_ACTION",
  similes: [
    "mint tokens",
    "create new tokens",
    "issue tokens",
    "mint to wallet",
    "add tokens to account",
  ],
  description: `Mints tokens to a specified owner's associated token account. 
  If the associated token account doesn't exist, it will be created automatically.
  Supports both v1 tokens (regular SPL tokens) and v2 tokens (Token-2022 tokens).`,
  examples: [
    [
      {
        input: {
          owner: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          tokenMint: "So11111111111111111111111111111111111111112",
          amount: "1000000",
          v2: true,
        },
        output: {
          status: "success",
          signature:
            "5KtP9KbhJsBzS3rSXWqtqwtSJJNgfQFJxVdNCsM5QrUMBUEHrm28GU7dw7v6vh1CyCygtZhptVHhHgywY34iDtYf",
        },
        explanation: "Mint 10000 v2 tokens to owner's associated token account",
      },
      {
        input: {
          owner: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          tokenMint: "So11111111111111111111111111111111111111112",
          amount: "1000000",
          v2: false,
        },
        output: {
          status: "success",
          signature:
            "5KtP9KbhJsBzS3rSXWqtqwtSJJNgfQFJxVdNCsM5QrUMBUEHrm28GU7dw7v6vh1CyCygtZhptVHhHgywY34iDtYf",
        },
        explanation: "Mint 10000 v1 tokens to owner's associated token account",
      },
    ],
  ],
  schema: z.object({
    tokenMint: z
      .string()
      .describe("The mint address of the token to be minted"),
    amount: z.number().describe("amount of tokens to be minted"),
    owner: z
      .string()
      .optional()
      .describe("The owner of the account that the tokens will be minted to"),
    v2: z.boolean().optional().default(true),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const signature = await mintToAccount(
        agent,
        new PublicKey(input.tokenMint),
        input.amount as number,
        new PublicKey(input.owner),
        input.v2 as boolean,
      );

      return {
        status: "success",
        signature,
      };
    } catch (error: any) {
      return {
        status: "error",
        error: `Failed to mint tokens to ${input.owner}: ${error.message}`,
      };
    }
  },
};

export default fluxbeamMintToAccountAction;
