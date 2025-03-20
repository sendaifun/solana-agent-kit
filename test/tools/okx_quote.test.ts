import { SolanaAgentKit } from "../../src/agent";
import { OKXQuoteData, OKXResponse } from "../../src/types";
import dotenv from "dotenv";

dotenv.config();

async function testOkxDexQuote() {
  console.log("Testing OKX DEX Quote API...");
  
  // Create a configuration object with explicit defaults for optional values
  const config = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    // Add defaults for the OKX configuration values to avoid undefined
    OKX_API_KEY: process.env.OKX_API_KEY || "",
    OKX_SECRET_KEY: process.env.OKX_SECRET_KEY || "",
    OKX_API_PASSPHRASE: process.env.OKX_API_PASSPHRASE || "",
    OKX_PROJECT_ID: process.env.OKX_PROJECT_ID || ""
  };
  
  // Initialize SolanaAgentKit with proper config
  const agent = new SolanaAgentKit(
    process.env.SOLANA_PRIVATE_KEY!,
    process.env.RPC_URL!,   
    config
  );

  console.log("Wallet address:", agent.wallet_address.toString());

  try {
    // Test getting a quote for SOL -> USDC
    console.log("Getting quote for SOL -> USDC...");
    
    // SOL and USDC token addresses
    const solAddress = "So11111111111111111111111111111111111111112";
    const usdcAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
    
    // Amount in lamports (0.01 SOL = 10,000,000 lamports)
    const amount = "10000000"; 
    
    const quote = await agent.getOkxQuote(
      solAddress,
      usdcAddress,
      amount,
      "0.5" // 0.5% slippage
    ) as OKXResponse<OKXQuoteData>;
    
    if (quote && quote.data) {
      console.log("Successfully got quote from OKX DEX API");
      console.log("Quote details:", JSON.stringify(quote.data[0], null, 2));
      console.log("Quote test passed!");
    } else {
      console.log("Failed to get quote. Response:", quote);
      console.log("Quote test failed!");
    }
  } catch (error) {
    console.error("Error getting quote from OKX DEX API:", error);
    console.log("Quote test failed!");
  }
}

// Run the test
testOkxDexQuote().catch(console.error);