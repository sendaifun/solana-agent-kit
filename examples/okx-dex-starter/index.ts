import { SolanaAgentKit } from "../../src/agent";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as dotenv from "dotenv";
import * as readline from "readline";
import { initDexClient } from "../../src/tools/okx-dex/utils";
import bs58 from 'bs58';

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

// Helper functions for base58 validation
function isValidBase58(str: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]+$/.test(str);
}

function encodeBase58Safe(str: string): string {
  // Remove any non-base58 characters and whitespace
  return str.replace(/[^1-9A-HJ-NP-Za-km-z]/g, '');
}

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

export function formatTokenAmount(amount: string, address: string, tokenInfo?: any): string {
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
    let wholePart = parts[0] || '0';
    const fractionalPart = parts[1] || '';
    
    // Ensure whole part is not empty and has at least one digit
    if (!wholePart || wholePart === '') {
      wholePart = '0';
    }
    
    // Pad with zeros if needed, then take correct number of decimal places
    const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
    
    // Combine whole and fractional parts
    const baseUnits = wholePart + paddedFractional;
    
    // Remove leading zeros but keep at least one digit
    const formattedBaseUnits = baseUnits.replace(/^0+/, '') || '0';

    // Format human readable amount
    const humanValue = value.toLocaleString(undefined, {
      minimumFractionDigits: Math.min(6, decimals),
      maximumFractionDigits: Math.min(6, decimals),
      useGrouping: false // Prevent thousand separators
    });

    return {
      isValid: true,
      formatted: formattedBaseUnits, // Use base units for API calls
      humanReadable: `${humanValue} ${tokenInfo?.symbol || address.slice(0, 8)}`
    };
  } catch (err) {
    console.error("Error formatting amount:", err);
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
    // Handle various SOL address formats and convert to OKX's expected format
    const WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112";
    const NATIVE_SOL_MINT = "11111111111111111111111111111111";
    
    // Convert addresses to strings and normalize
    let fromAddress = String(fromTokenAddress || '').trim();
    let toAddress = String(toTokenAddress || '').trim();
    
    // Convert SOL addresses to native format for the API
    if (fromAddress === WRAPPED_SOL_MINT) {
      console.log(`Converting from wrapped SOL to native format for API call: ${NATIVE_SOL_MINT}`);
      fromAddress = NATIVE_SOL_MINT;
    }
    
    if (toAddress === WRAPPED_SOL_MINT) {
      console.log(`Converting to wrapped SOL to native format for API call: ${NATIVE_SOL_MINT}`);
      toAddress = NATIVE_SOL_MINT;
    }
    
    // Clean the wallet address
    const walletAddress = String(userWalletAddress || agent.wallet_address.toString()).trim();
    
    console.log("\nDebug - OKX DEX Swap Execution:");
    console.log("  From token:", fromAddress);
    console.log("  To token:", toAddress);
    console.log("  Amount:", amount);
    console.log("  Amount type:", typeof amount);
    console.log("  User wallet:", walletAddress);

    // Initialize the OKX DEX client
    const dexClient = initDexClient(agent);

    // Get a quote first
    console.log("\nDebug - Getting quote for swap...");
    const quote = await dexClient.dex.getQuote({
      chainId: '501',
      fromTokenAddress: fromAddress,
      toTokenAddress: toAddress,
      amount: amount.toString(),
      slippage: autoSlippage ? "0" : slippage
    });

    console.log("\nDebug - Quote response status:", quote.code, quote.msg);
    
    // Validate the quote
    if (!quote.data || !quote.data[0]) {
      throw new Error(`Failed to get valid quote for the swap: ${quote.msg || "No data"}`);
    }

    const quoteData = quote.data[0];
    console.log("\nDebug - Quote data:", {
      fromToken: quoteData.fromToken?.tokenSymbol || "Unknown",
      toToken: quoteData.toToken?.tokenSymbol || "Unknown",
      fromAmount: quoteData.fromTokenAmount,
      toAmount: quoteData.toTokenAmount,
    });

    // Extract human-readable amounts for reporting
    const fromDecimal = parseInt(quoteData.fromToken?.decimal || "9");
    const toDecimal = parseInt(quoteData.toToken?.decimal || "6");
    const humanFromAmount = parseFloat(quoteData.fromTokenAmount) / Math.pow(10, fromDecimal);
    const humanToAmount = parseFloat(quoteData.toTokenAmount) / Math.pow(10, toDecimal);

    console.log("\nDebug - Executing swap transaction...");
    
    try {
      // Use the standard SDK method instead of trying to customize the request
      const swapResult = await dexClient.dex.executeSwap({
        chainId: '501',
        fromTokenAddress: fromAddress,
        toTokenAddress: toAddress,
        amount: amount.toString(),
        slippage,
        autoSlippage,
        maxAutoSlippage: maxAutoSlippageBps,
        userWalletAddress: walletAddress
      });

      console.log("\nDebug - Swap result:", JSON.stringify(swapResult, null, 2));

      return {
        status: "success",
        summary: {
          fromToken: quoteData.fromToken?.tokenSymbol || fromAddress,
          toToken: quoteData.toToken?.tokenSymbol || toAddress,
          fromAmount: humanFromAmount,
          toAmount: humanToAmount,
          exchangeRate: humanToAmount / humanFromAmount,
          txId: swapResult.transactionId || "Unknown",
          explorerUrl: swapResult.explorerUrl || `https://www.okx.com/web3/explorer/sol/tx/${swapResult.transactionId || ""}`
        },
        data: swapResult
      };
    } catch (swapError: any) {
      console.error("\nSwap execution failed:", swapError);
      
      if (swapError.message?.includes("Non-base58")) {
        console.log("\nAnalyzing base58 error...");
        
        const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
        
        // Check if Agent's wallet keypair is valid
        const agentPrivateKey = agent.wallet.secretKey.toString();
        console.log("Agent private key format valid:", base58Regex.test(agentPrivateKey.slice(0, 5) + "..."));
        
        // Let's try direct JSON.stringify to see the exact error:
        const errorDetails = {
          message: swapError.message,
          name: swapError.name,
          stack: swapError.stack,
          responseBody: swapError.responseBody,
          requestDetails: swapError.requestDetails
        };
        
        console.log("Detailed error:", JSON.stringify(errorDetails, null, 2));
      }
      
      return {
        status: "error",
        message: swapError.message || "Failed to execute swap",
        details: swapError.response?.data || swapError.responseBody || swapError.stack
      };
    }
  } catch (error: any) {
    console.error("\nDetailed swap error:", error);
    
    return {
      status: "error",
      message: error.message || "Failed to execute swap",
      details: error.response?.data || error.stack
    };
  }
}

