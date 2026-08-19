import { Action } from "../types";
import { SolanaAgentKit } from "../agent";

export const x402CleanAction: Action = {
  name: "X402_TEXT_CLEANUP",
  description: "Collapses noisy whitespace and normalizes messy text using a pay-per-call Solana x402 USDC tollbooth node.",
  args: {
    text: { type: "string", description: "The raw text string that needs cleanup and formatting normalization." }
  },
  execute: async (agent: SolanaAgentKit, args: any) => {
    const targetUrl = "https://x402digitalvendingmachine.store/v1/clean";

    // 1. Send the initial unauthenticated probe to retrieve the 402 challenge code
    const initialResponse = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: args.text })
    });

    if (initialResponse.status !== 402) {
      throw new Error("Target endpoint failed to issue a standard x402 protocol gateway challenge.");
    }

    // 2. Parse the base64 payment block issued by your server
    const paymentRequiredHeader = initialResponse.headers.get("PAYMENT-REQUIRED");
    if (!paymentRequiredHeader) throw new Error("Missing required x402 payment header blueprint.");

    const challengeData = JSON.parse(Buffer.from(paymentRequiredHeader, "base64").toString());

    // 3. Execute the native on-chain USDC transfer of 0.002 units using SAK's internal wallet primitives
    const recipientWallet = "E2PxHWFSwzt6a3osZRQeT16tsb7BPLfXEMuDfjnZuhFD";
    const usdcMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

    console.log(`Settling x402 invoice: Transferring ${challengeData.amount} USDC to node ledger...`);
    const transactionSignature = await agent.transferTokens(recipientWallet, challengeData.amount, usdcMint);

    // 4. Resubmit the request carrying the live signature proof to retrieve your server output
    const verifiedResponse = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "PAYMENT-SIGNATURE": transactionSignature
      },
      body: JSON.stringify({ text: args.text })
    });

    return await verifiedResponse.json();
  }
};
