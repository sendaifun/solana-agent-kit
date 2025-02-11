import { DEBRIDGE_API } from "../../constants";
import {
  deBridgeTokensInfoResponse,
  GetDebridgeTokensInfoParams,
  getDebridgeTokensInfoSchema,
} from "../../types";
import { SolanaAgentKit } from "../../agent";

/**
 * Get token information from a chain. Chain ID must be specified (e.g., '1' for Ethereum, '56' for BSC, '137' for Polygon).
 * For EVM chains: use 0x-prefixed address. For Solana: use base58 token address.
 *
 * @param params - Parameters for getting token info
 * @param params.chainId - Chain ID to get token information for (e.g., '1' for Ethereum, '56' for BSC)
 * @param params.tokenAddress - Optional specific token address to query information for
 * @param params.search - Optional search term to filter tokens by name or symbol
 * @returns Token information including name, symbol, and decimals
 * @throws {Error} If the API request fails or returns an error
 *
 * @example
 * ```typescript
 * // Get USDC on Ethereum
 * const ethUSDC = await getDebridgeTokensInfo({
 *   chainId: "1",
 *   search: "USDC"
 * });
 *
 * // Get USDC on BSC
 * const bscUSDC = await getDebridgeTokensInfo({
 *   chainId: "56",
 *   search: "USDC"
 * });
 * ```
 */
export async function getDebridgeTokensInfo(
  parameters: GetDebridgeTokensInfoParams,
): Promise<deBridgeTokensInfoResponse> {
  const url = `${DEBRIDGE_API}/token-list?chainId=${parameters.chainId}`;
  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
  }

  const responseData = await response.json();
  const data = responseData.tokens;

  // Define token data type
  type TokenData = {
    name: string;
    symbol: string;
    decimals: number;
  };

  // If a specific token address is provided, return just that token's info
  if (parameters.tokenAddress) {
    const tokenInfo = data[parameters.tokenAddress];
    if (!tokenInfo) {
      throw new Error(
        `Token ${parameters.tokenAddress} not found on chain ${parameters.chainId}`,
      );
    }

    return {
      tokens: {
        [parameters.tokenAddress]: {
          name: tokenInfo.name,
          symbol: tokenInfo.symbol,
          address: parameters.tokenAddress,
          decimals: tokenInfo.decimals,
        },
      },
    };
  }

  // Filter tokens by search term
  const searchTerm = parameters.search?.toLowerCase() || "";
  const tokens = Object.entries(data as Record<string, TokenData>)
    .filter(
      ([, token]: [string, TokenData]) =>
        token.symbol &&
        (!searchTerm || token.symbol.toLowerCase().includes(searchTerm)),
    )
    .reduce(
      (acc, [address, token]: [string, TokenData]) => {
        acc[address] = {
          name: token.name,
          symbol: token.symbol,
          address: address,
          decimals: token.decimals,
        };
        return acc;
      },
      {} as Record<
        string,
        {
          name: string;
          symbol: string;
          address: string;
          decimals: number;
        }
      >,
    );

  return { tokens };
}
