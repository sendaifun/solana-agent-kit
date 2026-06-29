import { VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import axios from "redaxios";
import { SolanaAgentKit } from "solana-agent-kit";
import { CROSSMINT_PRODUCTION_API_URL } from "../constants";
import {
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
  PhysicalAddress,
} from "../types";
import confirmOrder from "./confirm-order";

/**
 * Create an Amazon order via Crossmint API
 * @param agent SolanaAgentKit instance
 * @param productLocator Amazon product ID (ASIN) or url
 * @param userWalletAddress Solana wallet address of the payer
 * @param shippingAddress Shipping address object
 * @param userEmail User's email address
 * @returns Order ID, serialized transaction, and total price
 */
export default async function checkout(
  agent: SolanaAgentKit,
  productLocator: string,
  shippingAddress: PhysicalAddress,
  userEmail: string,
): Promise<{
  order: Order;
  message: string;
  signature: string;
  status?: string;
}> {
  const apiKey = agent.config.OTHER_API_KEYS?.CROSSMINT_API_KEY;

  if (!apiKey) {
    throw new Error("CROSSMINT_API_KEY is not set in agent config");
  }

  const orderData: CreateOrderRequest = {
    recipient: {
      email: userEmail,
      physicalAddress: {
        name: shippingAddress.name,
        line1: shippingAddress.line1,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || "US",
      },
    },
    payment: {
      method: "solana",
      currency: "usdc",
      payerAddress: agent.wallet.publicKey.toBase58(),
    },
    lineItems: [
      {
        productLocator: `amazon:${productLocator}`,
      },
    ],
  };

  try {
    const response = await axios.post(
      `${CROSSMINT_PRODUCTION_API_URL}/orders`,
      orderData,
      {
        headers: {
          "X-API-KEY": apiKey,
        },
      },
    );

    const order: CreateOrderResponse = response.data;

    if (!response.data) {
      throw new Error(order.message || "Failed to create order");
    }

    const orderResponse = {
      orderId: order.order.orderId,
      serializedTransaction:
        order.order.payment.preparation?.serializedTransaction || null,
      totalPrice: order.order.quote.totalPrice,
    };

    if (!orderResponse.serializedTransaction) {
      throw new Error("No serialized transaction found");
    }

    const tx = VersionedTransaction.deserialize(
      bs58.decode(orderResponse.serializedTransaction),
    );

    tx.message.recentBlockhash = (
      await agent.connection.getLatestBlockhash({
        commitment: "confirmed",
      })
    ).blockhash;

    const signedTx = await agent.wallet.signTransaction(tx);

    const signature = await agent.connection.sendTransaction(signedTx, {
      skipPreflight: true,
    });

    const orderConfirmation = await confirmOrder(
      agent,
      orderResponse.orderId,
      true,
    );

    if (!orderConfirmation.order) {
      return {
        order: order.order,
        message: "Failed to fetch order status",
        status: orderConfirmation.status,
        signature,
      };
    }

    return {
      order: orderConfirmation.order,
      message: "Order created successfully",
      status: orderConfirmation.status,
      signature,
    };
  } catch (error: any) {
    console.error("Error creating Crossmint Amazon order:", error);
    throw new Error(error.message || "Failed to create Crossmint Amazon order");
  }
}
