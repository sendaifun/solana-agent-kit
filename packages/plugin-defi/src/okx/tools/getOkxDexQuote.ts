// okx/tools/okx_dex_quote.ts
import { SolanaAgentKit } from "solana-agent-kit";
import axios from "axios";
import crypto from "crypto-js";

/**
 * Get a quote for swapping tokens on OKX DEX
 * @param agent SolanaAgentKit instance
 * @param fromTokenAddress Source token address
 * @param toTokenAddress Target token address
 * @param amount Amount to swap in base units
 * @param slippage Slippage tolerance (default: 0.5%)
 * @returns Quote response
 */
export async function getOkxDexQuote(
  agent: SolanaAgentKit,
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  slippage: string = "0.5"
): Promise<any> {
  try {
    
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
    });
    
    const endpoint = `/api/v5/dex/aggregator/quote?${params.toString()}`;
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
      throw new Error(`Failed to get valid quote: ${response.data?.msg || "No data"}`);
    }
    
    // Extract and format the quote data
    const quote = response.data;
    const quoteData = quote.data[0];
    
    // Format human-readable amounts
    const fromDecimal = parseInt(quoteData.fromToken?.decimal || "9");
    const toDecimal = parseInt(quoteData.toToken?.decimal || "6");
    const humanFromAmount = parseFloat(quoteData.fromTokenAmount) / Math.pow(10, fromDecimal);
    const humanToAmount = parseFloat(quoteData.toTokenAmount) / Math.pow(10, toDecimal);
    
    // Add a formatted summary to the response
    return {
      ...quote,
      summary: {
        fromToken: quoteData.fromToken?.tokenSymbol || fromTokenAddress,
        toToken: quoteData.toToken?.tokenSymbol || toTokenAddress,
        fromAmount: humanFromAmount,
        toAmount: humanToAmount,
        exchangeRate: humanToAmount / humanFromAmount,
        priceImpact: quoteData.priceImpactPercentage || "0",
      }
    };
  } catch (error: any) {
    console.error("Quote error:", error);
    return {
      status: "error",
      message: error.message || "Failed to get quote",
      details: error.response?.data || error.stack
    };
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

/**
 * Export the tool
 */
export * from "./getOkxDexQuote";