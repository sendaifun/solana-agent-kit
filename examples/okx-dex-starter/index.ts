import { SolanaAgentKit } from "../../src/agent";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as dotenv from "dotenv";
import * as readline from "readline";

dotenv.config();

export const OKX_SOLANA_WALLET_ADDRESS = process.env.OKX_SOLANA_WALLET_ADDRESS || "";

interface TokenInfo {
  symbol: string;
  address: string;
  decimals: number;
}

// Initialize with known tokens
let tokenInfoCache: Record<string, TokenInfo> = {
  "11111111111111111111111111111111": {
    symbol: "SOL",
    address: "11111111111111111111111111111111",
    decimals: 9
  },
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": {
    symbol: "USDC",
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6
  },
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": {
    symbol: "USDT",
    address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6
  }
};

function updateTokenInfo(quote: any) {
  try {
    // Update from quote data array
    if (quote?.data?.[0]) {
      const quoteData = quote.data[0];
      if (quoteData.fromToken) {
        tokenInfoCache[quoteData.fromToken.address] = {
          symbol: quoteData.fromToken.tokenSymbol,
          address: quoteData.fromToken.address,
          decimals: parseInt(quoteData.fromToken.decimal)
        };
      }
      if (quoteData.toToken) {
        tokenInfoCache[quoteData.toToken.address] = {
          symbol: quoteData.toToken.tokenSymbol,
          address: quoteData.toToken.address,
          decimals: parseInt(quoteData.toToken.decimal)
        };
      }
    }

    // Update from compare list
    if (quote?.data?.[0]?.quoteCompareList) {
      quote.data[0].quoteCompareList.forEach((route: any) => {
        if (route.tokenIn) {
          tokenInfoCache[route.tokenIn.address] = {
            symbol: route.tokenIn.symbol,
            address: route.tokenIn.address,
            decimals: parseInt(route.tokenIn.decimals)
          };
        }
        if (route.tokenOut) {
          tokenInfoCache[route.tokenOut.address] = {
            symbol: route.tokenOut.symbol,
            address: route.tokenOut.address,
            decimals: parseInt(route.tokenOut.decimals)
          };
        }
      });
    }
  } catch (error) {
    console.error("Error updating token info:", error);
  }
}

function getTokenInfo(address: string): TokenInfo | undefined {
  return tokenInfoCache[address];
}

function formatTokenAmount(amount: string, address: string, tokenInfo?: any): string {
  try {
    const info = tokenInfo || getTokenInfo(address);
    const decimals = info?.decimals ?? 9;
    const symbol = info?.symbol || address.slice(0, 8);
    
    if (amount === "0") {
      return `0.000000 ${symbol}`;
    }

    const value = BigInt(amount);
    const divisor = BigInt(10 ** decimals);
    const integerPart = value / divisor;
    const decimalPart = value % divisor;
    
    const decimalStr = decimalPart.toString().padStart(decimals, '0');
    const formattedDecimal = decimalStr.slice(0, 6); // Show up to 6 decimal places
    
    return `${integerPart.toString()}.${formattedDecimal} ${symbol}`;
  } catch (err) {
    return `0.000000 ${address.slice(0, 8)}`;
  }
}

function validateAndFormatAmount(amount: string, address: string): { isValid: boolean; formatted: string; humanReadable: string } {
  try {
    const cleanAmount = amount.replace(/,/g, '').trim();
    
    if (!/^\d*\.?\d+$/.test(cleanAmount)) {
      return { isValid: false, formatted: "0", humanReadable: "0" };
    }

    const value = parseFloat(cleanAmount);
    if (isNaN(value) || value <= 0) {
      return { isValid: false, formatted: "0", humanReadable: "0" };
    }

    const tokenInfo = getTokenInfo(address);
    const decimals = tokenInfo?.decimals ?? 9;
    
    // Convert to base units with proper decimal handling
    const parts = cleanAmount.split('.');
    const wholePart = parts[0] || '0';
    const fractionalPart = parts[1] || '';
    
    // Pad with zeros if needed, then take correct number of decimal places
    const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
    
    // Combine whole and fractional parts
    const baseUnits = wholePart + paddedFractional;
    
    // Remove leading zeros but keep at least one digit
    const formattedBaseUnits = baseUnits.replace(/^0+/, '') || '0';

    // Format human readable amount
    const humanValue = value.toLocaleString(undefined, {
      minimumFractionDigits: Math.min(6, decimals),
      maximumFractionDigits: Math.min(6, decimals)
    });

    return {
      isValid: true,
      formatted: formattedBaseUnits,
      humanReadable: `${humanValue} ${tokenInfo?.symbol || address.slice(0, 8)}`
    };
  } catch (err) {
    return { isValid: false, formatted: "0", humanReadable: "0" };
  }
}

