import { VersionedTransaction, PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../index";
import { TOKENS } from "../constants";
import { getMint } from "@solana/spl-token";

/**
 * Create a new pool using FluxBeam
 * @param solanaAgent SolanaAgentKit instance
 * @param tokenA Mint address of the first token
 * @param tokenAAmount Amount of the first token to pool (in token decimals)
 * @param tokenB Mint address of the second token
 * @param tokenBAmount Amount of the second token to pool (in token decimals)
 * @returns Transaction signature
 */
export async function createPoolFluxBeam(
  solanaAgent: SolanaAgentKit,
  tokenA: PublicKey,
  tokenAAmount: number,
  tokenB: PublicKey,
  tokenBAmount: number,
): Promise<string> {
  try {
    const FLUXBEAM_API_URL = `https://api.fluxbeam.xyz/v1`;

    // Determine decimals for tokenA
    const isTokenANativeSOL = tokenA.equals(TOKENS.SOL);
    const tokenADecimals = isTokenANativeSOL
      ? 9 // Native SOL has 9 decimals
      : (await getMint(solanaAgent.connection, tokenA)).decimals;

    // Scale tokenA amount based on its decimals
    const scaledTokenAAmount = tokenAAmount * Math.pow(10, tokenADecimals);

    // Determine decimals for tokenB
    const isTokenBNativeSOL = tokenB.equals(TOKENS.SOL);
    const tokenBDecimals = isTokenBNativeSOL
      ? 9 // Native SOL has 9 decimals
      : (await getMint(solanaAgent.connection, tokenB)).decimals;

    // Scale tokenB amount based on its decimals
    const scaledTokenBAmount = tokenBAmount * Math.pow(10, tokenBDecimals);

    // Create a new pool via the FluxBeam API
    const response = await fetch(`${FLUXBEAM_API_URL}/token_pools`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payer: solanaAgent.wallet_address,
        token_a: tokenA.toString(),
        token_b: tokenB.toString(),
        token_a_amount: scaledTokenAAmount,
        token_b_amount: scaledTokenBAmount,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create pool. Status: ${response.status}`);
    }

    const { poolTransaction } = await response.json();

    // Deserialize transaction
    const transactionBuffer = Buffer.from(poolTransaction, "base64");
    const transaction = VersionedTransaction.deserialize(transactionBuffer);

    // Sign the transaction with the wallet
    transaction.sign([solanaAgent.wallet]);

    // Send the signed transaction
    const signature = await solanaAgent.connection.sendRawTransaction(
      transaction.serialize(),
      {
        maxRetries: 3,
        skipPreflight: true,
      },
    );

    return signature;
  } catch (error: any) {
    throw new Error(`Pool creation failed: ${error.message}`);
  }
}
