import { SolanaAgentKit } from "../../index";
import { initDexClient } from "./utils";

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
  userWalletAddress?: string,
): Promise<any> {
  try {
    console.log("\nDebug - OKX DEX Swap Execution:");
    console.log("  From token:", fromTokenAddress);
    console.log("  To token:", toTokenAddress);
    console.log("  Amount:", amount);
    console.log("  Amount type:", typeof amount);
    console.log(
      "  User wallet:",
      userWalletAddress || agent.wallet_address.toString(),
    );

    const dexClient = initDexClient(agent);

    // First get token info for better reporting
    console.log("\nDebug - Getting quote for swap...");
    const quote = await dexClient.dex.getQuote({
      chainId: "501",
      fromTokenAddress,
      toTokenAddress,
      amount,
      slippage: autoSlippage ? "0" : slippage,
    });

    console.log("\nDebug - Quote response:", JSON.stringify(quote, null, 2));

    const quoteData = quote.data[0];
    const fromAmount =
      parseFloat(quoteData.fromTokenAmount) /
      Math.pow(10, parseInt(quoteData.fromToken.decimal));
    const toAmount =
      parseFloat(quoteData.toTokenAmount) /
      Math.pow(10, parseInt(quoteData.toToken.decimal));

    // Ensure amount is a string
    const swapAmount = amount.toString();
    console.log("\nDebug - Executing swap with amount:", swapAmount);

    // Execute the swap
    const swapResult = await dexClient.dex.executeSwap({
      chainId: "501",
      fromTokenAddress,
      toTokenAddress,
      amount: swapAmount,
      slippage,
      autoSlippage,
      maxAutoSlippage: maxAutoSlippageBps,
      userWalletAddress: userWalletAddress || agent.wallet_address.toString(),
    });

    console.log("\nDebug - Swap result:", JSON.stringify(swapResult, null, 2));

    return {
      status: "success",
      summary: {
        fromToken: quoteData.fromToken.tokenSymbol,
        toToken: quoteData.toToken.tokenSymbol,
        fromAmount,
        toAmount,
        exchangeRate: toAmount / fromAmount,
        txId: swapResult.transactionId,
        explorerUrl:
          swapResult.explorerUrl ||
          `https://www.okx.com/web3/explorer/sol/tx/${swapResult.transactionId}`,
      },
      data: swapResult,
    };
  } catch (error: any) {
    console.error("\nDetailed swap error:", error);
    console.log("\nDebug - Error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      request: {
        fromToken: fromTokenAddress,
        toToken: toTokenAddress,
        amount: amount,
        wallet: userWalletAddress || agent.wallet_address.toString(),
      },
    });
    return {
      status: "error",
      message: error.message || "Failed to execute swap",
      details: error.response?.data || error.stack,
    };
  }
}
