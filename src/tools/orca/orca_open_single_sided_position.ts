import {
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { SolanaAgentKit } from "../../agent";
import { Wallet } from "../../utils/keypair";
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
 * # Opens a Single-Sided Liquidity Position in an Orca Whirlpool
 *
 * This function opens a single-sided liquidity position in a specified Orca Whirlpool. The user specifies
 * a basis point (bps) offset from the current price for the lower bound and a width (bps) for the range width.
 * The required amount of the other token is calculated automatically.
 *
 * ## Parameters
 * - `agent`: The `SolanaAgentKit` instance representing the wallet and connection details.
 * - `whirlpoolAddress`: The address of the Orca Whirlpool where the position will be opened.
 * - `distanceFromCurrentPriceBps`: The basis point offset from the current price for the lower bound.
 * - `widthBps`: The width of the range as a percentage increment from the lower bound.
 * - `inputTokenMint`: The mint address of the token being deposited (e.g., USDC or another token).
 * - `inputAmount`: The amount of the input token to deposit, specified as a `Decimal` value.
 *
 * ## Returns
 * A `Promise` that resolves to the transaction ID (`string`) of the transaction that opens the position.
 *
 * ## Notes
 * - The `distanceFromCurrentPriceBps` specifies the starting point of the range.
 * - The `widthBps` determines the range size from the lower bound.
 * - The specified `inputTokenMint` determines which token is deposited directly.
 *
 * @param agent - The `SolanaAgentKit` instance representing the wallet and connection.
 * @param whirlpoolAddress - The address of the Orca Whirlpool.
 * @param distanceFromCurrentPriceBps - The basis point offset from the current price for the lower bound.
 * @param widthBps - The width of the range as a percentage increment from the lower bound.
 * @param inputTokenMint - The mint address of the token to deposit.
 * @param inputAmount - The amount of the input token to deposit.
 * @returns A promise resolving to the transaction ID (`string`).
 */
export async function orcaOpenSingleSidedPosition(
  agent: SolanaAgentKit,
  whirlpoolAddress: PublicKey,
  distanceFromCurrentPriceBps: number,
  widthBps: number,
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

    const isTokenA = inputTokenMint.equals(mintInfoA.mint);
    let lowerBoundPrice;
    let upperBoundPrice;
    let lowerTick;
    let upperTick;
    if (isTokenA) {
      lowerBoundPrice = price.mul(1 + distanceFromCurrentPriceBps / 10000);
      upperBoundPrice = lowerBoundPrice.mul(1 + widthBps / 10000);
      upperTick = PriceMath.priceToInitializableTickIndex(
        upperBoundPrice,
        mintInfoA.decimals,
        mintInfoB.decimals,
        whirlpoolData.tickSpacing,
      );
      lowerTick = PriceMath.priceToInitializableTickIndex(
        lowerBoundPrice,
        mintInfoA.decimals,
        mintInfoB.decimals,
        whirlpoolData.tickSpacing,
      );
    } else {
      lowerBoundPrice = price.mul(1 - distanceFromCurrentPriceBps / 10000);
      upperBoundPrice = lowerBoundPrice.mul(1 - widthBps / 10000);
      lowerTick = PriceMath.priceToInitializableTickIndex(
        upperBoundPrice,
        mintInfoA.decimals,
        mintInfoB.decimals,
        whirlpoolData.tickSpacing,
      );
      upperTick = PriceMath.priceToInitializableTickIndex(
        lowerBoundPrice,
        mintInfoA.decimals,
        mintInfoB.decimals,
        whirlpoolData.tickSpacing,
      );
    }

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
      instructions = instructions.concat(
        txPayloadTickArraysDecompiled.instructions,
      );
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
      transactionIds: txId,
      positionMint: positionMint.toString(),
    });
  } catch (error) {
    throw new Error(`${error}`);
  }
}
