// SolanaMintNFTAction.ts
import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";
import { Action, ActionResult } from "../types";
import { z } from "zod";

export const SolanaMintNFTAction: Action = {
  name: "solana_mint_nft",
  similes: ["create_nft", "mint_nft"],
  description: `Mint a new NFT in a collection on Solana blockchain.

  Inputs:
  collectionMint: string (required) - The address of the collection to mint into
  name: string, eg "My NFT" (required)
  uri: string, eg "https://example.com/nft.json" (required)
  recipient?: string (optional) - The wallet to receive the NFT`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                collectionAddress: "So11111111111111111111111111111111111111112",
                uri: "https://example.com/metadata.json",
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { nftAddress: "So11111111111111111111111111111111111111112" },
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const result = await agent.mintNFT(
      new PublicKey(input.collectionMint),
      {
        name: input.name,
        uri: input.uri,
      },
      input.recipient ? new PublicKey(input.recipient) : agent.wallet_address
    );

    return {
      success: true,
      data: {
        mintAddress: result.mint.toString(),
        metadata: {
          name: input.name,
          uri: input.uri,
        },
        recipient: input.recipient || agent.wallet_address.toString()
      }
    };
  },

  validate: async (context, ...args) => {
    const input = args[0];
    try {
      const schema = z.object({
        collectionMint: z.string(),
        name: z.string(),
        uri: z.string(),
        recipient: z.string().optional()
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};