function formatQuoteResult(quote: any, fromAddress: string, toAddress: string): void {
  if (quote.status === "error") {
    console.log("\nQuote Error:");
    console.log("  Message:", quote.message || "Unknown error");
    return;
  }

  // Handle OKX API response structure
  const quoteData = quote.data?.[0];
  if (!quoteData) {
    console.log("\nInvalid quote response");
    return;
  }

  // Update token info cache
  updateTokenInfo(quote);

  // Update token info cache first
  if (quoteData.fromToken && quoteData.toToken) {
    tokenInfoCache[fromAddress] = {
      symbol: quoteData.fromToken.tokenSymbol,
      address: fromAddress,
      decimals: parseInt(quoteData.fromToken.decimal)
    };
    tokenInfoCache[toAddress] = {
      symbol: quoteData.toToken.tokenSymbol,
      address: toAddress,
      decimals: parseInt(quoteData.toToken.decimal)
    };
  }

  const fromSymbol = quoteData.fromToken?.tokenSymbol || getTokenInfo(fromAddress)?.symbol || fromAddress.slice(0, 8);
  const toSymbol = quoteData.toToken?.tokenSymbol || getTokenInfo(toAddress)?.symbol || toAddress.slice(0, 8);

  // Format amounts using the token decimals from the quote
  const toTokenDecimals = parseInt(quoteData.toToken?.decimal || "6");
  const expectedOutput = (parseInt(quoteData.toTokenAmount) / Math.pow(10, toTokenDecimals)).toFixed(6);
  
  // Calculate minimum output (can be adjusted based on slippage)
  const minOutput = (parseInt(quoteData.toTokenAmount) * 0.995 / Math.pow(10, toTokenDecimals)).toFixed(6);
  
  // Get price impact from the response
  const priceImpact = parseFloat(quoteData.priceImpactPercentage || "0");

  console.log("\nQuote Details:");
  console.log(`  ${fromSymbol} → ${toSymbol}`);
  console.log("  Expected Output:", `${expectedOutput} ${toSymbol}`);
  console.log("  Minimum Output:", `${minOutput} ${toSymbol}`);
  console.log("  Price Impact:", `${priceImpact.toFixed(2)}%`);
  
  // Display available routes if present
  if (quoteData.quoteCompareList && quoteData.quoteCompareList.length > 0) {
    console.log("\nAvailable Routes:");
    quoteData.quoteCompareList.forEach((route: any) => {
      console.log(`  ${route.dexName}: ${route.amountOut} ${toSymbol} (Fee: ${route.tradeFee})`);
    });
  }

  // Display token prices if available
  if (quoteData.fromToken?.tokenUnitPrice || quoteData.toToken?.tokenUnitPrice) {
    console.log("\nToken Prices:");
    if (quoteData.fromToken?.tokenUnitPrice) {
      console.log(`  ${fromSymbol}: $${parseFloat(quoteData.fromToken.tokenUnitPrice).toFixed(4)}`);
    }
    if (quoteData.toToken?.tokenUnitPrice) {
      console.log(`  ${toSymbol}: $${parseFloat(quoteData.toToken.tokenUnitPrice).toFixed(4)}`);
    }
  }
}

