import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../../agent";
import DLMM from "@meteora-ag/dlmm";
import BN from "bn.js";
import { sendTx } from "../../utils/send_tx";

/**
 * Remove liquidity from a Meteora DLMM position or close the position and claim the rewards
 * @param agent
 * @param poolAddress The address of the pool
 * @param positionAddress The address of the position
 * @param percentageOfLiquidityToRemove The percentage of liquidity to remove e.g 100 for 100%
 * @param shouldClaimAndClose Whether to claim and close the position or just remove liquidity
 */
export default async function removeOrCloseLiquidityFromMeteoraDLMMPosition(
  agent: SolanaAgentKit,
  poolAddress: string,
  positionAddress: string,
  percentageOfLiquidityToRemove: number,
  shouldClaimAndClose = false,
) {
  const poolPublicKey = new PublicKey(poolAddress);
  const positionPublicKey = new PublicKey(positionAddress);
  const dlmmPool = await DLMM.create(agent.connection, poolPublicKey);

  const { positionData } = await dlmmPool.getPosition(positionPublicKey);
  const binIDsToRemove = positionData.positionBinData.map(
    (binData) => binData.binId,
  );

  const removeLiquidityInstructions = await dlmmPool.removeLiquidity({
    binIds: binIDsToRemove,
    bps: new BN(percentageOfLiquidityToRemove * 100),
    position: positionPublicKey,
    user: agent.wallet.publicKey,
    shouldClaimAndClose,
  });

  const txSig = await sendTx(
    agent,
    Array.isArray(removeLiquidityInstructions)
      ? removeLiquidityInstructions.flatMap((v) => v.instructions)
      : removeLiquidityInstructions.instructions,
  );

  return {
    txSig,
    positionAddress,
  };
}
