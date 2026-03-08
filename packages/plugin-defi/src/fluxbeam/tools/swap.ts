import { type PublicKey, VersionedTransaction } from "@solana/web3.js";
import { type SolanaAgentKit, signOrSendTX } from "solana-agent-kit";
import { FLUXBEAM_BASE_URI, TOKENS } from "../constants";
import { getTokenDecimals } from "../utils";

/**
 * Swap tokens using FluxBeam
 * @param agent SolanaAgentKit instance
 * @param outputMint Target token mint address
 * @param amount Amount to swap (in source token decimals)
 * @param inputMint Source token mint address (defaults to SOL)
 * @param slippageBps Slippage tolerance in basis points (default: 50 = 0.5%)
 * @returns Transaction signature
 */
export async function fluxbeamSwap(
  agent: SolanaAgentKit,
  outputMint: PublicKey,
  amount: number,
  inputMint: PublicKey = TOKENS.SOL,
  slippageBps: number = 50,
) {
  try {
    const isInputSol = inputMint.equals(TOKENS.SOL);
    const inputDecimals = isInputSol
      ? 9
      : await getTokenDecimals(agent, inputMint);

    const scaledAmount = Math.floor(amount * Math.pow(10, inputDecimals));

    // 1. Get Quote
    const quoteResponse = await fetch(
      `${FLUXBEAM_BASE_URI}/quote?inputMint=${inputMint.toBase58()}&outputMint=${outputMint.toBase58()}&amount=${scaledAmount}&slippageBps=${slippageBps}`,
    );
    const quote = await quoteResponse.json();

    if (quote.error) {
      throw new Error(`FluxBeam Quote Error: ${quote.error}`);
    }

    // 2. Get Swap Transaction
    const swapResponse = await fetch(`${FLUXBEAM_BASE_URI}/swap/transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quote,
        userPublicKey: agent.wallet.publicKey.toBase58(),
        wrapAndUnwrapSol: true,
      }),
    });

    const swapResult = await swapResponse.json();

    if (swapResult.error) {
      throw new Error(`FluxBeam Swap Error: ${swapResult.error}`);
    }

    // 3. Deserialize and Sign
    const transactionBuf = Buffer.from(swapResult.transaction, "base64");
    const transaction = VersionedTransaction.deserialize(transactionBuf);

    // Update blockhash
    const { blockhash } = await agent.connection.getLatestBlockhash();
    transaction.message.recentBlockhash = blockhash;

    return await signOrSendTX(agent, transaction);
  } catch (error: any) {
    throw new Error(`FluxBeam swap failed: ${error.message}`);
  }
}
