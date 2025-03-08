import { SolanaAgentKit } from "../../index";
import { OKXDexClient } from '@okx-dex/okx-dex-sdk';

/**
 * Execute a token swap on OKX DEX
 * @param agent SolanaAgentKit instance
 * @param fromTokenAddress Source token address
 * @param toTokenAddress Target token address
 * @param amount Amount to swap (in token base units)
 * @param slippage Slippage tolerance as a decimal (default: 0.005 = 0.5%)
 * @param autoSlippage Use auto slippage (default: true)
 * @param maxAutoSlippageBps Maximum auto slippage in basis points (default: 100 = 1%)
 * @returns Swap result with transaction ID
 */
export async function executeSwap(
  agent: SolanaAgentKit,
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  slippage: string = "0.5",
  autoSlippage: boolean = false,
  maxAutoSlippageBps: string = "100",
  userWalletAddress?: string
): Promise<any> {
  try {
    // Validate the required config parameters are present
    if (!agent.config.OKX_API_KEY || 
        !agent.config.OKX_SECRET_KEY || 
        !agent.config.OKX_API_PASSPHRASE || 
        !agent.config.OKX_PROJECT_ID) {
      throw new Error("Missing required OKX DEX configuration in agent config");
    }

    // Initialize OKX DEX client using agent's config
    const dexClient = new OKXDexClient({
      apiKey: agent.config.OKX_API_KEY,
      secretKey: agent.config.OKX_SECRET_KEY,
      apiPassphrase: agent.config.OKX_API_PASSPHRASE,
      projectId: agent.config.OKX_PROJECT_ID,
      solana: {
        connection: {
          rpcUrl: agent.connection.rpcEndpoint,
          confirmTransactionInitialTimeout: 60000
        },
        privateKey: Buffer.from(agent.wallet.secretKey).toString('base64'),
        walletAddress: agent.wallet_address.toString()
      }
    });

    // First get token info for better reporting
    const quote = await dexClient.dex.getQuote({
      chainId: '501',
      fromTokenAddress,
      toTokenAddress,
      amount,
      slippage: autoSlippage ? "0" : slippage
    });
    
    const quoteData = quote.data[0];
    const fromAmount = parseFloat(quoteData.fromTokenAmount) / Math.pow(10, parseInt(quoteData.fromToken.decimal));
    const toAmount = parseFloat(quoteData.toTokenAmount) / Math.pow(10, parseInt(quoteData.toToken.decimal));
    
    // Execute the swap
    const swapResult = await dexClient.dex.executeSwap({
      chainId: '501',
      fromTokenAddress,
      toTokenAddress,
      amount,
      slippage,
      autoSlippage,
      maxAutoSlippage: maxAutoSlippageBps,
      userWalletAddress: userWalletAddress || agent.wallet_address.toString()
    });
    
    return {
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
    };
  } catch (error: any) {
    console.error("Detailed swap error:", error);
    return {
      status: "error",
      message: error.message || "Failed to execute swap",
      details: error.response?.data || error.stack
    };
  }
}