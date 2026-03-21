import { PublicKey } from "@solana/web3.js";
import type { SolanaAgentKit } from "solana-agent-kit";
import { ORBIT_PROGRAM_ID } from "./constants";

/**
 * Remove liquidity from an Orbit Finance DLMM position.
 * Withdraws token X and token Y back to the wallet.
 *
 * @param agent         SolanaAgentKit instance
 * @param poolId        Pool public key (base58) that the position belongs to
 * @param positionId    Position public key (base58) to withdraw from
 * @param bpsToRemove   Basis points of liquidity to remove (1–10000). Default: 10000 (100%).
 * @returns JSON string with transactionId and withdrawal details
 */
export async function orbitRemoveLiquidity(
  agent: SolanaAgentKit,
  poolId: string,
  positionId: string,
  bpsToRemove: number = 10000
): Promise<string> {
  try {
    const orbitDlmm = await import("orbit-dlmm").catch(() => {
      throw new Error(
        "orbit-dlmm package is required for write operations. Install it: npm install orbit-dlmm"
      );
    });
    const { CipherDlmm } = orbitDlmm;

    if (bpsToRemove < 1 || bpsToRemove > 10000) {
      throw new Error("bpsToRemove must be between 1 and 10000");
    }

    const poolAddress = new PublicKey(poolId);
    const dlmm = await CipherDlmm.create(agent.connection, poolAddress, {
      programId: new PublicKey(ORBIT_PROGRAM_ID),
    });

    const tx = await dlmm.removeLiquidity({
      owner: agent.wallet_address,
      position: new PublicKey(positionId),
      bpsToRemove,
      shouldClosePosition: bpsToRemove >= 10000,
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
      positionId,
      bpsRemoved: bpsToRemove,
      positionClosed: bpsToRemove >= 10000,
    });
  } catch (error: any) {
    throw new Error(`Orbit remove liquidity failed: ${error.message}`);
  }
}
