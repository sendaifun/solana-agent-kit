import {
  Keypair,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";
import { Wallet } from "../utils/keypair";
import { Decimal } from "decimal.js";
import {
  ORCA_WHIRLPOOL_PROGRAM_ID,
  WhirlpoolContext,
  PriceMath,
  PoolUtil,
  buildWhirlpoolClient,
} from "@orca-so/whirlpools-sdk";
import { sendTx } from "../utils/send_tx";
import { FEE_TIERS } from "./orca_create_single_sided_liquidity_pool";

/**
 * # Creates a CLMM Pool (Concentrated Liquidity Market Maker Pool).
 *
 * This function initializes a new Whirlpool (CLMM Pool) on Orca. It only sets up the pool and does not seed it with liquidity.
 *
 * ## Example Usage:
 * Suppose you want to create a CLMM pool with two tokens, SHARK and USDC, and set the initial price of SHARK to 0.001 USDC.
 * You would call this function with `mintA` as SHARK's mint address and `mintB` as USDC's mint address. The pool is created
 * with the specified fee tier and tick spacing associated with that fee tier.
 *
 * ### Note for Experts:
 * The Whirlpool program determines the token mint order, which might not match your expectation. This function
 * adjusts the input order as needed and inverts the initial price accordingly.
 *
 * @param agent - The `SolanaAgentKit` instance representing the wallet and connection details.
 * @param mintDeploy - The mint of the token you want to deploy (e.g., SHARK).
 * @param mintPair - The mint of the token you want to pair the deployed mint with (e.g., USDC).
 * @param initialPrice - The initial price of `mintDeploy` in terms of `mintPair`.
 * @param feeTier - The fee tier bps for the pool, determining tick spacing and fee collection rates.
 *
 * @returns A promise that resolves to a transaction ID (`string`) of the transaction creating the pool.
 *
 * @throws Will throw an error if:
 * - Mint accounts for the tokens cannot be fetched.
 * - The network is unsupported.
 *
 * @remarks
 * This function only initializes the CLMM pool and does not add liquidity. For adding liquidity, you can use
 * a separate function after the pool is successfully created.
 * ```
 */
export async function orcaCreateCLMM(
  agent: SolanaAgentKit,
  mintDeploy: PublicKey,
  mintPair: PublicKey,
  initialPrice: Decimal,
  feeTier: keyof typeof FEE_TIERS,
): Promise<string> {
  try {
    let whirlpoolsConfigAddress: PublicKey;
    if (agent.connection.rpcEndpoint.includes("mainnet")) {
      whirlpoolsConfigAddress = new PublicKey(
        "2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ",
      );
    } else if (agent.connection.rpcEndpoint.includes("devnet")) {
      whirlpoolsConfigAddress = new PublicKey(
        "FcrweFY1G9HJAHG5inkGB6pKg1HZ6x9UC2WioAfWrGkR",
      );
    } else {
      throw new Error("Unsupported network");
    }
    const wallet = new Wallet(agent.wallet);
    const ctx = WhirlpoolContext.from(
      agent.connection,
      wallet,
      ORCA_WHIRLPOOL_PROGRAM_ID,
    );
    const fetcher = ctx.fetcher;
    const client = buildWhirlpoolClient(ctx);

    const correctTokenOrder = PoolUtil.orderMints(mintDeploy, mintPair).map(
      (addr) => addr.toString(),
    );
    const isCorrectMintOrder = correctTokenOrder[0] === mintDeploy.toString();
    let mintA;
    let mintB;
    if (!isCorrectMintOrder) {
      [mintA, mintB] = [mintPair, mintDeploy];
      initialPrice = new Decimal(1 / initialPrice.toNumber());
    } else {
      [mintA, mintB] = [mintDeploy, mintPair];
    }
    const mintAAccount = await fetcher.getMintInfo(mintA);
    const mintBAccount = await fetcher.getMintInfo(mintB);
    if (mintAAccount === null || mintBAccount === null) {
      throw Error("Mint account not found");
    }

    const tickSpacing = FEE_TIERS[feeTier];
    const initialTick = PriceMath.priceToInitializableTickIndex(
      initialPrice,
      mintAAccount.decimals,
      mintBAccount.decimals,
      tickSpacing,
    );
    const { poolKey, tx: txBuilder } = await client.createPool(
      whirlpoolsConfigAddress,
      mintA,
      mintB,
      tickSpacing,
      initialTick,
      wallet.publicKey,
    );

    const txPayload = await txBuilder.build();
    const txPayloadDecompiled = TransactionMessage.decompile(
      (txPayload.transaction as VersionedTransaction).message,
    );
    const instructions = txPayloadDecompiled.instructions;

    const txId = await sendTx(
      agent,
      instructions,
      txPayload.signers as Keypair[],
    );
    return JSON.stringify({
      transactionId: txId,
      whirlpoolAddress: poolKey.toString(),
    });
  } catch (error) {
    throw new Error(`${error}`);
  }
}
