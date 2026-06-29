import { OnlinePumpAmmSdk, PUMP_AMM_SDK } from "@pump-fun/pump-swap-sdk";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { sendTx } from "solana-agent-kit";
import { SolanaAgentKit } from "solana-agent-kit";

/**
 * Add liquidity to a PumpFun AMM pool using SOL (Quote)
 * @param agent SolanaAgentKit instance
 * @param pool Pool address
 * @param amount Amount of SOL to deposit
 * @param slippage Slippage tolerance in percentage
 */
export async function addLiquidityWithQuote(
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

  const quoteAmountBN = new BN(amount * 1e9); // SOL has 9 decimals

  const result = PUMP_AMM_SDK.depositAutocompleteBaseAndLpTokenFromQuote(
    liquidityState,
    quoteAmountBN,
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
    baseAmount: result.base.toString(),
    quoteAmount: quoteAmountBN.toString(),
  };
}
