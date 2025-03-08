// src/tools/okx-dex/get_tokens.ts
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
 * Get quote for token swap on OKX DEX
 * @param agent SolanaAgentKit instance
 * @param fromTokenAddress Source token address
 * @param toTokenAddress Target token address
 * @param amount Amount to swap in base units
 * @param slippage Slippage tolerance (optional)
 * @returns Quote response
 */
export async function getQuote(
  agent: SolanaAgentKit,
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  slippage: string = "0.5"
): Promise<any> {
  try {
    const dexClient = initDexClient();
    const quote = await dexClient.dex.getQuote({
      chainId: '501',
      fromTokenAddress,
      toTokenAddress,
      amount,
      slippage
    });
    return quote;
  } catch (error: any) {
    return {
      status: "error",
      message: error.message || "Failed to get quote"
    };
  }
}