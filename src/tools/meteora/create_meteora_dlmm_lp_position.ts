import { Keypair, PublicKey } from "@solana/web3.js";
import DLMM, { StrategyType } from "@meteora-ag/dlmm";
import BN from "bn.js";
import { SolanaAgentKit } from "../../agent";
import { sendTx } from "../../utils/send_tx";

export async function createMeteoraDlmmLpPosition(
  agent: SolanaAgentKit,
  pool: PublicKey,
  totalXAmount: BN,
): Promise<string> {
  const dlmmPool = await DLMM.create(agent.connection, pool);

  const activeBin = await dlmmPool.getActiveBin();
  const activeBinPriceLamport = activeBin.price;
  const activeBinPricePerToken = dlmmPool.fromPricePerLamport(
    Number(activeBin.price),
  );

  const newBalancePosition = Keypair.generate();

  const TOTAL_RANGE_INTERVAL = 10; // 10 bins on each side of the active bin
  const minBinId = activeBin.binId - TOTAL_RANGE_INTERVAL;
  const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL;

  const totalYAmount = totalXAmount.mul(new BN(Number(activeBinPricePerToken)));

  const createPositionTx =
    await dlmmPool.initializePositionAndAddLiquidityByStrategy({
      positionPubKey: newBalancePosition.publicKey,
      user: agent.wallet.publicKey,
      totalXAmount,
      totalYAmount,
      strategy: {
        maxBinId,
        minBinId,
        strategyType: StrategyType.SpotBalanced,
      },
    });

  try {
    const createBalancePositionTxHash = await sendTx(
      agent,
      createPositionTx.instructions,
      [agent.wallet, newBalancePosition],
    );

    return createBalancePositionTxHash;
  } catch (error) {
    console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
    throw new Error("Failed to create balance position");
  }
}
