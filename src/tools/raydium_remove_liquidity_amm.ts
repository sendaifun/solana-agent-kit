import {
  AMM_V4,
  AMM_STABLE,
  ApiV3PoolInfoStandardItem,
  Raydium,
  TxVersion,
} from "@raydium-io/raydium-sdk-v2";
import { SolanaAgentKit } from "../agent";
import BN from "bn.js";
import Decimal from "decimal.js";

const VALID_PROGRAM_ID = new Set([AMM_V4.toBase58(), AMM_STABLE.toBase58()]);

export async function raydiumRemoveLiquidityAmm(
  agent: SolanaAgentKit,
  poolId: string,
  withdrawLpAmount: BN
): Promise<string> {
  const raydium = await Raydium.load({
    owner: agent.wallet,
    connection: agent.connection,
  });
  const data = await raydium.api.fetchPoolById({ ids: poolId });
  const poolInfo = data[0] as ApiV3PoolInfoStandardItem;

  if (!VALID_PROGRAM_ID.has(poolInfo.programId))
    throw new Error("target pool is not AMM pool");

  const [baseRatio, quoteRatio] = [
    new Decimal(poolInfo.mintAmountA).div(poolInfo.lpAmount || 1),
    new Decimal(poolInfo.mintAmountB).div(poolInfo.lpAmount || 1),
  ];

  const withdrawAmountDe = new Decimal(withdrawLpAmount.toString()).div(
    10 ** poolInfo.lpMint.decimals
  );
  const [withdrawAmountA, withdrawAmountB] = [
    withdrawAmountDe.mul(baseRatio).mul(10 ** (poolInfo?.mintA.decimals || 0)),
    withdrawAmountDe.mul(quoteRatio).mul(10 ** (poolInfo?.mintB.decimals || 0)),
  ];

  const lpSlippage = 0.1; // means 1%

  const { execute } = await raydium.liquidity.removeLiquidity({
    poolInfo,
    lpAmount: withdrawLpAmount,
    baseAmountMin: new BN(withdrawAmountA.mul(1 - lpSlippage).toFixed(0)),
    quoteAmountMin: new BN(withdrawAmountB.mul(1 - lpSlippage).toFixed(0)),
    txVersion: TxVersion.V0,
    // optional: set up priority fee here
    // computeBudgetConfig: {
    //   units: 600000,
    //   microLamports: 46591500,
    // },
  });

  const { txId } = await execute({ sendAndConfirm: true });

  return txId;
}
