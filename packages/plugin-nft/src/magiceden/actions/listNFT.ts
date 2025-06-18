import { Action } from "solana-agent-kit";
import { list_nft_on_magiceden } from "../tools/list_nft";
import { z } from "zod";

const listMagicEdenNFTAction: Action = {
  name: "LIST_MAGICEDEN_NFT",
  description: "List an NFT for sale on MagicEden",
  similes: [
    "list nft",
    "sell nft",
    "put nft for sale",
    "offer nft",
    "magiceden list nft",
  ],
  examples: [
    [
      {
        input: {
          tokenMint: "TOKEN_MINT_ADDRESS",
          tokenAccount: "TOKEN_ACCOUNT_ADDRESS",
          price: 1.5, // Price in SOL
          auctionHouseAddress: "AUCTION_HOUSE_ADDRESS", // Optional
          sellerReferral: "SELLER_REFERRAL_ADDRESS", // Optional
        },
        output: {
          status: "success",
          message: "NFT listed successfully",
          signature: "TRANSACTION_SIGNATURE", // Transaction signature
        },
        explanation: "List an NFT for sale on MagicEden with a specified price",
      },
    ],
  ],
  schema: z.object({
    tokenMint: z.string().min(1, "Token mint address is required"),
    tokenAccount: z.string().min(1, "Token account address is required"),
    price: z.number().positive("Price must be a positive number"),
    auctionHouseAddress: z.string().optional(),
    sellerReferral: z.string().optional(),
  }),
  handler: async (agent, input: Record<string, any>) => {
    const {
      tokenMint,
      tokenAccount,
      price,
      auctionHouseAddress,
      sellerReferral,
    } = input;

    try {
      const result = await list_nft_on_magiceden(
        agent,
        tokenMint,
        tokenAccount,
        price,
        {
          auctionHouseAddress,
          sellerReferral,
        },
      );

      return {
        status: "success",
        message: "NFT listed successfully",
        signature: result.signature || result.signedTransaction,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to list NFT: ${error.message}`,
      };
    }
  },
};

export default listMagicEdenNFTAction;
