import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { FluxBeamSwapTool } from "../../src/tools/fluxbeam/fluxbeam_swap";
import bs58 from "bs58";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testFluxBeamSwap() {
  // Initialize connection to mainnet-beta since FluxBeam is only available there
  const connection = new Connection("https://api.mainnet-beta.solana.com");

  // Load wallet from base58 secret key
  const secretKeyStr = process.env.SOLANA_SECRET_KEY;
  if (!secretKeyStr) {
    throw new Error("SOLANA_SECRET_KEY not found in environment variables");
  }

  const secretKey = bs58.decode(secretKeyStr);
  const wallet = Keypair.fromSecretKey(secretKey);
  console.log("Wallet public key:", wallet.publicKey.toBase58());

  // Check the wallet balance
  const balance = await connection.getBalance(wallet.publicKey);
  console.log(`Wallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);

  // Create instance of FluxBeamSwapTool
  const fluxBeamTool = new FluxBeamSwapTool(connection, wallet);

  // Test 1: Get quote for a small SOL -> FLUX swap
  console.log("\nTest 1: Getting quote for SOL -> FLUX swap...");
  const smallAmount = 0.01 * LAMPORTS_PER_SOL; // 0.01 SOL
  const solToFluxInput = JSON.stringify({
    inputMint: "So11111111111111111111111111111111111111112", // SOL
    outputMint: "FLUXBmPhT3Fd1EDVFdg46YREqHBeNypn1h4EbnTzWERX", // FLUX
    amount: smallAmount,
    execute: false,
  });

  try {
    const solToFluxResult = await fluxBeamTool._call(solToFluxInput);
    console.log("SOL -> FLUX Quote:", JSON.parse(solToFluxResult));
  } catch (error) {
    console.error("Error getting SOL -> FLUX quote:", error);
  }

  // Test 2: Execute the small SOL -> FLUX swap
  if (balance > smallAmount + 0.01 * LAMPORTS_PER_SOL) {
    // Check if we have enough SOL (including fees)
    console.log("\nTest 2: Executing SOL -> FLUX swap...");
    const swapInput = JSON.stringify({
      inputMint: "So11111111111111111111111111111111111111112", // SOL
      outputMint: "FLUXBmPhT3Fd1EDVFdg46YREqHBeNypn1h4EbnTzWERX", // FLUX
      amount: smallAmount,
      execute: true,
    });

    try {
      const swapResult = await fluxBeamTool._call(swapInput);
      console.log("Swap Result:", JSON.parse(swapResult));

      // If swap was successful, check the wallet's FLUX balance
      const fluxMint = new PublicKey(
        "FLUXBmPhT3Fd1EDVFdg46YREqHBeNypn1h4EbnTzWERX",
      );
      const fluxBalance = await connection.getTokenAccountsByOwner(
        wallet.publicKey,
        {
          mint: fluxMint,
        },
      );
      console.log("FLUX token accounts:", fluxBalance.value);
    } catch (error) {
      console.error("Error executing swap:", error);
    }
  } else {
    console.log("\nSkipping swap execution: Insufficient SOL balance");
    console.log(
      "Required: ",
      (smallAmount + 0.01 * LAMPORTS_PER_SOL) / LAMPORTS_PER_SOL,
      "SOL",
    );
    console.log("Current: ", balance / LAMPORTS_PER_SOL, "SOL");
  }
}

// Run the tests
console.log("Starting FluxBeamSwapTool tests...");
testFluxBeamSwap()
  .then(() => console.log("\nTests completed"))
  .catch((error) => console.error("\nTests failed:", error));
