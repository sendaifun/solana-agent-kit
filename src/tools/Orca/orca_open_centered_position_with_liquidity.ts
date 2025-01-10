import {
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { SolanaAgentKit } from "../../agent";
import { Wallet } from "@coral-xyz/anchor";
import { Decimal } from "decimal.js";
import {
  ORCA_WHIRLPOOL_PROGRAM_ID,
  WhirlpoolContext,
  PriceMath,
  buildWhirlpoolClient,
  increaseLiquidityQuoteByInputToken,
  TokenExtensionContextForPool,
  NO_TOKEN_EXTENSION_CONTEXT,
} from "@orca-so/whirlpools-sdk";

import { sendTx } from "../../utils/send_tx";
import { Percentage } from "@orca-so/common-sdk";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

/**
 * # Opens a Centered Liquidity Position in an Orca Whirlpool
 *
 * This function opens a centered liquidity position in a specified Orca Whirlpool. The user defines
 * a basis point (bps) offset from the current price of the pool to set the lower and upper bounds of the position.
 * The user also specifies the token mint and the amount to deposit. The required amount of the other token
 * is calculated automatically.
 *
 * ## Parameters
 * - `agent`: The `SolanaAgentKit` instance representing the wallet and connection details.
 * - `whirlpoolAddress`: The address of the Orca Whirlpool where the position will be opened.
 * - `priceOffsetBps`: The basis point (bps) offset (on one side) from the current price fo the pool. For example,
 *   500 bps (5%) creates a range from 95% to 105% of the current pool price.
 * - `inputTokenMint`: The mint address of the token being deposited (e.g., USDC or another token).
 * - `inputAmount`: The amount of the input token to deposit, specified as a `Decimal` value.
 *
 * ## Returns
 * A `Promise` that resolves to the transaction ID (`string`) of the transaction that opens the position.
 *
 * ## Notes
 * - The `priceOffsetBps` specifies the range symmetrically around the current price.
 * - The specified `inputTokenMint` determines which token is deposited directly. The function calculates
 *   the required amount of the other token based on the specified price range.
 * - This function supports Orca's token extensions for managing tokens with special behaviors.
 * - The function assumes a maximum slippage of 1% for liquidity provision.
 *
 * ## Throws
 * An error will be thrown if:
 * - The specified Whirlpool address is invalid or inaccessible.
 * - The transaction fails to send.
 * - Any required mint information cannot be fetched.
 *
 * @param agent - The `SolanaAgentKit` instance representing the wallet and connection.
 * @param whirlpoolAddress - The address of the Orca Whirlpool.
 * @param priceOffsetBps - The basis point offset (one side) from the current pool price.
 * @param inputTokenMint - The mint address of the token to deposit.
 * @param inputAmount - The amount of the input token to deposit.
 * @returns A promise resolving to the transaction ID (`string`).
 */
export async function orcaOpenCenteredPositionWithLiquidity(
  agent: SolanaAgentKit,
  whirlpoolAddress: PublicKey,
  priceOffsetBps: number,
  inputTokenMint: PublicKey,
  inputAmount: Decimal,
): Promise<string> {
  try {
    const wallet = new Wallet(agent.wallet);
    const ctx = WhirlpoolContext.from(
      agent.connection,
      wallet,
      ORCA_WHIRLPOOL_PROGRAM_ID,
    );
    const client = buildWhirlpoolClient(ctx);

    const whirlpool = await client.getPool(whirlpoolAddress);
    const whirlpoolData = whirlpool.getData();
    const mintInfoA = whirlpool.getTokenAInfo();
    const mintInfoB = whirlpool.getTokenBInfo();
    const price = PriceMath.sqrtPriceX64ToPrice(
      whirlpoolData.sqrtPrice,
      mintInfoA.decimals,
      mintInfoB.decimals,
    );

    const lowerPrice = price.mul(1 - priceOffsetBps / 10000);
    const upperPrice = price.mul(1 + priceOffsetBps / 10000);
    const lowerTick = PriceMath.priceToInitializableTickIndex(
      lowerPrice,
      mintInfoA.decimals,
      mintInfoB.decimals,
      whirlpoolData.tickSpacing,
    );
    const upperTick = PriceMath.priceToInitializableTickIndex(
      upperPrice,
      mintInfoA.decimals,
      mintInfoB.decimals,
      whirlpoolData.tickSpacing,
    );

    const txBuilderTickArrays = await whirlpool.initTickArrayForTicks([
      lowerTick,
      upperTick,
    ]);
    let instructions: TransactionInstruction[] = [];
    let signers: Keypair[] = [];
    if (txBuilderTickArrays !== null) {
      const txPayloadTickArrays = await txBuilderTickArrays.build();
      const txPayloadTickArraysDecompiled = TransactionMessage.decompile(
        (txPayloadTickArrays.transaction as VersionedTransaction).message,
      );
      const instructionsTickArrays = txPayloadTickArraysDecompiled.instructions;
      instructions = instructions.concat(instructionsTickArrays);
      signers = signers.concat(txPayloadTickArrays.signers as Keypair[]);
    }

    const tokenExtensionCtx: TokenExtensionContextForPool = {
      ...NO_TOKEN_EXTENSION_CONTEXT,
      tokenMintWithProgramA: mintInfoA,
      tokenMintWithProgramB: mintInfoB,
    };
    const increaseLiquiditQuote = increaseLiquidityQuoteByInputToken(
      inputTokenMint,
      inputAmount,
      lowerTick,
      upperTick,
      Percentage.fromFraction(1, 100),
      whirlpool,
      tokenExtensionCtx,
    );
    const { positionMint, tx: txBuilder } =
      await whirlpool.openPositionWithMetadata(
        lowerTick,
        upperTick,
        increaseLiquiditQuote,
        undefined,
        undefined,
        undefined,
        TOKEN_2022_PROGRAM_ID,
      );

    const txPayload = await txBuilder.build();
    const txPayloadDecompiled = TransactionMessage.decompile(
      (txPayload.transaction as VersionedTransaction).message,
    );
    instructions = instructions.concat(txPayloadDecompiled.instructions);
    signers = signers.concat(txPayload.signers as Keypair[]);

    const txId = await sendTx(agent, instructions, signers);
    return JSON.stringify({
      transactionId: txId,
      positionMint: positionMint.toString(),
    });
  } catch (error) {
    throw new Error(`${error}`);
  }
}
