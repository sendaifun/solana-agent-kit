import AmmImpl from "@mercurial-finance/dynamic-amm-sdk";
import { SolanaAgentKit } from "../../agent";
import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";
import { CustomizableParams } from "@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/types";
import { sendTx } from "../../utils/send_tx";

/**
 * Create Meteora Dynamic AMM pool
 * @param agent SolanaAgentKit instance
 * @param tokenAMint Token A mint
 * @param tokenBMint Token B mint
 * @param tokenAAmount Token A amount in lamport units
 * @param tokenBAmount Token B amount in lamport units
 * @param customizableParams Parameters to create Dynamic AMM pool
 *        tradeFeeNumerator (number): Trade fee numerator, with default denominator is 100000
 *        activationType (enum): Should be ActivationType.Timestamp or ActivationType.Slot
 *        activationPoint (BN | null): Activation point depending on activation type, or null if pool doesn't have an activation point
 *        hasAlphaVault (boolean): Whether the pool has Meteora alpha vault or not
 *        padding (Array<number>): Should be set to value Array(90).fill(0)
 * @returns Transaction signature
 */
export async function createMeteoraDynamicAMMPool(
  agent: SolanaAgentKit,
  tokenAMint: PublicKey,
  tokenBMint: PublicKey,
  tokenAAmount: BN,
  tokenBAmount: BN,
  customizableParams: CustomizableParams,
): Promise<string> {
  const initPoolTx =
    await AmmImpl.createCustomizablePermissionlessConstantProductPool(
      agent.connection,
      agent.wallet_address,
      tokenAMint,
      tokenBMint,
      tokenAAmount,
      tokenBAmount,
      customizableParams,
    );

  const initPoolTxHash = await sendTx(agent, initPoolTx.instructions, [
    agent.wallet,
  ]);

  return initPoolTxHash;
}
