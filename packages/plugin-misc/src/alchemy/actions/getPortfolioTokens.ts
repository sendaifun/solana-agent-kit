import { z } from "zod";
import { alchemyGetPortfolioTokens } from "../tools";
import type {
  AlchemyAction as Action,
  AlchemyAgent as SolanaAgentKit,
} from "../types";

const alchemyGetPortfolioTokensAction: Action = {
  name: "ALCHEMY_GET_PORTFOLIO_TOKENS",
  similes: [
    "alchemy portfolio tokens",
    "get wallet tokens from alchemy",
    "alchemy token balances",
    "get spl balances from alchemy",
  ],
  description:
    "Fetches wallet token balances, metadata, and prices from Alchemy Portfolio API",
  examples: [
    [
      {
        input: {
          walletAddress: "86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY",
          network: "solana-mainnet",
          withMetadata: true,
          withPrices: true,
        },
        output: {
          status: "success",
          tokens: {
            data: {
              tokens: [],
            },
          },
          message: "Alchemy portfolio tokens fetched.",
        },
        explanation:
          "Fetches Solana wallet token balances with metadata and prices.",
      },
    ],
  ],
  schema: z.object({
    walletAddress: z.string().min(1).describe("Wallet address to query"),
    network: z
      .string()
      .optional()
      .describe("Network to query, defaulting to solana-mainnet"),
    withMetadata: z
      .boolean()
      .optional()
      .describe("Whether to include token metadata"),
    withPrices: z.boolean().optional().describe("Whether to include prices"),
    includeNativeTokens: z
      .boolean()
      .optional()
      .describe("Whether to include native tokens"),
    includeErc20Tokens: z
      .boolean()
      .optional()
      .describe("Whether to include fungible token balances"),
    pageKey: z.string().optional().describe("Pagination page key"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const tokens = await alchemyGetPortfolioTokens(agent, {
        addresses: [
          {
            address: input.walletAddress,
            networks: [input.network ?? "solana-mainnet"],
          },
        ],
        withMetadata: input.withMetadata ?? true,
        withPrices: input.withPrices ?? true,
        includeNativeTokens: input.includeNativeTokens ?? true,
        includeErc20Tokens: input.includeErc20Tokens ?? true,
        pageKey: input.pageKey,
      });

      return {
        status: "success",
        tokens,
        message: "Alchemy portfolio tokens fetched.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch Alchemy portfolio tokens: ${error.message}`,
      };
    }
  },
};

export default alchemyGetPortfolioTokensAction;
