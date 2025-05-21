import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { getTokens } from "../tools/get_tokens";

const getTokensAction: Action = {
  name: "OKX_GET_TOKEN",
  description: "Get token data from okx dex",
  similes: [
    "get tokens from okx dex",
    "fetch tokens from okx dex",
    "get token data from okx",
    "fetch token data from okx",
  ],
  examples: [
    [
      {
        input: {
          chainId: "501", // Solana
        },
        output: {
          liquidities: [
            {
              id: "277",
              logo: "https://static.okx.com/cdn/explorer/dex/logo/Raydium.png",
              name: "Raydium",
            },
          ],
        },
        explanation: "get token from okx dex",
      },
    ],
  ],
  schema: z.object({
    chainId: z.string().describe("Unique identifier for the chain"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { chainId } = input;

      const tokens = await getTokens(agent, chainId);

      return {
        status: "success",
        message: "Successfully fetch tokens",
        tokens,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get tokens from okx ${error.message}`,
        code: error.code || "OKX_GET_TOKEN",
      };
    }
  },
};

export default getTokensAction;
