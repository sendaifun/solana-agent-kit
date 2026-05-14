import { PublicKey } from "@solana/web3.js";
import type { SolanaAgentKit } from "solana-agent-kit";
import { ORBIT_PROGRAM_ID } from "./constants";

/**
 * Add liquidity to an Orbit Finance DLMM pool.
 * Opens a new position across a specified bin range.
 *
 * Orbit DLMM uses BinArray[64] — max position width is 64 bins.
 * Use orbitGetPrice to find the current activeBinId as a reference point.
 *
 * @param agent       SolanaAgentKit instance
 * @param poolId      Pool public key (base58)
 * @param amountX     Amount of token X (base) to deposit in human-readable units
 * @param amountY     Amount of token Y (quote) to deposit in human-readable units
 * @param lowerBinId  Lower bound of the position range (inclusive)
 * @param upperBinId  Upper bound of the position range (inclusive). Max width: 64 bins.
 * @param strategy    Distribution strategy. Default: "uniform"
 * @returns JSON string with transactionId and position details
 */
export async function orbitAddLiquidity(
  agent: SolanaAgentKit,
  poolId: string,
  amountX: number,
  amountY: number,
  lowerBinId: number,
  upperBinId: number,
  strategy: "uniform" | "balanced" | "concentrated" | "skew_bid" | "skew_ask" | "bid_ask" = "uniform"
): Promise<string> {
  try {
    const orbitDlmm = await import("orbit-dlmm").catch(() => {
      throw new Error(
        "orbit-dlmm package is required for write operations. Install it: npm install orbit-dlmm"
      );
    });
    const { CipherDlmm } = orbitDlmm;

    if (upperBinId - lowerBinId > 63) {
      throw new Error(
        `Bin range too wide: ${upperBinId - lowerBinId} bins. Orbit DLMM maximum is 64 bins per position.`
      );
    }

    if (upperBinId < lowerBinId) {
      throw new Error("upperBinId must be >= lowerBinId");
    }

    const poolAddress = new PublicKey(poolId);
    const dlmm = await CipherDlmm.create(agent.connection, poolAddress, {
      programId: new PublicKey(ORBIT_PROGRAM_ID),
    });

    const pool = dlmm.pool;
    const xAmountBn = BigInt(Math.round(amountX * 10 ** pool.baseDecimals));
    const yAmountBn = BigInt(Math.round(amountY * 10 ** pool.quoteDecimals));

    const tx = await dlmm.addLiquidityByStrategy({
      owner: agent.wallet_address,
      lowerBinId,
      upperBinId,
      totalXAmount: xAmountBn,
      totalYAmount: yAmountBn,
      strategy: { strategyType: strategy },
    });

    tx.sign([agent.wallet]);

    const signature = await agent.connection.sendRawTransaction(
      tx.serialize(),
      { skipPreflight: false, preflightCommitment: "confirmed" }
    );

    await agent.connection.confirmTransaction(signature, "confirmed");

    return JSON.stringify({
      transactionId: signature,
      poolId,
      lowerBinId,
      upperBinId,
      amountX,
      amountY,
      strategy,
    });
  } catch (error: any) {
    throw new Error(`Orbit add liquidity failed: ${error.message}`);
  }
}
