import {
  VersionedTransaction,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { SolanaAgentKit } from "../index";
import { TOKENS, DEFAULT_OPTIONS, JUP_API } from "../constants";

/**
 * Swap tokens using Jupiter Exchange
 * @param agent SolanaAgentKit instance
 * @param outputMint Target token mint address
 * @param inputAmount Amount to swap (in token decimals)
 * @param inputMint Source token mint address (defaults to USDC)
 * @param slippageBps Slippage tolerance in basis points (default: 300 = 3%)
 * @returns Transaction signature
 */
export async function trade(
  agent: SolanaAgentKit,
  outputMint: PublicKey,
  inputAmount: number,
  inputMint: PublicKey = TOKENS.USDC,
  slippageBps: number = DEFAULT_OPTIONS.SLIPPAGE_BPS,
): Promise<string> {
  try {
    const quoteResponse = await (
      await fetch(
        `${JUP_API}/quote?` +
          `inputMint=${inputMint.toString()}` +
          `&outputMint=${outputMint.toString()}` +
          `&amount=${inputAmount * LAMPORTS_PER_SOL}` +
          `&slippageBps=${slippageBps}` +
          `&onlyDirectRoutes=true` +
          `&maxAccounts=20`,
      )
    ).json();

    // Get serialized transaction
    const { swapTransaction } = await (
      await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: agent.wallet_address.toString(),
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: "auto",
        }),
      })
    ).json();
    // Deserialize transaction
    const swapTransactionBuf = Buffer.from(swapTransaction, "base64");

    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    // Sign and send transaction
    transaction.sign([agent.wallet]);
    const signature = await agent.connection.sendTransaction(transaction);

    return signature;
  } catch (error: any) {
    throw new Error(`Swap failed: ${error.message}`);
  }
}
