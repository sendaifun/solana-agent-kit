import { Action } from "solana-agent-kit";
import { z } from "zod";
import { bid_on_magiceden_nft } from "../tools/bid_on_nft";

const bidOnMagicEdenNFTAction: Action = {
  name: "BID_ON_MAGICEDEN_NFT",
  description: "Place a bid on an NFT listed on MagicEden",
  similes: [
    "bid nft",
    "offer on nft",
    "magiceden bid nft",
    "place bid on nft",
    "nft auction bid",
  ],
  examples: [
    [
      {
        input: {
          tokenMint: "TOKEN_MINT_ADDRESS",
          tokenAccount: "TOKEN_ACCOUNT_ADDRESS",
          price: 0.5, // Price in SOL
          auctionHouseAddress: "AUCTION_HOUSE_ADDRESS", // Optional
        },
        output: {
          status: "success",
          message: "Bid placed successfully",
          signature: "TRANSACTION_SIGNATURE", // Transaction signature
        },
        explanation: "Place a bid of 0.5 SOL on the specified NFT",
      },
    ],
  ],
  schema: z.object({
    tokenMint: z.string().min(1, "Token mint address is required"),
    price: z.number().positive("Price must be a positive number"),
    auctionHouseAddress: z.string().optional(),
  }),
  handler: async (agent, input) => {
    const { tokenMint, price, auctionHouseAddress } = input;

    try {
      const result = await bid_on_magiceden_nft(agent, tokenMint, price, {
        auctionHouseAddress: auctionHouseAddress,
      });

      if (agent.config.signOnly) {
        return {
          signedTransaction: result.signedTransaction,
        };
      }

      return {
        status: "success",
        message: "Bid placed successfully",
        signature: result.signature,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to place bid on NFT: ${error.message}`,
      };
    }
  },
};

export default bidOnMagicEdenNFTAction;
