// src/langchain/okx-dex/execute_swap_tool.ts
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
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
      privateKey: process.env.SOLANA_PRIVATE_KEY!,
      walletAddress: process.env.SOLANA_WALLET_ADDRESS!
    }
  });
};

export class OkxDexSwapTool extends Tool {
  name = "okx_dex_swap";
  description = `Execute a token swap on OKX DEX.

  Inputs (JSON string):
  - fromTokenAddress: string, the source token address (required)
  - toTokenAddress: string, the target token address (required)
  - amount: string, amount to swap in token base units (required)
  - autoSlippage: boolean, use auto slippage (optional, default: true)
  - slippage: string, slippage tolerance as decimal, e.g., "0.005" for 0.5% (optional, default: "0.1")
  - maxAutoSlippageBps: string, maximum auto slippage in basis points (optional, default: "100")`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const dexClient = initDexClient();
      const params = JSON.parse(input);
      
      if (!params.fromTokenAddress || !params.toTokenAddress || !params.amount) {
        return JSON.stringify({
          status: "error",
          message: "Required parameters missing. Please provide fromTokenAddress, toTokenAddress, and amount."
        });
      }

      // First get token info for better reporting
      const quote = await dexClient.dex.getQuote({
        chainId: '501',
        fromTokenAddress: params.fromTokenAddress,
        toTokenAddress: params.toTokenAddress,
        amount: params.amount,
        slippage: params.autoSlippage !== false ? undefined : (params.slippage || "0.1")
      });

      const quoteData = quote.data[0];
      const fromAmount = parseFloat(quoteData.fromTokenAmount) / Math.pow(10, parseInt(quoteData.fromToken.decimal));
      const toAmount = parseFloat(quoteData.toTokenAmount) / Math.pow(10, parseInt(quoteData.toToken.decimal));

      // Execute the swap
      const swapResult = await dexClient.dex.executeSwap({
        chainId: '501',
        fromTokenAddress: params.fromTokenAddress,
        toTokenAddress: params.toTokenAddress,
        amount: params.amount,
        slippage: params.slippage || "0.1",
        autoSlippage: params.autoSlippage !== false,
        maxAutoSlippage: params.maxAutoSlippageBps || "100",
        userWalletAddress: this.solanaKit.wallet_address.toString()
      });

      return JSON.stringify({
        status: "success",
        summary: {
          fromToken: quoteData.fromToken.tokenSymbol,
          toToken: quoteData.toToken.tokenSymbol,
          fromAmount,
          toAmount,
          exchangeRate: toAmount / fromAmount,
          txId: swapResult.transactionId,
          explorerUrl: swapResult.explorerUrl || `https://www.okx.com/web3/explorer/sol/tx/${swapResult.transactionId}`
        },
        data: swapResult
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message || "Failed to execute swap",
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
