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
      privateKey: process.env.OKX_SOLANA_PRIVATE_KEY!,
      walletAddress: process.env.OKX_SOLANA_WALLET_ADDRESS!
    }
  });
};

export class OkxDexQuoteTool extends Tool {
  name = "okx_dex_quote";
  description = `Get a quote for swapping tokens on OKX DEX.

  Inputs (JSON string):
  - fromTokenAddress: string, the source token address (required)
  - toTokenAddress: string, the target token address (required)
  - amount: string, amount to swap in token base units (required)
  - slippage: string, slippage tolerance as decimal, e.g., "0.001" for 0.1% (optional)`;

  private lastQuote: any = null;

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

      const quote = await dexClient.dex.getQuote({
        chainId: '501', // Solana Chain ID
        fromTokenAddress: params.fromTokenAddress,
        toTokenAddress: params.toTokenAddress,
        amount: params.amount,
        slippage: params.slippage || "0.001"
      });

      // Format quote result for better readability
      const quoteData = quote.data[0];
      const fromAmount = parseFloat(quoteData.fromTokenAmount) / Math.pow(10, parseInt(quoteData.fromToken.decimal));
      const toAmount = parseFloat(quoteData.toTokenAmount) / Math.pow(10, parseInt(quoteData.toToken.decimal));

      // Store for later use
      this.lastQuote = {
        params: {
          fromTokenAddress: params.fromTokenAddress,
          toTokenAddress: params.toTokenAddress,
          amount: params.amount,
          slippage: params.slippage || "0.001"
        },
        result: quote
      };

      return JSON.stringify({
        status: "success",
        summary: {
          fromToken: quoteData.fromToken.tokenSymbol,
          toToken: quoteData.toToken.tokenSymbol,
          fromAmount,
          toAmount,
          exchangeRate: toAmount / fromAmount,
          priceImpact: quoteData.priceImpactPercentage || "Unknown"
        },
        data: quote
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message || "Failed to get quote",
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }

  getLastQuote(): any {
    return this.lastQuote;
  }
}
