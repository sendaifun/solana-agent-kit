import { SolanaAgentKit } from "../../index";
import { OKXDexClient } from '@okx-dex/okx-dex-sdk';
import * as dotenv from "dotenv";

dotenv.config();

// Initialize the OKX DEX client
const initDexClient = () => {
  return new OKXDexClient({
    apiKey: process.env.OKX_API_KEY!,
    secretKey: process.env.OKX_SECRET_KEY!,
    apiPassphrase: process.env.OKX_API_PASSPHRASE!,
    projectId: process.env.OKX_PROJECT_ID!,
    solana: {
      connection: {
        rpcUrl: process.env.RPC_URL!,
        confirmTransactionInitialTimeout: 60000
      },
      privateKey: process.env.OKX_SOLANA_PRIVATE_KEY!,
      walletAddress: process.env.OKX_SOLANA_WALLET_ADDRESS!
    }
  });
};

/**
 * Get list of tokens supported by OKX DEX
 * @param agent SolanaAgentKit instance
 * @returns List of supported tokens
 */
export async function getTokens(agent: SolanaAgentKit): Promise<any> {
  try {
    // Initialize a new OKX DEX client
    const dexClient = initDexClient();
    const tokens = await dexClient.dex.getTokens('501');

    // Format the token list for better readability
    const formattedTokens = tokens.data.map((token: any) => ({
      symbol: token.symbol,
      name: token.name,
      address: token.address,
      decimals: token.decimal
    }));

    return {
      status: "success",
      summary: `Found ${formattedTokens.length} tokens on Solana via OKX DEX`,
      tokens: formattedTokens.slice(0, 10), // Include first 10 tokens in summary
      data: tokens
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error.message || "Failed to get tokens"
    };
  }
}