import * as dotenv from "dotenv";
import { test_deploy_token } from "./deployToken";
import { test_deploy_collection } from "./deployCollection";
import { test_mint_nft } from "./mintNft";

dotenv.config();

async function main() {
  try {
    console.log("Starting Agent...");

    // Test Tools
    await test_deploy_token();
    await test_deploy_collection();
    await test_mint_nft();
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}