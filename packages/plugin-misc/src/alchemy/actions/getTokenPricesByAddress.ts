import { z } from "zod";
import { alchemyGetTokenPricesByAddress } from "../tools";
import type {
  AlchemyAction as Action,
  AlchemyAgent as SolanaAgentKit,
} from "../types";

const alchemyGetTokenPricesByAddressAction: Action = {
  name: "ALCHEMY_GET_TOKEN_PRICES_BY_ADDRESS",
  similes: [
    "alchemy token price by address",
    "alchemy prices by address",
    "get token prices by address",
  ],
  description:
    "Fetches current token prices by network and token address from Alchemy Prices API",
  examples: [
    [
      {
        input: {
          addresses: [
            {
              network: "solana-mainnet",
              address: "So11111111111111111111111111111111111111112",
            },
          ],
        },
        output: {
          status: "success",
          prices: {
            data: [],
          },
          message: "Alchemy token prices fetched.",
        },
        explanation:
          "Fetches a token price by Solana mint address through Alchemy's Prices API.",
      },
    ],
  ],
  schema: z.object({
    addresses: z
      .array(
        z.object({
          network: z.string().min(1),
          address: z.string().min(1),
        }),
      )
      .min(1)
      .describe("Network and token address pairs"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const prices = await alchemyGetTokenPricesByAddress(
        agent,
        input.addresses,
      );

      return {
        status: "success",
        prices,
        message: "Alchemy token prices fetched.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch Alchemy token prices: ${error.message}`,
      };
    }
  },
};

export default alchemyGetTokenPricesByAddressAction;
