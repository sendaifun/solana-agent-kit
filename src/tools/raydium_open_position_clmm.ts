import {
  ApiV3PoolInfoConcentratedItem,
  CLMM_PROGRAM_ID,
  PoolUtils,
  Raydium,
  TickUtils,
  TxVersion,
} from "@raydium-io/raydium-sdk-v2";
import BN from "bn.js";
import Decimal from "decimal.js";
import { SolanaAgentKit } from "../agent";

export async function raydiumOpenPositionClmm(
  agent: SolanaAgentKit,
  poolId: string,
  inputAmount: Decimal,
  startPrice: Decimal,
  endPrice: Decimal
): Promise<string> {
  const raydium = await Raydium.load({
    owner: agent.wallet,
    connection: agent.connection,
  });

  const data = await raydium.api.fetchPoolById({ ids: poolId });
  const poolInfo = data[0] as ApiV3PoolInfoConcentratedItem;
  if (poolInfo.programId !== CLMM_PROGRAM_ID.toBase58())
    throw new Error("target pool is not CLMM pool");

  const rpcData = await raydium.clmm.getRpcClmmPoolInfo({
    poolId: poolInfo.id,
  });
  poolInfo.price = rpcData.currentPrice;

  const { tick: lowerTick } = TickUtils.getPriceAndTick({
    poolInfo,
    price: new Decimal(startPrice),
    baseIn: true,
  });

  const { tick: upperTick } = TickUtils.getPriceAndTick({
    poolInfo,
    price: new Decimal(endPrice),
    baseIn: true,
  });

  const epochInfo = await raydium.fetchEpochInfo();
  const res = await PoolUtils.getLiquidityAmountOutFromAmountIn({
    poolInfo,
    slippage: 0,
    inputA: true,
    tickUpper: Math.max(lowerTick, upperTick),
    tickLower: Math.min(lowerTick, upperTick),
    amount: new BN(
      new Decimal(inputAmount || "0")
        .mul(10 ** poolInfo.mintA.decimals)
        .toFixed(0)
    ),
    add: true,
    amountHasFee: true,
    epochInfo: epochInfo,
  });

  const { execute } = await raydium.clmm.openPositionFromBase({
    poolInfo,
    tickUpper: Math.max(lowerTick, upperTick),
    tickLower: Math.min(lowerTick, upperTick),
    base: "MintA",
    ownerInfo: {
      useSOLBalance: true,
    },
    baseAmount: new BN(
      new Decimal(inputAmount || "0")
        .mul(10 ** poolInfo.mintA.decimals)
        .toFixed(0)
    ),
    otherAmountMax: res.amountSlippageB.amount,
    txVersion: TxVersion.V0,
    // optional: set up priority fee here
    computeBudgetConfig: {
      units: 600000,
      microLamports: 100000,
    },
  });

  const { txId } = await execute({ sendAndConfirm: true });

  return txId;
}
