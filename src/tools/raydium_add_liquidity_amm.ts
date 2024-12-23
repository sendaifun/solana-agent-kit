import {
  AMM_V4,
  AMM_STABLE,
  ApiV3PoolInfoStandardItem,
  Raydium,
  TxVersion,
  Percent,
  TokenAmount,
  toToken,
} from "@raydium-io/raydium-sdk-v2";
import { SolanaAgentKit } from "../agent";
import Decimal from "decimal.js";

const VALID_PROGRAM_ID = new Set([AMM_V4.toBase58(), AMM_STABLE.toBase58()]);

export async function raydiumAddLiquidityAmm(
  agent: SolanaAgentKit,
  poolId: string,
  inputAmount: Decimal
): Promise<string> {
  const raydium = await Raydium.load({
    owner: agent.wallet,
    connection: agent.connection,
  });
  const data = await raydium.api.fetchPoolById({ ids: poolId });
  const poolInfo = data[0] as ApiV3PoolInfoStandardItem;

  if (!VALID_PROGRAM_ID.has(poolInfo.programId))
    throw new Error("target pool is not AMM pool");

  const r = raydium.liquidity.computePairAmount({
    poolInfo,
    amount: inputAmount,
    baseIn: true,
    slippage: new Percent(1, 100), // 1%
  });

  const { execute } = await raydium.liquidity.addLiquidity({
    poolInfo,
    amountInA: new TokenAmount(
      toToken(poolInfo.mintA),
      new Decimal(inputAmount).mul(10 ** poolInfo.mintA.decimals).toFixed(0)
    ),
    amountInB: new TokenAmount(
      toToken(poolInfo.mintB),
      new Decimal(r.maxAnotherAmount.toExact())
        .mul(10 ** poolInfo.mintB.decimals)
        .toFixed(0)
    ),
    otherAmountMin: r.minAnotherAmount,
    fixedSide: "a",
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
