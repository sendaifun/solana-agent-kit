import { SolanaAgentKit } from "../../src/agent";
import { OKXChain, OKXResponse } from "../../src/types";
import dotenv from "dotenv";

dotenv.config();

async function testOkxDexChainData() {
  console.log("Testing OKX DEX Chain Data API...");
  
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
    // Test getting chain data
    console.log("Getting chain data from OKX DEX...");
    const chainData = await agent.getOkxChainData() as OKXResponse<OKXChain>;
    
    if (chainData?.data) {
      console.log("Successfully got chain data from OKX DEX API");
      chainData.data.forEach((chain: OKXChain) => {
        console.log(`- ${chain.chainName} (${chain.chainId})`);
        if (chain.dexTokenApproveAddress) {
          console.log(`  DEX Token Approve Address: ${chain.dexTokenApproveAddress}`);
        }
      });
      console.log("Chain data test passed!");
    } else {
      console.log("Failed to get chain data. Response:", chainData);
      console.log("Chain data test failed!");
    }
  } catch (error) {
    console.error("Error getting chain data from OKX DEX API:", error);
    console.log("Chain data test failed!");
  }
}

// Run the test
testOkxDexChainData().catch(console.error);