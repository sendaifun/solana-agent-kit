import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { getQuote } from "../tools/get_quote";

const getQuoteAction: Action = {
  name: "OKX_GET_QUOTE",
  description: "Get quote data from okx dex",
  similes: [
    "get quote data from okx dex",
    "get quote data from okx",
    "fetch quote data from okx dex",
    "fetch quote data from okx",
  ],
  examples: [
    [
      {
        input: {
          chainId: "501", // Solana
          fromTokenAddress: "7Uuzh9JwqF8z3u6MWpQuQJbpD1u46xPDY6PGjwfwTh4o",
          toTokenAddress: "So11111111111111111111111111111111111111112",
          amount: "100000000",
          slippage: "0.2",
        },
        output: {
          chainId: "501",
          chainIndex: "501",
          dexRouterList: [
            {
              router:
                "7uuzh9jwqf8z3u6mwpquqjbpd1u46xpdy6pgjwfwth4o--so11111111111111111111111111111111111111112",
              routerPercent: "100",
              subRouterList: [
                {
                  dexProtocol: [{ dexName: "Raydium", percent: "100" }],
                  fromToken: {
                    decimal: "6",
                    isHoneyPot: false,
                    taxRate: "0",
                    tokenContractAddress:
                      "7Uuzh9JwqF8z3u6MWpQuQJbpD1u46xPDY6PGjwfwTh4o",
                    tokenSymbol: "HOMO",
                    tokenUnitPrice: "0.000695517267561216",
                  },
                  toToken: {
                    decimal: "9",
                    isHoneyPot: false,
                    taxRate: "0",
                    tokenContractAddress:
                      "So11111111111111111111111111111111111111112",
                    tokenSymbol: "wSOL",
                    tokenUnitPrice: "168.132422067469725694",
                  },
                },
              ],
            },
          ],
          estimateGasFee: "147000",
          fromToken: {
            decimal: "6",
            isHoneyPot: false,
            taxRate: "0",
            tokenContractAddress:
              "7Uuzh9JwqF8z3u6MWpQuQJbpD1u46xPDY6PGjwfwTh4o",
            tokenSymbol: "HOMO",
            tokenUnitPrice: "0.000695517267561216",
          },
          fromTokenAmount: "1000000",
          priceImpactPercentage: "-0.48",
          quoteCompareList: [
            {
              amountOut: "0.000004117",
              dexLogo:
                "https://static.okx.com/cdn/explorer/dex/logo/Raydium.png",
              dexName: "Raydium",
              tradeFee: "0.0000001234506",
            },
          ],
          swapMode: "exactIn",
          toToken: {
            decimal: "9",
            isHoneyPot: false,
            taxRate: "0",
            tokenContractAddress: "So11111111111111111111111111111111111111112",
            tokenSymbol: "wSOL",
            tokenUnitPrice: "168.132422067469725694",
          },
          toTokenAmount: "4117",
          tradeFee: "0.0008401",
        },
        explanation: "get token quote data from okx dex",
      },
    ],
  ],
  schema: z.object({
    chainId: z.string().describe("Unique identifier for the chain"),
    fromTokenAddress: z
      .string()
      .describe("Address of the mint account being swapped from"),
    toTokenAddress: z
      .string()
      .describe("Address of the mint account being swapped to"),
    amount: z.string().describe("Token amount for the quote."),
    slippage: z.string().describe("Slippage limit"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { chainId, fromTokenAddress, toTokenAddress, amount, slippage } =
        input;

      const result = await getQuote(
        agent,
        chainId,
        fromTokenAddress,
        toTokenAddress,
        amount,
        slippage
      );

      return {
        status: "success",
        message: "Successfully get swap instructions",
        data: result,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get swap data from okx ${error.message}`,
        code: error.code || "OKX_GET_SWAP_DATA",
      };
    }
  },
};

export default getQuoteAction;
