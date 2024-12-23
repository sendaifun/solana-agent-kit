import {
  ApiV3PoolInfoConcentratedItem,
  CLMM_PROGRAM_ID,
  Raydium,
  TxVersion,
} from "@raydium-io/raydium-sdk-v2";
import { SolanaAgentKit } from "../agent";

export async function raydiumClosePositionClmm(
  agent: SolanaAgentKit,
  poolId: string
): Promise<string> {
  const raydium = await Raydium.load({
    owner: agent.wallet,
    connection: agent.connection,
  });

  const data = await raydium.api.fetchPoolById({ ids: poolId });
  const poolInfo = data[0] as ApiV3PoolInfoConcentratedItem;
  if (poolInfo.programId !== CLMM_PROGRAM_ID.toBase58())
    throw new Error("target pool is not CLMM pool");

  const allPosition = await raydium.clmm.getOwnerPositionInfo({
    programId: poolInfo.programId,
  });
  if (!allPosition.length) throw new Error("user do not have any positions");

  const position = allPosition.find((p) => p.poolId.toBase58() === poolInfo.id);
  if (!position)
    throw new Error(`user do not have position in pool: ${poolInfo.id}`);

  const { execute } = await raydium.clmm.closePosition({
    poolInfo,
    ownerPosition: position,
    txVersion: TxVersion.V0,
  });

  const { txId } = await execute({ sendAndConfirm: true });

  return txId;
}
