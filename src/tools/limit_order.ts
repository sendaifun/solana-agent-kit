import {
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { SolanaAgentKit } from "../index";
import {
  ManifestClient,
  WrapperPlaceOrderParamsExternal,
  OrderType,
} from "@cks-systems/manifest-sdk";

/**
 * Place limit orders using Manifest
 * @param agent SolanaAgentKit instance
 * @param marketId Public key for the manifest market
 * @param quantity Amount to trade in tokens
 * @param side Buy or Sell
 * @param price Price in tokens ie. SOL/USDC
 * @returns Transaction signature
 */
export async function limitOrder(
  agent: SolanaAgentKit,
  marketId: PublicKey,
  quantity: number,
  side: string,
  price: number,
): Promise<string> {
  try {
    const mfxClient = await ManifestClient.getClientForMarket(
      agent.connection,
      marketId,
      agent.wallet,
    );

    const orderParams: WrapperPlaceOrderParamsExternal = {
      numBaseTokens: quantity,
      tokenPrice: price,
      isBid: side === "Buy",
      lastValidSlot: 0,
      orderType: OrderType.Limit,
      clientOrderId: Number(Math.random() * 1000),
    };

    const depositPlaceOrderIx: TransactionInstruction[] =
      await mfxClient.placeOrderWithRequiredDepositIx(
        agent.wallet.publicKey,
        orderParams,
      );
    const signature = await sendAndConfirmTransaction(
      agent.connection,
      new Transaction().add(...depositPlaceOrderIx),
      [agent.wallet],
    );

    return signature;
  } catch (error: any) {
    throw new Error(`Limit Order failed: ${error.message}`);
  }
}
