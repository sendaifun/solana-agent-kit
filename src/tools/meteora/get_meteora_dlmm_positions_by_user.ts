import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../../agent";
import DLMM from "@meteora-ag/dlmm";
import Decimal from "decimal.js";

interface Position {
  positionAddress: string;
  xAmount: number;
  yAmount: number;
  xReward: number;
  yReward: number;
  xFee: number;
  yFee: number;
}

/**
 * Get Meteora DLMM positions by user in a specific pool
 * @param agent
 * @param userPubKey The public key of the user; if not provided, the agent's wallet public key will be used
 */
export default async function getMeteoraDLMMPositionsByUser(
  agent: SolanaAgentKit,
  userPubKey?: string,
) {
  const userPublicKey = userPubKey
    ? new PublicKey(userPubKey)
    : agent.wallet.publicKey;
  // const dlmmPool = await DLMM.create(agent.connection, poolPublicKey);
  const poolPositions = await DLMM.getAllLbPairPositionsByUser(
    agent.connection,
    userPublicKey,
  );

  const pools: {
    poolAddress: string;
    tokenX: string;
    tokenY: string;
    positions: Position[];
  }[] = [];

  for (const position of poolPositions) {
    const [_key, posinfo] = position;
    const positions = posinfo.lbPairPositionsData.map((v) => ({
      positionAddress: v.publicKey.toBase58(),
      xAmount: new Decimal(v.positionData.totalXAmount)
        .div(posinfo.tokenX.decimal)
        .toNumber(),
      yAmount: new Decimal(v.positionData.totalYAmount)
        .div(posinfo.tokenY.decimal)
        .toNumber(),
      xReward: new Decimal(v.positionData.rewardOne.toNumber())
        .div(posinfo.tokenX.decimal)
        .toNumber(),
      yReward: new Decimal(v.positionData.rewardTwo.toNumber())
        .div(posinfo.tokenY.decimal)
        .toNumber(),
      xFee: new Decimal(v.positionData.feeX.toNumber())
        .div(posinfo.tokenX.decimal)
        .toNumber(),
      yFee: new Decimal(v.positionData.feeY.toNumber())
        .div(posinfo.tokenY.decimal)
        .toNumber(),
    }));

    pools.push({
      poolAddress: posinfo.publicKey.toBase58(),
      tokenX: posinfo.tokenX.publicKey.toBase58(),
      tokenY: posinfo.tokenY.publicKey.toBase58(),
      positions,
    });
  }

  return pools;
}
