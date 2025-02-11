import { VersionedTransaction, PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../../index";
import { FLUXBEAM_BASE_URI, TOKENS } from "../../constants";
import { getTokenDecimals } from "../../utils/FluxbeamUtils";

/**
 * Create a new pool using FluxBeam
 * @param agent SolanaAgentKit instance
 * @param token_a token mint address of the first token
 * @param token_a_amount Amount to swap (in token decimals)
 * @param token_b  Source token mint address (defaults to USDC)
 * @param token_b_amount Source token mint address (defaults to USDC)
 * @param slippageBps Slippage tolerance in basis points (default: 300 = 3%)
 * @returns Transaction signature
 */

export async function fluxBeamCreatePool(
  agent: SolanaAgentKit,
  token_a: PublicKey,
  token_a_amount: number,
  token_b: PublicKey,
  token_b_amount: number,
): Promise<string> {
  try {
    const isTokenA_NativeSol = token_a.equals(TOKENS.SOL);
    const tokenA_Decimals = isTokenA_NativeSol
      ? 9
      : await getTokenDecimals(agent, token_a);

    const scaledAmountTokenA = token_a_amount * Math.pow(10, tokenA_Decimals);
    const isTokenB_NativeSol = token_b.equals(TOKENS.SOL);
    const tokenB_Decimals = isTokenB_NativeSol
      ? 9
      : await getTokenDecimals(agent, token_b);

    const scaledAmountTokenB = token_b_amount * Math.pow(10, tokenB_Decimals);
    const response = await (
      await fetch(`${FLUXBEAM_BASE_URI}/token_pools`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payer: agent.wallet_address,
          token_a: token_a,
          token_b: token_b,
          token_a_amount: scaledAmountTokenA,
          token_b_amount: scaledAmountTokenB,
        }),
      })
    ).json();
    if (response.error) {
      throw new Error(response.error);
    }
    // Deserialize transaction
    const TransactionBuf = Buffer.from(response.transaction, "base64");

    const transaction = VersionedTransaction.deserialize(TransactionBuf);
    // Sign and send transaction
    transaction.sign([agent.wallet]);

    const signature = await agent.connection.sendRawTransaction(
      transaction.serialize(),
      {
        maxRetries: 3,
        skipPreflight: true,
      },
    );
    return signature;
  } catch (error: any) {
    throw new Error(`Failed to create fluxbeam pool: ${error.message}`);
  }
}
