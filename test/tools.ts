import * as dotenv from "dotenv";
import { test_create_meteora_dynamic_amm_pool } from "./create_meteora_dynamic_amm_pool";

dotenv.config();

async function main() {
  try {
    console.log("Starting Agent...");

    // Test Tools
    await test_create_meteora_dynamic_amm_pool();
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