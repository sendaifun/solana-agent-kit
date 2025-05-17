// okx/tools/getOkxSwap.ts
import { SolanaAgentKit } from "solana-agent-kit";
import axios from "axios";
import crypto from "crypto-js";
import { VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";

/**
 * Execute a swap on OKX DEX
 * @param agent SolanaAgentKit instance
 * @param fromTokenAddress Source token address
 * @param toTokenAddress Target token address
 * @param amount Amount to swap in base units
 * @param slippage Slippage tolerance (default: 0.5%)
 * @param userWalletAddress User's wallet address
 * @param swapReceiverAddress Optional recipient address (defaults to userWalletAddress)
 * @param feePercent Optional fee percentage for referrer (0-10 for Solana)
 * @param fromTokenReferrerWalletAddress Optional referrer address for fromToken fee
 * @param toTokenReferrerWalletAddress Optional referrer address for toToken fee
 * @param positiveSlippagePercent Optional positive slippage percentage (0-10)
 * @param computeUnitPrice Optional compute unit price for Solana
 * @param computeUnitLimit Optional compute unit limit for Solana
 * @param directRoute Optional flag to restrict to single liquidity pool
 * @param priceImpactProtectionPercentage Optional price impact protection (0-1)
 * @param execute Flag to indicate if the swap should be executed
 * @returns Swap response
 */
export async function getOkxSwap(
  agent: SolanaAgentKit,
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  slippage: string = "0.5",
  userWalletAddress: string,
  swapReceiverAddress?: string,
  feePercent?: string,
  fromTokenReferrerWalletAddress?: string,
  toTokenReferrerWalletAddress?: string,
  positiveSlippagePercent?: string,
  computeUnitPrice?: string,
  computeUnitLimit?: string,
  directRoute?: boolean,
  priceImpactProtectionPercentage?: string,
  execute: boolean = false
): Promise<any> {
  try {
    if (execute) {    }
    
    // Build API request
    const timestamp = new Date().toISOString();
    const method = "GET";
    const chainId = "501"; // Solana chain ID
    
    // Create query parameters
    const params = new URLSearchParams({
      chainId,
      fromTokenAddress,
      toTokenAddress,
      amount: amount.toString(),
      slippage,
      userWalletAddress,
    });

    // Add optional parameters if provided
    if (swapReceiverAddress) params.append('swapReceiverAddress', swapReceiverAddress);
    if (feePercent) params.append('feePercent', feePercent);
    if (fromTokenReferrerWalletAddress) params.append('fromTokenReferrerWalletAddress', fromTokenReferrerWalletAddress);
    if (toTokenReferrerWalletAddress) params.append('toTokenReferrerWalletAddress', toTokenReferrerWalletAddress);
    if (positiveSlippagePercent) params.append('positiveSlippagePercent', positiveSlippagePercent);
    if (computeUnitPrice) params.append('computeUnitPrice', computeUnitPrice);
    if (computeUnitLimit) params.append('computeUnitLimit', computeUnitLimit);
    if (directRoute !== undefined) params.append('directRoute', directRoute.toString());
    if (priceImpactProtectionPercentage) params.append('priceImpactProtectionPercentage', priceImpactProtectionPercentage);
    
    const endpoint = `/api/v5/dex/aggregator/swap?${params.toString()}`;
    const baseURL = "https://web3.okx.com";
    
    // Generate headers for authentication
    const headers = getOkxHeaders(
      agent.config.OKX_API_KEY!,
      agent.config.OKX_SECRET_KEY!,
      agent.config.OKX_API_PASSPHRASE!,
      agent.config.OKX_PROJECT_ID || "",
      timestamp, 
      method, 
      endpoint
    );
    
    // Make API request
    const response = await axios({
      method,
      url: `${baseURL}${endpoint}`,
      headers,
    });
    
    // Validate response
    if (!response.data || response.data.code !== "0" || !response.data.data || !response.data.data[0]) {
      throw new Error(`Failed to execute swap: ${response.data?.msg || "No data"}`);
    }
    
    // Extract and format the swap data
    const swapData = response.data.data[0];
    
    // Format human-readable amounts
    const fromDecimal = parseInt(swapData.fromToken?.decimal || "9");
    const toDecimal = parseInt(swapData.toToken?.decimal || "6");
    const humanFromAmount = parseFloat(swapData.fromTokenAmount) / Math.pow(10, fromDecimal);
    const humanToAmount = parseFloat(swapData.toTokenAmount) / Math.pow(10, toDecimal);
    
    // Add a formatted summary to the response
    const formattedResponse = {
      ...swapData,
      summary: {
        fromToken: swapData.fromToken?.tokenSymbol || fromTokenAddress,
        toToken: swapData.toToken?.tokenSymbol || toTokenAddress,
        fromAmount: humanFromAmount,
        toAmount: humanToAmount,
        exchangeRate: humanToAmount / humanFromAmount,
        priceImpact: swapData.priceImpactPercentage || "0",
        tradeFee: swapData.tradeFee,
        estimateGasFee: swapData.estimateGasFee,
      }
    };

    // If we have transaction data, prepare it for signing
    if (swapData.tx?.data) {
      try {
        // Decode the base58 encoded transaction data
        const decodedTransaction = bs58.decode(swapData.tx.data);
        
        // Try to deserialize as a versioned transaction
        const transaction = VersionedTransaction.deserialize(decodedTransaction);
        
        // Return the prepared transaction for signing
        return {
          ...formattedResponse,
          preparedTransaction: transaction
        };
      } catch (error: any) {
        console.error("Error preparing transaction:", error);
        throw new Error(`Failed to prepare transaction: ${error.message}`);
      }
    }

    return formattedResponse;
  } catch (error: any) {
    console.error("Swap error:", error);
    return {
      status: "error",
      message: error.message || "Failed to execute swap",
      details: error.response?.data || error.stack
    };
  }
}

/**
 * Execute a prepared swap transaction
 * @param agent SolanaAgentKit instance
 * @param preparedTransaction The prepared transaction from getOkxSwap
 * @returns Transaction signature
 */
export async function executeSwapTransaction(
  agent: SolanaAgentKit,
  preparedTransaction: VersionedTransaction
): Promise<string> {
  try {
    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await agent.connection.getLatestBlockhash();
    
    // Update transaction with new blockhash
    preparedTransaction.message.recentBlockhash = blockhash;
    
    // Sign the transaction
    const signedTx = await agent.wallet.signTransaction(preparedTransaction);
    
    // Send the transaction
    const signature = await agent.connection.sendRawTransaction(signedTx.serialize());
    
    // Wait for confirmation
    await agent.connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });
    return signature;
  } catch (error: any) {
    console.error("Error executing transaction:", error);
    if (error.logs) {
      console.error("Transaction logs:", error.logs);
    }
    throw new Error(`Failed to execute transaction: ${error.message}`);
  }
}

/**
 * Generate OKX API headers for authentication
 */
function getOkxHeaders(
  apiKey: string, 
  secretKey: string, 
  apiPassphrase: string, 
  projectId: string,
  timestamp: string, 
  method: string, 
  requestPath: string, 
  body: string = ""
): Record<string, string> {
  const stringToSign = timestamp + method + requestPath + body;
  
  return {
    "Content-Type": "application/json",
    "OK-ACCESS-KEY": apiKey,
    "OK-ACCESS-SIGN": crypto.enc.Base64.stringify(
      crypto.HmacSHA256(stringToSign, secretKey)
    ),
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-PASSPHRASE": apiPassphrase,
    "OK-ACCESS-PROJECT": projectId,
  };
}

export * from "./getOkxSwap";