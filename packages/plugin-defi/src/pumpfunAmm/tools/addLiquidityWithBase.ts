import { OnlinePumpAmmSdk, PUMP_AMM_SDK } from "@pump-fun/pump-swap-sdk";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { sendTx } from "solana-agent-kit";
import { SolanaAgentKit } from "solana-agent-kit";

/**
 * Add liquidity to a PumpFun AMM pool using Base Token
 * @param agent SolanaAgentKit instance
 * @param pool Pool address
 * @param amount Amount of Base Token to deposit
 * @param slippage Slippage tolerance in percentage
 */
export async function addLiquidityWithBase(
  agent: SolanaAgentKit,
  pool: string,
  amount: number,
  slippage: number,
) {
  const sdk = new OnlinePumpAmmSdk(agent.connection);
  const poolKey = new PublicKey(pool);

  const liquidityState = await sdk.liquiditySolanaState(
    poolKey,
    agent.wallet.publicKey,
  );

  // Fetch base decimals dynamically
  const { getMint } = await import("@solana/spl-token");
  const baseMint = liquidityState.pool.baseMint;
  const baseMintInfo = await getMint(agent.connection, baseMint);
  const baseDecimals = baseMintInfo.decimals;

  const baseAmountBN = new BN(amount * Math.pow(10, baseDecimals));

  const result = PUMP_AMM_SDK.depositAutocompleteQuoteAndLpTokenFromBase(
    liquidityState,
    baseAmountBN,
    slippage,
  );

  const instructions = await PUMP_AMM_SDK.depositInstructions(
    liquidityState,
    result.lpToken,
    slippage,
  );

  const tx = await sendTx(agent, instructions);

  return {
    status: "success",
    signature: tx,
    pool: pool,
    lpAmount: result.lpToken.toString(),
    baseAmount: baseAmountBN.toString(),
    quoteAmount: result.quote.toString(),
  };
}
