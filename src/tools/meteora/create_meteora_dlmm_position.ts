import DLMM, { StrategyType } from "@meteora-ag/dlmm";
import { SolanaAgentKit } from "../../agent";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { Keypair } from "@solana/web3.js";
import { getComputeBudgetInstructions, sendTx } from "../../utils/send_tx";
import { sendAndConfirmTransaction } from "@solana/web3.js";

/**
 * Create a Meteora DLMM position
 * @param agent
 * @param poolAddress The address of the pool to create the position in
 * @param tokenAAmount The amount of token A to deposit
 * @param tokenBAmount The amount of token B to deposit
 * @param strategy The strategy to use for the position
 * @param rangeInterval The range interval for the position
 */
export default async function createMeteoraDLMMPosition(
  agent: SolanaAgentKit,
  poolAddress: string,
  tokenAAmount: number,
  tokenBAmount: number,
  strategy: StrategyType,
  rangeInterval = 10,
) {
  const poolPublicKey = new PublicKey(poolAddress);
  const dlmmPool = await DLMM.create(agent.connection, poolPublicKey);
  const activeBin = await dlmmPool.getActiveBin();
  const positionKeyPair = new Keypair();

  const minBinID = activeBin.binId - rangeInterval;
  const maxBinID = activeBin.binId + rangeInterval;

  const totalTokenAAmount = new BN(tokenAAmount);
  const totalTokenBAmount = new BN(tokenBAmount);

  const positionInstructions =
    await dlmmPool.initializePositionAndAddLiquidityByStrategy({
      positionPubKey: positionKeyPair.publicKey,
      strategy: {
        maxBinId: maxBinID,
        minBinId: minBinID,
        strategyType: strategy,
      },
      totalXAmount: totalTokenAAmount,
      totalYAmount: totalTokenBAmount,
      user: agent.wallet.publicKey,
    });

  const computeBudgetIX = await getComputeBudgetInstructions(
    agent,
    positionInstructions.instructions,
    "max",
  );

  positionInstructions.instructions.push(
    computeBudgetIX.computeBudgetLimitInstruction,
    computeBudgetIX.computeBudgetPriorityFeeInstructions,
  );
  positionInstructions.recentBlockhash = (
    await agent.connection.getLatestBlockhash()
  ).blockhash;

  const txSig = await sendAndConfirmTransaction(
    agent.connection,
    positionInstructions,
    [agent.wallet],
  );
  // const txSig = await sendTx(agent, positionInstructions.instructions, [
  // 	positionKeyPair,
  // ]);

  return {
    txSig,
    positionAddress: positionKeyPair.publicKey.toBase58(),
  };
}
