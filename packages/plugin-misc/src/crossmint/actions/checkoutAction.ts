import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import checkout from "../tools/checkout";
import type { PhysicalAddress } from "../types";

const checkoutAction: Action = {
  name: "CROSSMINT_CHECKOUT",
  similes: [
    "crossmint checkout",
    "buy amazon product",
    "buy shopify product",
    "purchase with crossmint",
    "checkout amazon",
    "order with solana",
  ],
  description: `Create an Amazon or Shopify order via Crossmint API using Solana USDC. Requires product locator (ASIN or URL), shipping address, and user email. Returns order details and transaction signature.`,
  examples: [
    [
      {
        input: {
          productLocator: "B08N5WRWNW",
          shippingAddress: {
            name: "John Doe",
            line1: "123 Main St",
            city: "New York",
            state: "NY",
            postalCode: "10001",
            country: "US",
          },
          userEmail: "john@example.com",
        },
        output: {
          status: "success",
          order: { orderId: "order_123" /* ... */ },
          message: "Order created successfully",
          signature:
            "5UfgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
        },
        explanation:
          "Create an Amazon order for product B08N5WRWNW shipped to John Doe.",
      },
    ],
  ],
  schema: z.object({
    productLocator: z.string().describe("Amazon product ID (ASIN) or URL"),
    shippingAddress: z
      .object({
        name: z.string(),
        line1: z.string(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string().default("US"),
      })
      .describe("Shipping address object"),
    userEmail: z.string().email().describe("User's email address"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const { productLocator, shippingAddress, userEmail } = input;
    try {
      const result = await checkout(
        agent,
        productLocator,
        shippingAddress as PhysicalAddress,
        userEmail,
      );
      return { status: "success", ...result };
    } catch (error: any) {
      return { status: "error", message: error.message };
    }
  },
};

export default checkoutAction;
