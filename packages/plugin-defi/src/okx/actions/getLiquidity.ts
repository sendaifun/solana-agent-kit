import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { getLiquidity } from "../tools/get_liquidity";

const getLiquidityAction: Action = {
  name: "OKX_GET_LIQUIDITY",
  description: "Get liquidity data from okx dex",
  similes: [
    "get liquidity data from okx dex",
    "get liquidity data from okx",
    "fetch liquidity data from okx dex",
    "fetch liquidity data from okx",
    "get liquidity list from okx",
    "get liquidity list from okx dex",
  ],
  examples: [
    [
      {
        input: {
          chainId: "501", // Solana
        },
        output: {
          tokens: [
            {
              decimals: "5",
              tokenContractAddress:
                "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
              tokenLogoUrl:
                "https://static.okx.com/cdn/web3/currency/token/small/70000041-inj14rry9q6dym3dgcwzq79yay0e9azdz55jr465ch-96?v=1743619214132",
              tokenName: "Bonk",
              tokenSymbol: "Bonk",
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

      const tokens = await getLiquidity(agent, chainId);

      return {
        status: "success",
        message: "Successfully fetch liquidities",
        tokens,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get liquidity from okx ${error.message}`,
        code: error.code || "OKX_GET_LIQUIDITY",
      };
    }
  },
};

export default getLiquidityAction;
