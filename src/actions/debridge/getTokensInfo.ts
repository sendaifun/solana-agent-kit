import { z } from "zod";
import { Action } from "../../types/action";
import { getDebridgeTokensInfo } from "../../tools/debridge/getTokensInfo";
import { SolanaAgentKit } from "../../agent";
import { getDebridgeTokensInfoSchema } from "../../types";

const getDebridgeTokensInfoAction: Action = {
  name: "DEBRIDGE_GET_TOKENS_INFO",
  description:
    "Get information about tokens available for cross-chain bridging via deBridge protocol. First use DEBRIDGE_GET_SUPPORTED_CHAINS to get the list of valid chain IDs, then provide the chain ID from that list. For EVM chains: use 0x-prefixed address. For Solana: use base58 token address.",
  similes: [
    "list available tokens for bridging",
    "show tokens I can bridge",
    "get token information for chain",
    "what tokens can I bridge",
    "check if token is supported for bridging",
    "search for token by name",
    "find token by symbol",
  ],
  examples: [
    [
      {
        input: {
          chainId: "1",
          search: "USDC",
        },
        output: {
          status: "success",
          tokens: {
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {
              name: "USD Coin",
              symbol: "USDC",
              address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
              decimals: 6,
            },
          },
          message: "Found tokens matching 'USDC' on Ethereum",
        },
        explanation:
          "After getting chain IDs from DEBRIDGE_GET_SUPPORTED_CHAINS, search for USDC tokens on Ethereum using its chain ID",
      },
    ],
    [
      {
        input: {
          chainId: "56",
          search: "USDC",
        },
        output: {
          status: "success",
          tokens: {
            "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d": {
              name: "USD Coin",
              symbol: "USDC",
              address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
              decimals: 18,
            },
          },
          message: "Found tokens matching 'USDC' on BSC",
        },
        explanation:
          "After getting chain IDs from DEBRIDGE_GET_SUPPORTED_CHAINS, search for USDC tokens on BSC using its chain ID",
      },
    ],
  ],
  schema: getDebridgeTokensInfoSchema,
  handler: async (_agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const response = await getDebridgeTokensInfo({
        chainId: input.chainId,
        tokenAddress: input.tokenAddress,
        search: input.search,
      });

      const searchMsg = input.search ? ` matching '${input.search}'` : "";
      const chainMsg = ` on chain ${input.chainId}`;

      return {
        status: "success",
        tokens: response.tokens,
        message: `Found tokens${searchMsg}${chainMsg}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch token information: ${error.message}`,
      };
    }
  },
};

export default getDebridgeTokensInfoAction;
