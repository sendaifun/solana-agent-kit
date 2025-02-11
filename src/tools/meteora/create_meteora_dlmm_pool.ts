import { SolanaAgentKit } from "../../agent";
import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";
import DLMM, { ActivationType } from "@meteora-ag/dlmm";
import { getMint } from "@solana/spl-token";
import { sendTx } from "../../utils/send_tx";

/**
 * Create Meteora DLMM pool
 * @param agent SolanaAgentKit instance
 * @param binStep DLMM pool bin step
 * @param tokenAMint Token A mint
 * @param tokenBMint Token B mint
 * @param initialPrice Initial pool price in ratio tokenA / tokenB
 * @param priceRoundingUp Whether to rounding up the initial pool price
 * @param feeBps Pool trading fee in BPS
 * @param activationType Pool activation type (ActivationType.Timestamp or ActivationType.Slot)
 * @param hasAlphaVault Whether the pool has Meteora alpha vault or not
 * @param activationPoint Activation point depending on activation type, or null if pool doesn't have an activation point
 * @returns Transaction signature
 */
export async function createMeteoraDlmmPool(
  agent: SolanaAgentKit,
  binStep: number,
  tokenAMint: PublicKey,
  tokenBMint: PublicKey,
  initialPrice: number,
  priceRoundingUp: boolean,
  feeBps: number,
  activationType: ActivationType,
  hasAlphaVault: boolean,
  activationPoint: BN | undefined,
): Promise<string> {
  const tokenAMintInfo = await getMint(agent.connection, tokenAMint);
  const tokenBMintInfo = await getMint(agent.connection, tokenBMint);

  const initPrice = DLMM.getPricePerLamport(
    tokenAMintInfo.decimals,
    tokenBMintInfo.decimals,
    initialPrice,
  );

  const activateBinId = DLMM.getBinIdFromPrice(
    initPrice,
    binStep,
    !priceRoundingUp,
  );

  const initPoolTx = await DLMM.createCustomizablePermissionlessLbPair(
    agent.connection,
    new BN(binStep),
    tokenAMint,
    tokenBMint,
    new BN(activateBinId.toString()),
    new BN(feeBps),
    activationType,
    hasAlphaVault,
    agent.wallet_address,
    activationPoint,
    {
      cluster: "mainnet-beta",
    },
  );

  const initPoolTxHash = await sendTx(agent, initPoolTx.instructions, [
    agent.wallet,
  ]);

  return initPoolTxHash;
}