export async function executeSwap(agent: SolanaAgentKit, quote: any, fromAddress: string, toAddress: string, amount: string) {
  if (!quote || quote.status === "error") {
    console.error("Invalid quote");
    const result = { status: "error", message: "Invalid quote" };
    formatSwapResult(result, fromAddress, toAddress);
    return null;
  }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const MAX_RETRIES = 3;

  try {
    console.log("\nExecuting swap...");
    const { isValid, formatted: formattedAmount } = validateAndFormatAmount(amount, fromAddress);
    
    if (!isValid) {
      const result = { status: "error", message: "Invalid amount format" };
      formatSwapResult(result, fromAddress, toAddress);
      throw new Error("Invalid amount format");
    }

    let lastError;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`\nRetry attempt ${attempt + 1}/${MAX_RETRIES}...`);
          await delay(2000); // Wait 2 seconds between retries
        }

        const swapResult = await agent.executeOkxSwap(
          fromAddress,
          toAddress,
          formattedAmount,
          "0.5",
          true,
          "1000",
          OKX_SOLANA_WALLET_ADDRESS
        );

        console.log("Debug - Swap result:", JSON.stringify(swapResult, null, 2));

        // Check all possible locations for transaction ID and explorer URL
        const txId = swapResult?.txId || 
                    swapResult?.summary?.txId || 
                    swapResult?.data?.transactionId ||
                    swapResult?.data?.txHash ||
                    swapResult?.data?.txId;

        const explorerUrl = swapResult?.explorerUrl || 
                          swapResult?.summary?.explorerUrl || 
                          swapResult?.data?.explorerUrl;

        if (txId || explorerUrl) {
          const result = {
            status: "success",
            signature: txId,
            explorerUrl: explorerUrl,
            outputAmount: quote.data?.[0]?.toTokenAmount,
            // Include additional swap details if available
            summary: swapResult?.summary || swapResult?.data?.details || null
          };
          formatSwapResult(result, fromAddress, toAddress);
          return result;
        }

        // If we still don't have a signature, but the response indicates success
        if (swapResult?.status === "success" && swapResult?.data?.success === true) {
          throw new Error("Transaction appears successful but no transaction ID found. Please check your OKX wallet for the transaction.");
        }

        // If we still don't have a signature, throw an error with the full response
        throw new Error(`No transaction signature received from OKX. Response: ${JSON.stringify(swapResult)}`);

      } catch (error: any) {
        lastError = error;
        
        // If we got a signature, try to confirm it
        if (error?.signature) {
          console.log("\nTransaction submitted, attempting to confirm...");
          
          try {
            const latestBlockhash = await agent.connection.getLatestBlockhash();
            const confirmation = await agent.connection.confirmTransaction({
              signature: error.signature,
              blockhash: latestBlockhash.blockhash,
              lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
            }, 'confirmed');
            
            if (confirmation.value.err === null) {
              const result = {
                status: "success",
                signature: error.signature,
                outputAmount: quote.data?.[0]?.toTokenAmount
              };
              formatSwapResult(result, fromAddress, toAddress);
              return result;
            }
          } catch (confirmError) {
            console.log("Confirmation failed, will retry transaction...");
            continue;
          }
        }

        // If it's a blockhash error, continue to next retry
        if (error.message?.includes("Blockhash not found")) {
          console.log("Blockhash expired, retrying with new blockhash...");
          continue;
        }

        // For network errors, retry
        if (error.message?.includes("Network error") || error.message?.includes("timeout")) {
          console.log("Network error, retrying...");
          continue;
        }

        // For other errors, throw immediately
        throw error;
      }
    }

    // If we exhausted all retries, throw the last error
    if (lastError) {
      throw lastError;
    }

    throw new Error("Failed to execute swap after multiple attempts");
  } catch (err) {
    const error = err as Error;
    
    // Check if we have a signature in the error
    if ('signature' in error) {
      const result = {
        status: "pending",
        signature: (error as any).signature,
        message: "Transaction submitted but confirmation status unknown",
        outputAmount: quote.data?.[0]?.toTokenAmount
      };
      formatSwapResult(result, fromAddress, toAddress);
      return result;
    }
    
    const result = {
      status: "error",
      message: error.message || "Unknown error",
      details: error
    };
    formatSwapResult(result, fromAddress, toAddress);
    return result;
  }
}

