import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { OkxDexQuoteTool } from "./get_quote_tool";
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

export class OkxDexConfirmSwapTool extends Tool {
  name = "okx_dex_confirm_swap";
  description = `Confirm and execute a previously quoted swap on OKX DEX.

  No specific input needed. Just call the tool to confirm and execute the last quoted swap.`;

  constructor(
    private solanaKit: SolanaAgentKit,
    private quoteTool: OkxDexQuoteTool
  ) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const lastQuote = this.quoteTool.getLastQuote();
      
      if (!lastQuote) {
        return JSON.stringify({
          status: "error",
          message: "No quote has been prepared. Please get a quote first."
        });
      }

      const dexClient = initDexClient();
      const { params } = lastQuote;

      // First get token info for better reporting
      const quote = await dexClient.dex.getQuote({
        chainId: '501',
        fromTokenAddress: params.fromTokenAddress,
        toTokenAddress: params.toTokenAddress,
        amount: params.amount,
        slippage: params.slippage
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
        slippage: params.slippage,
        autoSlippage: true,
        maxAutoSlippage: "100",
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
        message: error.message || "Failed to confirm swap",
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