async function initializeAgent() {
  if (!process.env.OKX_SOLANA_PRIVATE_KEY) {
    throw new Error("OKX_SOLANA_PRIVATE_KEY is required");
  }


  try {
    // Clean up and validate private key
    const privateKey = encodeBase58Safe(process.env.OKX_SOLANA_PRIVATE_KEY);
    if (!isValidBase58(privateKey)) {
      throw new Error("Invalid base58 format for private key");
    }
    
    // Debug logging (only show first/last 4 chars of private key for security)
    console.log("\nDebug - Initialization:");
    console.log("  Private key length:", privateKey.length);
    console.log("  Private key format:", `${privateKey.slice(0, 4)}...${privateKey.slice(-4)}`);
    
    // Clean up and validate wallet address if provided
    if (process.env.OKX_SOLANA_WALLET_ADDRESS) {
      const walletAddress = encodeBase58Safe(process.env.OKX_SOLANA_WALLET_ADDRESS);
      if (!isValidBase58(walletAddress)) {
        throw new Error("Invalid base58 format for wallet address");
      }
      console.log("  Wallet address:", walletAddress);
    }

    const llm = new ChatOpenAI({
      modelName: "gpt-4",
      temperature: 0.7,
    });

    const solanaAgent = new SolanaAgentKit(
      privateKey,
      process.env.RPC_URL || "https://api.mainnet-beta.solana.com",
      {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
        OKX_API_KEY: process.env.OKX_API_KEY!,
        OKX_SECRET_KEY: process.env.OKX_SECRET_KEY!,
        OKX_API_PASSPHRASE: process.env.OKX_API_PASSPHRASE!,
        OKX_PROJECT_ID: process.env.OKX_PROJECT_ID!,
        OKX_SOLANA_WALLET_ADDRESS: process.env.OKX_SOLANA_WALLET_ADDRESS!,
        OKX_SOLANA_PRIVATE_KEY: process.env.OKX_SOLANA_PRIVATE_KEY!,
      }
    );

    // Log the agent's wallet address for verification
    console.log("  Agent wallet address:", solanaAgent.wallet_address.toString());

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
    // Debug logging for amount validation
    console.log("\nDebug - Amount validation:");
    console.log("  Raw amount:", amount);
    console.log("  Formatted amount:", formattedAmount);
    console.log("  Human readable:", humanReadable);
    
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
    console.log("\nDebug - Raw quote response:", JSON.stringify(quote, null, 2));

    formatQuoteResult(quote, fromAddress, toAddress);
    return quote;
  } catch (err) {
    console.error("\nError getting quote:", err);
    if (err instanceof Error) {
      console.log("Debug - Error details:", {
        message: err.message,
        stack: err.stack,
        // @ts-ignore
        responseBody: err.responseBody,
        // @ts-ignore
        requestDetails: err.requestDetails
      });
    }
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
    'sol': 'So11111111111111111111111111111111111111112',
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
          console.log("\nDebug - Swap parameters:");
          console.log("  From address:", swapParams.fromAddress);
          console.log("  To address:", swapParams.toAddress);
          console.log("  Amount:", swapParams.amount);
          console.log("  Quote:", typeof currentQuote);
          
          try {
            // Convert the human-readable amount to base units
            const { formatted: formattedAmount } = validateAndFormatAmount(
              swapParams.amount, 
              swapParams.fromAddress
            );
            
            console.log("  Formatted amount (in base units):", formattedAmount);
            
            // Pass the properly formatted amount in base units
            const result = await executeSwap(
              solanaAgent, 
              swapParams.fromAddress, 
              swapParams.toAddress, 
              formattedAmount, // Use formatted amount in base units
              "0.5", // slippage
              false, // autoSlippage
              "100", // maxAutoSlippageBps
            );
            
            console.log("\nSwap result:", result);
            
            // Reset after swap attempt regardless of success
            currentQuote = null;
            swapParams = {};
          } catch (error) {
            console.error("Error executing swap:", error);
            // Keep parameters in case the user wants to retry
          }
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