function formatSwapResult(result: any, fromAddress: string, toAddress: string): void {
  // Handle pending transactions (including block height exceeded)
  if (result?.status === "pending" && result?.signature) {
    console.log("\nTransaction submitted and pending confirmation");
    console.log("  Transaction Hash:", result.signature);
    console.log("  Explorer URL:", result.explorerUrl);
    if (result?.outputAmount) {
      const toInfo = getTokenInfo(toAddress);
      const decimals = toInfo?.decimals || 6;
      const amount = (parseInt(result.outputAmount) / Math.pow(10, decimals)).toFixed(6);
      console.log("  Expected to Receive:", `${amount} ${toInfo?.symbol || toAddress}`);
    }
    console.log("\nNote: The transaction has been submitted but confirmation timed out.");
    console.log("You can check the transaction status using the explorer URL above.");
    return;
  }

  // Handle successful transactions
  if (result?.status === "success" || result?.signature || result?.txHash) {
    console.log("\nSwap Success!");
    const txHash = result.signature || result.txHash;
    if (txHash) {
      console.log("  Transaction Hash:", txHash);
      console.log("  Explorer URL:", result.explorerUrl);
    }
    
    // Display additional swap details if available
    if (result.summary) {
      if (result.summary.fromToken && result.summary.toToken) {
        console.log("  Swap Details:");
        console.log(`    From: ${result.summary.fromToken} (${result.summary.fromAmount})`);
        console.log(`    To: ${result.summary.toToken} (${result.summary.toAmount})`);
        if (result.summary.exchangeRate) {
          console.log(`    Rate: ${result.summary.exchangeRate}`);
        }
      }
    }
    
    if (result.outputAmount) {
      const toInfo = getTokenInfo(toAddress);
      const decimals = toInfo?.decimals || 6;
      const amount = (parseInt(result.outputAmount) / Math.pow(10, decimals)).toFixed(6);
      console.log("  Expected to Receive:", `${amount} ${toInfo?.symbol || toAddress}`);
    }
    return;
  }

  // Handle error cases
  if (result?.status === "error") {
    console.log("\nSwap Error:");
    
    // Extract error message
    let errorMessage = result?.message || "Unknown error";
    
    // Check for common error cases
    if (errorMessage.includes("insufficient lamports")) {
      const match = errorMessage.match(/insufficient lamports (\d+), need (\d+)/);
      if (match) {
        const [_, current, needed] = match;
        console.log("  Not enough SOL for transaction fees:");
        console.log(`  Have: ${(parseInt(current) / 1e9).toFixed(9)} SOL`);
        console.log(`  Need: ${(parseInt(needed) / 1e9).toFixed(9)} SOL`);
        console.log("  Please ensure you have enough SOL to cover transaction fees");
        return;
      }
    }

    // For other errors, show the message in a cleaner format
    console.log("  Message:", errorMessage.split('\n')[0]); // Show only first line of error
  }
}

