import { PublicKey } from "@solana/web3.js";
import type { SolanaAgentKit } from "solana-agent-kit";
import { ORBIT_PROGRAM_ID } from "./constants";

const DEFAULT_SLIPPAGE_BPS = 100; // 1%

/**
 * Execute a token swap on Orbit Finance DLMM.
 *
 * Orbit Finance is a standalone DLMM on Solana — not a Meteora fork.
 * Custom on-chain program (Fn3fA3f...), BinArray[64], Pool account layout.
 *
 * @param agent       SolanaAgentKit instance
 * @param poolId      Pool public key (base58). Use orbitGetPrice to look up pools.
 * @param inputMint   Input token mint (base58)
 * @param outputMint  Output token mint (base58)
 * @param inputAmount Amount of input token in human-readable units (e.g. 1.5 USDC)
 * @param slippageBps Max slippage in basis points. Default: 100 (1%)
 * @returns Transaction signature
 */
export async function orbitSwap(
  agent: SolanaAgentKit,
  poolId: string,
  inputMint: PublicKey,
  outputMint: PublicKey,
  inputAmount: number,
  slippageBps: number = DEFAULT_SLIPPAGE_BPS
): Promise<string> {
  try {
    const orbitDlmm = await import("orbit-dlmm").catch(() => {
      throw new Error(
        "orbit-dlmm package is required for write operations. Install it: npm install orbit-dlmm"
      );
    });
    const { CipherDlmm } = orbitDlmm;

    const poolAddress = new PublicKey(poolId);
    const dlmm = await CipherDlmm.create(agent.connection, poolAddress, {
      programId: new PublicKey(ORBIT_PROGRAM_ID),
    });

    const pool = dlmm.pool;
    const isXtoY =
      pool.tokenXMint.toBase58() === inputMint.toBase58();
    const inDecimals = isXtoY ? pool.baseDecimals : pool.quoteDecimals;
    const inAmountBn = BigInt(Math.round(inputAmount * 10 ** inDecimals));

    const quote = await dlmm.getQuote({
      inToken: inputMint,
      outToken: outputMint,
      inAmount: inAmountBn,
      isXtoY,
    });
    const minOutAmount = BigInt(
      Math.floor(Number(quote.expectedOutputAmount) * (1 - slippageBps / 10000))
    );

    const tx = await dlmm.swap({
      owner: agent.wallet_address,
      inToken: inputMint,
      outToken: outputMint,
      inAmount: inAmountBn,
      minOutAmount,
      isXtoY,
    });

    tx.sign([agent.wallet]);

    const signature = await agent.connection.sendRawTransaction(
      tx.serialize(),
      { skipPreflight: false, preflightCommitment: "confirmed" }
    );

    await agent.connection.confirmTransaction(signature, "confirmed");

    return signature;
  } catch (error: any) {
    throw new Error(`Orbit swap failed: ${error.message}`);
  }
}
