import { Action } from "solana-agent-kit";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { listNFTForSale, cancelListing } from "../tools";

const listNFTForSaleAction: Action = {
  name: "LIST_NFT_FOR_SALE",
  similes: [
    "list nft",
    "sell nft",
    "create nft listing",
    "put nft for sale",
    "list on tensor",
    "tensor list",
  ],
  description: "List an NFT for sale on Tensor marketplace",
  examples: [
    [
      {
        input: {
          nftMint: "DGxe4rqLMK9qvUK4LwwUBYyqUwxVXoWNUF9LdePpJzrh",
          price: 2.5,
        },
        output: {
          status: "success",
          signature: "2ZE7Rz...",
          message: "Successfully listed NFT for 2.5 SOL",
        },
        explanation: "List an NFT for sale on Tensor for 2.5 SOL",
      },
    ],
  ],
  schema: z.object({
    nftMint: z
      .string()
      .min(32, "Invalid NFT mint address")
      .describe("Mint address of the NFT to list"),
    price: z.number().positive().describe("Price in SOL to list the NFT for"),
  }),
  handler: async (agent, input) => {
    try {
      const tx = await listNFTForSale(
        agent,
        new PublicKey(input.nftMint),
        input.price,
      );

      return {
        status: "success",
        signature: tx,
        message: `Successfully listed NFT for ${input.price} SOL`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
      };
    }
  },
};

const cancelNFTListingAction: Action = {
  name: "CANCEL_NFT_LISTING",
  similes: [
    "cancel nft listing",
    "delist nft",
    "remove nft listing",
    "cancel tensor listing",
    "take down nft",
    "stop selling nft",
  ],
  description: "Cancel an existing NFT listing on Tensor marketplace",
  examples: [
    [
      {
        input: {
          nftMint: "DGxe4rqLMK9qvUK4LwwUBYyqUwxVXoWNUF9LdePpJzrh",
        },
        output: {
          status: "success",
          signature: "3YKpM1...",
          message: "Successfully cancelled NFT listing",
        },
        explanation: "Cancel an existing NFT listing on Tensor",
      },
    ],
  ],
  schema: z.object({
    nftMint: z
      .string()
      .min(32, "Invalid NFT mint address")
      .describe("Mint address of the NFT listing to cancel"),
  }),
  handler: async (agent, input) => {
    try {
      const tx = await cancelListing(agent, new PublicKey(input.nftMint));

      return {
        status: "success",
        transaction: tx,
        message: "Successfully cancelled NFT listing",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
      };
    }
  },
};

export { listNFTForSaleAction, cancelNFTListingAction };
