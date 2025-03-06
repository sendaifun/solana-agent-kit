import {
  ManifestClient,
  OrderType,
  WrapperPlaceOrderParamsExternal,
} from "@cks-systems/manifest-sdk";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { signOrSendTX, type SolanaAgentKit } from "solana-agent-kit";
import type { BatchOrderPattern, OrderParams } from "../types";

export async function manifestCreateMarket(
  agent: SolanaAgentKit,
  baseMint: PublicKey,
  quoteMint: PublicKey,
) {
  const marketKeypair: Keypair = Keypair.generate();
  const FIXED_MANIFEST_HEADER_SIZE: number = 256;
  const createAccountIx: TransactionInstruction = SystemProgram.createAccount({
    fromPubkey: agent.wallet.publicKey,
    newAccountPubkey: marketKeypair.publicKey,
    space: FIXED_MANIFEST_HEADER_SIZE,
    lamports: await agent.connection.getMinimumBalanceForRentExemption(
      FIXED_MANIFEST_HEADER_SIZE,
    ),
    programId: new PublicKey("MNFSTqtC93rEfYHB6hF82sKdZpUDFWkViLByLd1k1Ms"),
  });
  const createMarketIx = ManifestClient["createMarketIx"](
    agent.wallet.publicKey,
    baseMint,
    quoteMint,
    marketKeypair.publicKey,
  );

  const tx: Transaction = new Transaction();
  const { blockhash } = await agent.connection.getLatestBlockhash();
  tx.add(createAccountIx);
  tx.add(createMarketIx);
  tx.recentBlockhash = blockhash;

  return [await signOrSendTX(agent, tx), marketKeypair.publicKey.toBase58()];
}

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
) {
  try {
    const mfxClient = await ManifestClient.getClientForMarketNoPrivateKey(
      agent.connection,
      marketId,
      agent.wallet.publicKey,
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
      await mfxClient.placeOrderWithRequiredDepositIxs(
        agent.wallet.publicKey,
        orderParams,
      );
    const txn = new Transaction().add(...depositPlaceOrderIx);
    const { blockhash } = await agent.connection.getLatestBlockhash();
    txn.recentBlockhash = blockhash;

    return await signOrSendTX(agent, txn);
  } catch (error: any) {
    throw new Error(`Limit Order failed: ${error.message}`);
  }
}

/**
 * Cancels all orders from Manifest
 * @param agent SolanaAgentKit instance
 * @param marketId Public key for the manifest market
 * @returns Transaction signature
 */
export async function cancelAllOrders(
  agent: SolanaAgentKit,
  marketId: PublicKey,
) {
  try {
    const mfxClient = await ManifestClient.getClientForMarketNoPrivateKey(
      agent.connection,
      marketId,
      agent.wallet.publicKey,
    );

    const cancelAllOrdersIx = mfxClient.cancelAllIx();
    const txn = new Transaction().add(cancelAllOrdersIx);
    const { blockhash } = await agent.connection.getLatestBlockhash();
    txn.recentBlockhash = blockhash;

    return await signOrSendTX(agent, txn);
  } catch (error: any) {
    throw new Error(`Cancel all orders failed: ${error.message}`);
  }
}

/**
 * Withdraws all funds from Manifest
 * @param agent SolanaAgentKit instance
 * @param marketId Public key for the manifest market
 * @returns Transaction signature
 */
export async function withdrawAll(agent: SolanaAgentKit, marketId: PublicKey) {
  try {
    const mfxClient = await ManifestClient.getClientForMarketNoPrivateKey(
      agent.connection,
      marketId,
      agent.wallet.publicKey,
    );

    const withdrawAllIx = mfxClient.withdrawAllIx();
    const txn = new Transaction().add(...withdrawAllIx);
    const { blockhash } = await agent.connection.getLatestBlockhash();
    txn.recentBlockhash = blockhash;

    return await signOrSendTX(agent, txn);
  } catch (error: any) {
    throw new Error(`Withdraw all failed: ${error.message}`);
  }
}

/**
 * Generates an array of orders based on the specified pattern
 */
export function generateOrdersfromPattern(
  pattern: BatchOrderPattern,
): OrderParams[] {
  const orders: OrderParams[] = [];

  // Random number of orders if not specified, max of 8
  const numOrders = pattern.numberOfOrders || Math.ceil(Math.random() * 8);

  // Calculate price points
  const prices: number[] = [];
  if (pattern.priceRange) {
    const { min, max } = pattern.priceRange;
    if (min && max) {
      // Generate evenly spaced prices
      for (let i = 0; i < numOrders; i++) {
        if (pattern.spacing?.type === "percentage") {
          const factor = 1 + pattern.spacing.value / 100;
          prices.push(min * Math.pow(factor, i));
        } else {
          const step = (max - min) / (numOrders - 1);
          prices.push(min + step * i);
        }
      }
    } else if (min) {
      // Generate prices starting from min with specified spacing
      for (let i = 0; i < numOrders; i++) {
        if (pattern.spacing?.type === "percentage") {
          const factor = 1 + pattern.spacing.value / 100;
          prices.push(min * Math.pow(factor, i));
        } else {
          prices.push(min + (pattern.spacing?.value || 0.01) * i);
        }
      }
    }
  }

  // Calculate quantities
  let quantities: number[] = [];
  if (pattern.totalQuantity) {
    const individualQty = pattern.totalQuantity / numOrders;
    quantities = Array(numOrders).fill(individualQty);
  } else if (pattern.individualQuantity) {
    quantities = Array(numOrders).fill(pattern.individualQuantity);
  }

  // Generate orders
  for (let i = 0; i < numOrders; i++) {
    orders.push({
      side: pattern.side,
      price: prices[i],
      quantity: quantities[i],
    });
  }

  return orders;
}

/**
 * Validates that sell orders are not priced below buy orders
 * @param orders Array of order parameters to validate
 * @throws Error if orders are crossed
 */
function validateNoCrossedOrders(orders: OrderParams[]): void {
  // Find lowest sell and highest buy prices
  let lowestSell = Number.MAX_SAFE_INTEGER;
  let highestBuy = 0;

  orders.forEach((order) => {
    if (order.side === "Sell" && order.price < lowestSell) {
      lowestSell = order.price;
    }
    if (order.side === "Buy" && order.price > highestBuy) {
      highestBuy = order.price;
    }
  });

  // Check if orders cross
  if (lowestSell <= highestBuy) {
    throw new Error(
      `Invalid order prices: Sell order at ${lowestSell} is lower than or equal to Buy order at ${highestBuy}. Orders cannot cross.`,
    );
  }
}

/**
 * Place batch orders using Manifest
 * @param agent SolanaAgentKit instance
 * @param marketId Public key for the manifest market
 * @param quantity Amount to trade in tokens
 * @param side Buy or Sell
 * @param price Price in tokens ie. SOL/USDC
 * @returns Transaction signature
 */
export async function batchOrder(
  agent: SolanaAgentKit,
  marketId: PublicKey,
  orders: OrderParams[],
) {
  try {
    validateNoCrossedOrders(orders);

    const mfxClient = await ManifestClient.getClientForMarketNoPrivateKey(
      agent.connection,
      marketId,
      agent.wallet.publicKey,
    );

    const placeParams: WrapperPlaceOrderParamsExternal[] = orders.map(
      (order) => ({
        numBaseTokens: order.quantity,
        tokenPrice: order.price,
        isBid: order.side === "Buy",
        lastValidSlot: 0,
        orderType: OrderType.Limit,
        clientOrderId: Number(Math.random() * 10000),
      }),
    );

    const batchOrderIx: TransactionInstruction = mfxClient.batchUpdateIx(
      placeParams,
      [],
      true,
    );
    const txn = new Transaction().add(batchOrderIx);
    const { blockhash } = await agent.connection.getLatestBlockhash();
    txn.recentBlockhash = blockhash;

    return await signOrSendTX(agent, txn);
  } catch (error: any) {
    throw new Error(`Batch Order failed: ${error.message}`);
  }
}
