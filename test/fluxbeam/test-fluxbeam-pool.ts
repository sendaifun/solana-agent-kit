import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";
import {
  FluxBeamLiquidityTool,
  FluxBeamPoolInfoTool,
} from "../../src/tools/fluxbeam/fluxbeam_pool";

// Test tokens (using mainnet addresses)
const USDC_TOKEN = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC
const BONK_TOKEN = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"; // BONK

async function testFluxBeamTools() {
  try {
    // Initialize connection to Solana mainnet and a test wallet
    const connection = new Connection(
      "https://api.mainnet-beta.solana.com",
      "confirmed",
    );
    const wallet = Keypair.generate();

    console.log("Test wallet public key:", wallet.publicKey.toString());

    const liquidityTool = new FluxBeamLiquidityTool(connection);
    const poolInfoTool = new FluxBeamPoolInfoTool(connection);

    console.log("\nTesting Pool Info Tool...");
    console.log("Querying USDC-BONK pool information...");
    const poolInfoInput = JSON.stringify({
      tokenA: USDC_TOKEN,
      tokenB: BONK_TOKEN,
    });

    const poolInfoResult = await poolInfoTool._call(poolInfoInput);
    const poolInfoParsed = JSON.parse(poolInfoResult);

    console.log("\nTesting Liquidity Tool - Add Liquidity...");
    console.log("Attempting to add liquidity to USDC-BONK pool...");
    const addLiquidityInput = JSON.stringify({
      action: "add",
      payer: wallet.publicKey.toString(),
      tokenA: USDC_TOKEN,
      tokenB: BONK_TOKEN,
      amountA: "1000000", // 1 USDC (6 decimals)
      amountB: "1000000000", // 1000 BONK (9 decimals)
    });

    const addLiquidityResult = await liquidityTool._call(addLiquidityInput);
    const addLiquidityParsed = JSON.parse(addLiquidityResult);
    console.log(
      "Add Liquidity Result:",
      JSON.stringify(addLiquidityParsed, null, 2),
    );

    if (addLiquidityParsed.success) {
      console.log("\nPool Address:", addLiquidityParsed.poolAddress);

      // Decode and sign transaction
      const transactionBuffer = Buffer.from(
        addLiquidityParsed.transaction,
        "base64",
      );
      const transaction = VersionedTransaction.deserialize(transactionBuffer);

      // Sign the transaction
      transaction.sign([wallet]);

      // Send the transaction
      console.log("\nSending transaction...");
      const signature = await connection.sendRawTransaction(
        transaction.serialize(),
        {
          maxRetries: 3,
          skipPreflight: true,
        },
      );
      console.log("Transaction signature:", signature);
    }

    console.log("\nTesting Liquidity Tool - Invalid Action...");
    const invalidActionInput = JSON.stringify({
      action: "invalid_action",
      payer: wallet.publicKey.toString(),
      tokenA: USDC_TOKEN,
      tokenB: BONK_TOKEN,
      amountA: "1000000",
      amountB: "1000000000",
    });

    const invalidActionResult = await liquidityTool._call(invalidActionInput);
    const invalidActionParsed = JSON.parse(invalidActionResult);
    console.log(
      "Invalid Action Result:",
      JSON.stringify(invalidActionParsed, null, 2),
    );
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the tests
console.log("Starting FluxBeam Pool Tools Tests...\n");
testFluxBeamTools().then(() => console.log("\nTests completed"));
