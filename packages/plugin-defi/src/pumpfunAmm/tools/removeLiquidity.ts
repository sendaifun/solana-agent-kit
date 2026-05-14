import { OnlinePumpAmmSdk, PUMP_AMM_SDK } from "@pump-fun/pump-swap-sdk";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { sendTx } from "solana-agent-kit";
import { SolanaAgentKit } from "solana-agent-kit";

/**
 * Remove liquidity from a PumpFun AMM pool
 * @param agent SolanaAgentKit instance
 * @param pool Pool address
 * @param lpAmount Amount of LP tokens to burn
 * @param slippage Slippage tolerance in percentage
 */
export async function removeLiquidity(
  agent: SolanaAgentKit,
  pool: string,
  lpAmount: number,
  slippage: number,
) {
  const sdk = new OnlinePumpAmmSdk(agent.connection);
  const poolKey = new PublicKey(pool);

  const liquidityState = await sdk.liquiditySolanaState(
    poolKey,
    agent.wallet.publicKey,
  );

  const poolInfo = await sdk.fetchPool(poolKey);
  const _lpMint = poolInfo.lpMint;

  // Assuming 6 decimals for LP tokens
  const lpAmountBN = new BN(lpAmount * 1e6);

  const result = PUMP_AMM_SDK.withdrawAutoCompleteBaseAndQuoteFromLpToken(
    liquidityState,
    lpAmountBN,
    slippage,
  );

  const instructions = await PUMP_AMM_SDK.withdrawInstructions(
    liquidityState,
    lpAmountBN,
    slippage,
  );

  const tx = await sendTx(agent, instructions);

  return {
    status: "success",
    signature: tx,
    baseAmountOut: result.base.toString(),
    quoteAmountOut: result.quote.toString(),
  };
}
