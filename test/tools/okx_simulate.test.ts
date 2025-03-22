import { SolanaAgentKit } from "../../src/agent";
import { OKXQuoteData, OKXResponse } from "../../src/types";
import { TransactionMessage, VersionedTransaction, ComputeBudgetProgram } from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();

async function testOkxDexSimulation() {
  console.log("Testing OKX DEX Simulation");

  const agent = new SolanaAgentKit(
    process.env.SOLANA_PRIVATE_KEY!,
    process.env.RPC_URL!,
    {
      OKX_API_KEY: process.env.OKX_API_KEY || "",
      OKX_SECRET_KEY: process.env.OKX_SECRET_KEY || "",
      OKX_API_PASSPHRASE: process.env.OKX_API_PASSPHRASE || "",
      OKX_PROJECT_ID: process.env.OKX_PROJECT_ID || ""
    }
  );

  try {
    // Get quote for SOL -> USDC
    const quote = await agent.getOkxQuote(
      "So11111111111111111111111111111111111111112", // SOL
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
      "10000000" // 0.01 SOL
    ) as OKXResponse<OKXQuoteData>;

    if (!quote?.data?.[0]) throw new Error("Failed to get quote");

    // Create and simulate transaction
    const { blockhash } = await agent.connection.getLatestBlockhash('finalized');
    const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 300000 });
    
    const transaction = new VersionedTransaction(
      new TransactionMessage({
        payerKey: agent.wallet_address,
        recentBlockhash: blockhash,
        instructions: [computeBudgetIx]
      }).compileToV0Message()
    );

    const simulation = await agent.connection.simulateTransaction(transaction);
    
    console.log("Simulation status:", simulation.value.err ? "Failed" : "Success");
    console.log("Compute units:", simulation.value.unitsConsumed || 0);

    return { simulation, quote: quote.data[0] };
  } catch (error) {
    console.error("Simulation failed:", error instanceof Error ? error.message : error);
    throw error;
  }
}

testOkxDexSimulation().catch(console.error); 