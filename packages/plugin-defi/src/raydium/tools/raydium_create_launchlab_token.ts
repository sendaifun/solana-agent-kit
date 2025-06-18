import {
  Raydium,
  TxVersion,
  LAUNCHPAD_PROGRAM,
  getPdaLaunchpadConfigId,
  LaunchpadConfig,
  LaunchpadPoolInitParam,
} from "@raydium-io/raydium-sdk-v2";
import { NATIVE_MINT } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";
import BN from "bn.js";
import { signOrSendTX, SolanaAgentKit } from "solana-agent-kit";

interface RaydiumCreateLaunchlabTokenParams {
  name: string;
  symbol: string;
  decimals?: number;
  supply?: number;
  migrateType?: "amm" | "cpmm";
  uri: string;
  txVersion?: TxVersion;
  buyAmount?: BN;
  createOnly: boolean;
  extraSigners?: Keypair[];
  platformId?: string;
  slippageBps?: number;
}

interface RaydiumCreateLaunchlabTokenComputeBudgetConfig {
  units: number;
  microLamports: number;
}

export async function raydiumCreateLaunchlabToken(
  agent: SolanaAgentKit,
  tokenParams: RaydiumCreateLaunchlabTokenParams,
  computeBudgetConfig?: RaydiumCreateLaunchlabTokenComputeBudgetConfig,
) {
  // defaults
  tokenParams.supply =
    tokenParams.supply || LaunchpadPoolInitParam.supply.toNumber();
  tokenParams.platformId =
    tokenParams.platformId || LaunchpadPoolInitParam.platformId.toBase58();
  tokenParams.migrateType = tokenParams.migrateType || "amm";
  tokenParams.txVersion = tokenParams.txVersion || TxVersion.V0;
  tokenParams.decimals = tokenParams.decimals || 6;
  tokenParams.extraSigners = tokenParams.extraSigners || [];

  try {
    const raydium = await Raydium.load({
      connection: agent.connection,
      owner: agent.wallet.publicKey,
    });
    const newTokenKeypair = Keypair.generate();
    const newTokenMint = newTokenKeypair.publicKey;

    const configId = getPdaLaunchpadConfigId(
      LAUNCHPAD_PROGRAM,
      NATIVE_MINT,
      0,
      0,
    ).publicKey;
    const configData = await raydium.connection.getAccountInfo(configId);

    if (!configData) {
      throw new Error("Launchpad config not found");
    }

    const configInfo = LaunchpadConfig.decode(configData.data);
    const baseTokenInfo = await raydium.token.getTokenInfo(configInfo.mintB);

    const { transactions } = await raydium.launchpad.createLaunchpad({
      programId: LAUNCHPAD_PROGRAM,
      mintA: newTokenMint,
      decimals: tokenParams.decimals,
      name: tokenParams.name,
      symbol: tokenParams.symbol,
      migrateType: tokenParams.migrateType,
      uri: tokenParams.uri,
      feePayer: agent.wallet.publicKey,
      configId,
      configInfo,
      mintBDecimals: baseTokenInfo.decimals,
      platformId: new PublicKey(tokenParams.platformId), // default RAYDIUM platform 4Bu96XjU84XjPDSpveTVf6LYGCkfW5FK7SNkREWcEfV4
      txVersion: TxVersion.V0,
      slippage: new BN(tokenParams.slippageBps ?? 100), // default 1% slippage
      buyAmount: tokenParams.buyAmount ?? new BN(0),
      createOnly: tokenParams.createOnly, // true means create mint only, false will "create and buy together"
      extraSigners: [newTokenKeypair, ...tokenParams.extraSigners],
      supply: new BN(tokenParams.supply),
      computeBudgetConfig,
    });

    const blockhash = (await agent.connection.getLatestBlockhash()).blockhash;

    transactions.forEach((tx) => {
      tx.message.recentBlockhash = blockhash;
      tx.sign([newTokenKeypair]);
    });

    const sigOrTx = await signOrSendTX(agent, transactions);

    if (agent.config.signOnly) {
      return sigOrTx;
    }

    return {
      signatures: sigOrTx,
      newTokenAddress: newTokenMint.toBase58(),
    };
  } catch (e: any) {
    throw new Error(
      `Failed to create Raydium Launchpad token: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
}
