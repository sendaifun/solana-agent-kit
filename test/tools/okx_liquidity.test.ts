import { SolanaAgentKit } from "../../src/agent";
import { OKXLiquiditySource, OKXResponse } from "../../src/types";
import dotenv from "dotenv";

dotenv.config();

async function testOkxDexLiquidity() {
  console.log("Testing OKX DEX Liquidity API...");
  
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
    // Test getting liquidity information for Ethereum (chainId: 1)
    console.log("Getting liquidity information from OKX DEX for Ethereum...");
    const chainId = "1"; // Ethereum chain ID
    const response = await agent.getOkxLiquidity(chainId) as OKXResponse<OKXLiquiditySource>;
    
    if (response.code === "0" && response.data) {
      console.log("Successfully got liquidity information from OKX DEX API");
      console.log(`Found ${response.data.length} liquidity sources`);
      
      // Print liquidity source information
      console.log("\nLiquidity sources (showing first 5):");
      response.data.slice(0, 5).forEach((source: OKXLiquiditySource) => {
        console.log(`- ${source.name}`);
        console.log(`  ID: ${source.id}`);
        console.log(`  Logo: ${source.logo}`);
      });
      
      console.log("\nTotal available liquidity sources:", response.data.length);
      console.log("Liquidity test passed!");
    } else {
      console.log("Failed to get liquidity information.");
      console.log("Response code:", response.code);
      console.log("Response message:", response.msg);
      console.log("Liquidity test failed!");
    }
  } catch (error) {
    console.error("Error getting liquidity information from OKX DEX API:", error);
    console.log("Liquidity test failed!");
  }
}

// Run the test
testOkxDexLiquidity().catch(console.error); 