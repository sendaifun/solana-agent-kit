import AlphaVault, { PoolType, WhitelistMode } from "@meteora-ag/alpha-vault";
import { SolanaAgentKit } from "../agent";
import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import { BN } from "bn.js";

/**
 * Create Meteora FCFS alpha vault 
 * @param agent SolanaAgentKit instance
 * @param tokenAMint Token A mint
 * @param tokenBMint Token B mint
 * @param poolAddress Pool mint
 * @param poolType Either PoolType.DYNAMIC or PoolType.DLMM
 * @param depositingPoint The point when the vault allows deposits
 * @param startVestingPoint The point when the vault starts vesting
 * @param endVestingPoint The point when the vault ends vesting
 * @param maxDepositingCap Maximum number of deposit amount for vault
 * @param individualDepositingCap Maximum number of deposit amount for individual
 * @param escrowFee Fee to create stake escrow account
 * @param whitelistMode Alpha vault whitelist mode
 * @returns 
 */
export async function createMeteoraFcfsAlphaVault(
  agent: SolanaAgentKit,
  tokenAMint: PublicKey,
  tokenBMint: PublicKey,
  poolAddress: PublicKey,
  poolType: PoolType,
  depositingPoint: BN,
  startVestingPoint: BN,
  endVestingPoint: BN,
  maxDepositingCap: BN,
  individualDepositingCap: BN,
  escrowFee: BN,
  whitelistMode: WhitelistMode
): Promise<string> {
  const createAlphaVaultTx = await AlphaVault.createCustomizableFcfsVault(
    agent.connection,
    {
      baseMint: tokenAMint,
      quoteMint: tokenBMint,
      poolAddress,
      poolType,
      depositingPoint,
      startVestingPoint,
      endVestingPoint,
      maxDepositingCap,
      individualDepositingCap,
      escrowFee,
      whitelistMode
    },
    agent.wallet_address
  );

  const createAlphaVaultTxHash = await sendAndConfirmTransaction(
    agent.connection,
    createAlphaVaultTx,
    [agent.wallet],
  ).catch((err) => {
    console.error(err);
    throw err;
  });

  return createAlphaVaultTxHash;
}

/**
 * Create Meteora Prorata alpha vault 
 * @param agent SolanaAgentKit instance
 * @param tokenAMint Token A mint
 * @param tokenBMint Token B mint
 * @param poolAddress Pool mint
 * @param poolType Either PoolType.DYNAMIC or PoolType.DLMM
 * @param depositingPoint The point when the vault allows deposits
 * @param startVestingPoint The point when the vault starts vesting
 * @param endVestingPoint The point when the vault ends vesting
 * @param maxBuyingCap Maximum buying amount
 * @param escrowFee Fee to create stake escrow account
 * @param whitelistMode Alpha vault whitelist mode
 * @returns 
 */
export async function createMeteoraProrataAlphaVault(
  agent: SolanaAgentKit,
  tokenAMint: PublicKey,
  tokenBMint: PublicKey,
  poolAddress: PublicKey,
  poolType: PoolType,
  depositingPoint: BN,
  startVestingPoint: BN,
  endVestingPoint: BN,
  maxBuyingCap: BN,
  escrowFee: BN,
  whitelistMode: WhitelistMode
): Promise<string> {
  const createAlphaVaultTx = await AlphaVault.createCustomizableProrataVault(
    agent.connection,
    {
      baseMint: tokenAMint,
      quoteMint: tokenBMint,
      poolAddress,
      poolType,
      depositingPoint,
      startVestingPoint,
      endVestingPoint,
      maxBuyingCap,
      escrowFee,
      whitelistMode
    },
    agent.wallet_address
  );

  const createAlphaVaultTxHash = await sendAndConfirmTransaction(
    agent.connection,
    createAlphaVaultTx,
    [agent.wallet],
  ).catch((err) => {
    console.error(err);
    throw err;
  });

  return createAlphaVaultTxHash;
}