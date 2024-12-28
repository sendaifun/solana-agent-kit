import { SolanaAgentKit } from "../agent";
import { Action } from "../types";
import { z } from "zod";

export const SolanaCompressedAirdropAction: Action = {
  name: "solana_compressed_airdrop",
  similes: ["compressed_airdrop", "airdrop_tokens"],
  description: `Airdrop SPL tokens with ZK Compression.

  Inputs:
  mintAddress: string (required)
  amount: number (required)
  decimals: number (required)
  recipients: string[] (required)
  priorityFeeInLamports?: number (optional, default: 30000)
  shouldLog?: boolean (optional, default: false)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                mintAddress: "So11111111111111111111111111111111111111112",
                amount: 100,
                decimals: 9,
                recipients: ["addr1", "addr2"]
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { transactionId: "5G9f8..." },
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const txs = await agent.sendCompressedAirdrop(
      input.mintAddress,
      input.amount,
      input.decimals,
      input.recipients,
      input.priorityFeeInLamports || 30000,
      input.shouldLog || false,
    );

    return {
      success: true,
      data: {
        transactionHashes: txs,
        message: `Airdropped ${input.amount} tokens to ${input.recipients.length} recipients.`
      },
    };
  },

  validate: async (context, ...args) => {
    const input = args[0];
    try {
      const schema = z.object({
        mintAddress: z.string(),
        amount: z.number().positive(),
        decimals: z.number().int().min(0),
        recipients: z.array(z.string()),
        priorityFeeInLamports: z.number().optional(),
        shouldLog: z.boolean().optional(),
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