async function initializeAgent() {
  if (!process.env.OKX_SOLANA_PRIVATE_KEY) {
    throw new Error("OKX_SOLANA_PRIVATE_KEY is required");
  }

  try {
    const llm = new ChatOpenAI({
      modelName: "gpt-4",
      temperature: 0.7,
    });

    const solanaAgent = new SolanaAgentKit(
      process.env.OKX_SOLANA_PRIVATE_KEY,
      process.env.RPC_URL || "https://api.mainnet-beta.solana.com",
      {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
        OKX_API_KEY: process.env.OKX_API_KEY || "",
        OKX_SECRET_KEY: process.env.OKX_SECRET_KEY || "",
        OKX_API_PASSPHRASE: process.env.OKX_API_PASSPHRASE || "",
        OKX_PROJECT_ID: process.env.OKX_PROJECT_ID || "",
        OKX_SOLANA_WALLET_ADDRESS: process.env.OKX_SOLANA_WALLET_ADDRESS || "",
        OKX_SOLANA_PRIVATE_KEY: process.env.OKX_SOLANA_PRIVATE_KEY || ""
      }
    );

    const tools = [
      tool(
        async ({ fromAddress, toAddress, amount }) => getQuote(solanaAgent, fromAddress, toAddress, amount),
        {
          name: "getQuote",
          description: "Get a quote for swapping tokens on OKX DEX",
          schema: z.object({
            fromAddress: z.string().describe("Source token address"),
            toAddress: z.string().describe("Destination token address"),
            amount: z.string().describe("Amount to swap")
          })
        }
      ),
      tool(
        async ({ quote, fromAddress, toAddress, amount }) => executeSwap(solanaAgent, quote, fromAddress, toAddress, amount),
        {
          name: "executeSwap",
          description: "Execute a token swap on OKX DEX",
          schema: z.object({
            quote: z.any().describe("Quote object from getQuote"),
            fromAddress: z.string().describe("Source token address"),
            toAddress: z.string().describe("Destination token address"),
            amount: z.string().describe("Amount to swap")
          })
        }
      )
    ];

    const agent = createReactAgent({
      llm,
      tools,
      messageModifier: `
        You are an expert DEX trading assistant on OKX. You help users execute trades efficiently and safely.
        You understand market conditions, token prices, and can provide recommendations.
        
        When helping with trades:
        1. Always verify token addresses and amounts
        2. Check for sufficient balances and liquidity
        3. Explain the expected outcome of trades
        4. Monitor transaction status and provide clear feedback
        5. If there are errors, explain them clearly and suggest solutions
        
        Common tokens:
        - SOL: 11111111111111111111111111111111
        - USDC: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
        - USDT: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB
        
        Be concise but informative in your responses.
      `
    });

    return { agent, solanaAgent };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

async function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

export async function getQuote(agent: SolanaAgentKit, fromAddress: string, toAddress: string, amount: string) {
  const { isValid, formatted: formattedAmount, humanReadable } = validateAndFormatAmount(amount, fromAddress);
  
  if (!isValid) {
    console.log("\nInvalid amount format");
    return { status: "error", message: "Invalid amount format" };
  }

  const toInfo = getTokenInfo(toAddress);
  
  console.log(`\nGetting quote for swapping ${humanReadable} to ${toInfo?.symbol || toAddress}...`);
  
  try {
    // Log the actual amount being sent for debugging
    console.log(`Debug - Amount in base units: ${formattedAmount}`);
    
    const quote = await agent.getOkxQuote(
      fromAddress,
      toAddress,
      formattedAmount,
      "0.5"
    );

    if (!quote.status && quote.expectedOutput === "0") {
      return { 
        status: "error", 
        message: "Invalid amount or no liquidity available for this swap" 
      };
    }

    // Log the raw quote for debugging
    console.log("Debug - Raw quote:", JSON.stringify(quote, null, 2));

    formatQuoteResult(quote, fromAddress, toAddress);
    return quote;
  } catch (err) {
    console.error("\nError getting quote:", err);
    return { status: "error", message: "Failed to get quote" };
  }
}

async function findToken(query: string, agent: SolanaAgentKit): Promise<TokenInfo | undefined> {
  query = query.toLowerCase();
  
  // Check exact matches first
  for (const [address, info] of Object.entries(tokenInfoCache)) {
    if (address.toLowerCase() === query || info.symbol.toLowerCase() === query) {
      return info;
    }
  }

  // Check partial matches
  for (const [address, info] of Object.entries(tokenInfoCache)) {
    if (info.symbol.toLowerCase().includes(query)) {
      return info;
    }
  }

  // If not found, try to get quote for this token against USDC to discover it
  try {
    const usdcAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
    const quote = await getQuote(agent, query, usdcAddress, "1");
    if (quote?.data?.[0]?.fromToken) {
      return {
        symbol: quote.data[0].fromToken.tokenSymbol,
        address: quote.data[0].fromToken.address,
        decimals: parseInt(quote.data[0].fromToken.decimal)
      };
    }
  } catch (error) {
    // Ignore quote errors
  }

  return undefined;
}

async function runTradingBot() {
  console.log("\nInitializing OKX DEX Trading Bot...");
  const { agent, solanaAgent } = await initializeAgent();
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let currentQuote: any = null;
  let swapParams: { fromAddress?: string; toAddress?: string; amount?: string } = {};

  const helpMessage = `
Available commands:
- swap [amount] [from_token] to [to_token]  (e.g. "swap 0.1 SOL to USDC")
- quote [amount] [from_token] to [to_token]  (same as swap but only shows quote)
- confirm                                    (confirms the last quote)
- cancel                                     (cancels the current swap)
- tokens                                     (lists known tokens)
- help                                      (shows this message)
- exit                                      (exits the bot)
`;

  const tokenAliases: Record<string, string> = {
    'sol': '11111111111111111111111111111111',
    'usdc': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    'usdt': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
  };

  const getAddressFromSymbol = (symbol: string): string => {
    const lowerSymbol = symbol.toLowerCase();
    return tokenAliases[lowerSymbol] || symbol;
  };

  try {
    console.log(helpMessage);

    while (true) {
      console.log("\n=== OKX DEX Trading Bot ===");
      const input = await askQuestion(rl, "\nWhat would you like to do? (Type 'help' for commands): ");
      const words = input.toLowerCase().split(' ');

      if (input.toLowerCase() === 'exit') {
        console.log("\nGoodbye!");
        break;
      }

      if (input.toLowerCase() === 'help') {
        console.log(helpMessage);
        continue;
      }

      if (input.toLowerCase().startsWith('tokens')) {
        const searchQuery = input.split(' ')[1]?.toLowerCase();
        console.log("\nKnown tokens:");
        const entries = Object.entries(tokenInfoCache);
        
        if (searchQuery) {
          const filtered = entries.filter(([address, info]) => 
            info.symbol.toLowerCase().includes(searchQuery) || 
            address.toLowerCase().includes(searchQuery)
          );
          filtered.forEach(([address, info]) => {
            console.log(`${info.symbol} (${info.decimals} decimals): ${address}`);
          });
          if (filtered.length === 0) {
            console.log("No matching tokens found. Attempting to discover token...");
            const discovered = await findToken(searchQuery, solanaAgent);
            if (discovered) {
              console.log(`Found token: ${discovered.symbol} (${discovered.decimals} decimals): ${discovered.address}`);
            } else {
              console.log("Token not found. Try using the full token address.");
            }
          }
        } else {
          entries.forEach(([address, info]) => {
            console.log(`${info.symbol} (${info.decimals} decimals): ${address}`);
          });
        }
        continue;
      }

      if (input.toLowerCase() === 'cancel') {
        currentQuote = null;
        swapParams = {};
        console.log("\nCurrent swap cancelled.");
        continue;
      }

      if (input.toLowerCase() === 'confirm') {
        if (currentQuote && swapParams.fromAddress && swapParams.toAddress && swapParams.amount) {
          await executeSwap(solanaAgent, currentQuote, swapParams.fromAddress, swapParams.toAddress, swapParams.amount);
          currentQuote = null;
          swapParams = {};
        } else {
          console.log("\nNo active quote to confirm. Please get a quote first.");
        }
        continue;
      }

      // Handle swap/quote commands
      if (words[0] === 'swap' || words[0] === 'quote') {
        const match = input.match(/(?:swap|quote)\s+([\d.]+)\s+(\w+)\s+to\s+(\w+)/i);
        if (match) {
          const [_, amount, fromToken, toToken] = match;
          const fromAddress = getAddressFromSymbol(fromToken);
          const toAddress = getAddressFromSymbol(toToken);
          
          if (!fromAddress || !toAddress) {
            console.log("\nInvalid token symbols. Use 'tokens' command to see available tokens.");
            continue;
          }
          
          swapParams = { amount, fromAddress, toAddress };
          currentQuote = await getQuote(solanaAgent, fromAddress, toAddress, amount);
          
          if (words[0] === 'swap') {
            console.log("\nTo proceed with the swap, type 'confirm' or 'cancel' to abort.");
          }
          continue;
        } else {
          console.log("\nInvalid format. Use: swap [amount] [from_token] to [to_token]");
          console.log("Example: swap 0.1 SOL to USDC");
          continue;
        }
      }

      // If no command matched, use the LLM
      const stream = await agent.stream(
        { messages: [new HumanMessage(input)] },
        { configurable: { thread_id: "OKX DEX Trading" } }
      );

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log("-------------------");
      }
    }
  } catch (err) {
    console.error("\nError:", err);
  } finally {
    rl.close();
  }
}

// Start the trading bot when running directly
if (require.main === module) {
  runTradingBot().catch(console.error);
} 