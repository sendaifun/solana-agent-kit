import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { getSodaxTokens } from "../tools";

const getSodaxTokensAction: Action = {
  name: "SODAX_GET_TOKENS",
  description:
    "Fetch all swap-supported tokens from SODAX across all chains, or tokens for a specific chain. Returns a map of chain key → token list with address, symbol, and decimals.",
  similes: [
    "list sodax tokens",
    "get sodax supported tokens",
    "fetch sodax token list",
    "sodax available tokens",
    "what tokens does sodax support",
    "sodax token list for chain",
  ],
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          tokens: {
            solana: [
              {
                symbol: "SOL",
                address: "So11111111111111111111111111111111111111112",
                decimals: 9,
              },
            ],
            "0x2105.base": [
              {
                symbol: "USDC",
                address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
                decimals: 6,
              },
            ],
          },
          message: "Successfully fetched SODAX tokens",
        },
        explanation: "Fetch all SODAX-supported tokens across all chains",
      },
    ],
    [
      {
        input: { chainKey: "solana" },
        output: {
          status: "success",
          tokens: {
            solana: [
              {
                symbol: "SOL",
                address: "So11111111111111111111111111111111111111112",
                decimals: 9,
              },
            ],
          },
          message: "Successfully fetched SODAX tokens",
        },
        explanation: "Fetch SODAX tokens on Solana only",
      },
    ],
  ],
  schema: z.object({
    chainKey: z
      .string()
      .optional()
      .describe(
        'Optional chain key to filter results (e.g., "solana", "0x2105.base", "ethereum")',
      ),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const apiKey = agent.config?.SODAX_API_KEY as string | undefined;
      const tokens = await getSodaxTokens(input.chainKey, apiKey);
      return {
        status: "success",
        tokens,
        message: "Successfully fetched SODAX tokens",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch SODAX tokens: ${error.message}`,
      };
    }
  },
};

export default getSodaxTokensAction;
