import { SolanaAgentKit } from "../../index";
import { initDexClient } from "./utils";

/**
 * Get list of tokens supported by OKX DEX
 * @param agent SolanaAgentKit instance
 * @returns List of supported tokens
 */
export async function getTokens(agent: SolanaAgentKit): Promise<any> {
  try {
    const dexClient = initDexClient(agent);
    const tokens = await dexClient.dex.getTokens("501");

    // Format the token list for better readability
    const formattedTokens = tokens.data.map((token: any) => ({
      symbol: token.symbol,
      name: token.name,
      address: token.address,
      decimals: token.decimal,
    }));

    return {
      status: "success",
      summary: `Found ${formattedTokens.length} tokens on Solana via OKX DEX`,
      tokens: formattedTokens.slice(0, 10), // Include first 10 tokens in summary
      data: tokens,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error.message || "Failed to get tokens",
    };
  }
}
