import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { fetchPrice } from "../../tools/jupiter";

const fetchPriceAction: Action = {
  name: "FETCH_PRICE",
  similes: [
    "get token price",
    "check price",
    "token value",
    "price check",
    "get price in usd",
  ],
  description:
    "Fetch the current price of a Solana token in USDC using Jupiter API",
  examples: [
    [
      {
        input: {
          tokenAddress: "So11111111111111111111111111111111111111112",
        },
        output: {
          status: "success",
          price: "23.45",
          message: "Current price: $23.45 USDC",
        },
        explanation: "Get the current price of SOL token in USDC",
      },
    ],
  ],
  schema: z.object({
    tokenAddress: z
      .string()
      .describe("The mint address of the token to fetch the price for"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const tokenId = new PublicKey(input.tokenAddress);
      const price = await fetchPrice(tokenId);

      return {
        status: "success",
        price,
        message: `Current price: $${price} USDC`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch price: ${error.message}`,
      };
    }
  },
};

export default fetchPriceAction;
