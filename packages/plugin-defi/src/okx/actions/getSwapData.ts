import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { getSwapData } from "../tools/get_swap_data";

const getSwapDataAction: Action = {
  name: "OKX_GET_SWAP_DATA",
  description: "Get swap instruction data from okx dex",
  similes: [
    "get swap data from okx dex",
    "get swap instruction from okx dex",
    "get swap data from okx",
    "get swap instruction from okx",
  ],
  examples: [
    [
      {
        input: {
          chainId: "501", // Solana
          fromTokenAddress: "So11111111111111111111111111111111111111112",
          toTokenAddress: "7Uuzh9JwqF8z3u6MWpQuQJbpD1u46xPDY6PGjwfwTh4o",
          userWalletAddress: "B2cCedQDK9P5oZLaH3p4vKK3SUthG1mVhV4n5f45mZcS",
          amount: "100000000",
          slippage: "0.2",
        },
        output: {
          routerResult: {
            chainId: "501",
            chainIndex: "501",
            dexRouterList: [
              {
                router:
                  "so11111111111111111111111111111111111111112--7uuzh9jwqf8z3u6mwpquqjbpd1u46xpdy6pgjwfwth4o",
                routerPercent: "100",
                subRouterList: [
                  {
                    dexProtocol: [{ dexName: "Raydium", percent: "100" }],
                    fromToken: {
                      decimal: "9",
                      isHoneyPot: false,
                      taxRate: "0",
                      tokenContractAddress:
                        "So11111111111111111111111111111111111111112",
                      tokenSymbol: "wSOL",
                      tokenUnitPrice: "168.301071040250708173",
                    },
                    toToken: {
                      decimal: "6",
                      isHoneyPot: false,
                      taxRate: "0",
                      tokenContractAddress:
                        "7Uuzh9JwqF8z3u6MWpQuQJbpD1u46xPDY6PGjwfwTh4o",
                      tokenSymbol: "HOMO",
                      tokenUnitPrice: "0.000979689976736634",
                    },
                  },
                ],
              },
            ],
            estimateGasFee: "147000",
            fromToken: {
              decimal: "9",
              isHoneyPot: false,
              taxRate: "0",
              tokenContractAddress:
                "So11111111111111111111111111111111111111112",
              tokenSymbol: "wSOL",
              tokenUnitPrice: "168.301071040250708173",
            },
            fromTokenAmount: "1000000000",
            priceImpactPercentage: "-0.33",
            quoteCompareList: [
              {
                amountOut: "171223.192057",
                dexLogo:
                  "https://static.okx.com/cdn/explorer/dex/logo/Raydium.png",
                dexName: "Raydium",
                tradeFee: "0.00000012336975",
              },
            ],
            swapMode: "exactIn",
            toToken: {
              decimal: "6",
              isHoneyPot: false,
              taxRate: "0",
              tokenContractAddress:
                "7Uuzh9JwqF8z3u6MWpQuQJbpD1u46xPDY6PGjwfwTh4o",
              tokenSymbol: "HOMO",
              tokenUnitPrice: "0.000979689976736634",
            },
            toTokenAmount: "171223192057",
            tradeFee: "0.00083925",
          },
          tx: {
            data: "3UfFcAn6toX6QG3XuYGFA24PKaK4o62QKQQTD4fBR1U7nKPurhPBnLWXZsAymchhkAM9kHJKM3moahBMR9sJUmGHdL59gxq6PXidgJ5e7FUuePqzCRyutowo5qXSGARUpuJ46eMcXG2SgFo3pHx1bi3WHnJMydkj3UfEJcmRQrKyzYQGeAP9njjB1QbRcUudt94XS735Ns66nTrwQDQhDfL9yicAsiwkNSGC7nDcxrNiPJzBF4RaEFPJDJEsbWuQMbxtx4BQDxyWpp19Vz2vLHMJCVM6JnvUBWvvuhwmqBo9AGhNMXDMqSmx88ZtiNrXEYyNBdnjjAKpA5BYo1KDsZd8sKiT37SwCS75bMwBDo4TSJ6K3Uja3jxbLUoYf8RgdK193aKXCjxACoufHm48rKchfqvkndFRNzrQB2aivvHkhmMfQVBeX8D4pnKpQD68JgPPcZg69Ynxe8A7fYQFgmENs4XHdUpLyjhMver3S4erQA13HGMZuogxVAtudYtgGfW8kCsrWRf5KSwtudwdg6tEM3s5qa2QBEo4JSp8MjdhJ6dcbFLWbfVLkNtfAhZF7YJ4NkMv59s6hKwAFh75asVMJDisNKBMacbQcy6UZozVaVB2HbfaHPgsBR8b93r2F35k1y6Cx9QSyL5eHvKQPxo9TXWnP3sP6ZJqac3eouQA2NPyyxKnpgZLhyGbnRepujmRqBWa1thp7k6AGqu3VXtjL2HmyGTg6",
            from: "4tboS59kqTJegRc88YWxfeydX7azATz6CxQaCZWJSgFw",
            gas: "18957",
            gasPrice: "146692000000000",
            maxPriorityFeePerGas: "",
            maxSpendAmount: "1000000000",
            minReceiveAmount: "154100872851",
            signatureData: [""],
            slippage: "0.1",
            to: "6m2CDdhRgxpH4WjvdzxAYbGxwdGUz5MziiL5jek2kBma",
            value: "0",
          },
        },
        explanation: "get swap instruction data from okx dex",
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
    userWalletAddress: z.string().describe("The account of user"),
    amount: z.string().describe("Token amount for the quote."),
    slippage: z.string().describe("Slippage limit"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const {
        chainId,
        fromTokenAddress,
        toTokenAddress,
        userWalletAddress,
        amount,
        slippage,
      } = input;

      const result = await getSwapData(
        agent,
        chainId,
        fromTokenAddress,
        toTokenAddress,
        userWalletAddress,
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

export default getSwapDataAction;
