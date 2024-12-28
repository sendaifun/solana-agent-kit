import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";
import { Action, ActionResult } from "../types";
import { z } from "zod";

export const SolanaTransferAction: Action = {
  name: "solana_transfer",
  similes: ["send_tokens", "transfer_sol"],
  description: `Transfer tokens or SOL to another address ( also called as wallet address ).

  Inputs ( input is a JSON string ):
  to: string, eg "8x2dR8Mpzuz2YqyZyZjUbYWKSWesBo5jMx2Q9Y86udVk" (required)
  amount: number, eg 1 (required)
  mint?: string, eg "So11111111111111111111111111111111111111112" or "SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa" (optional)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                to: "8x2dR8Mpzuz2YqyZyZjUbYWKSWesBo5jMx2Q9Y86udVk",
                amount: 1,
                mint: "So11111111111111111111111111111111111111112",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: { success: true, data: { transactionId: "5G9f8..." } },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const convert = async (): Promise<ActionResult> => {
      const recipient = new PublicKey(input.to);
      const mintAddress = input.mint ? new PublicKey(input.mint) : undefined;
      const tx = await agent.transfer(recipient, input.amount, mintAddress);
      const result: ActionResult = {
        success: true,
        data: { transactionId: tx },
      };
      return result;
    };
    return convert();
  },

  validate: async (context, ...args) => {
    const input = args[0];
    try {
      const schema = z.object({
        to: z.string(),
        amount: z.number(),
        mint: z.string().optional(),
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
