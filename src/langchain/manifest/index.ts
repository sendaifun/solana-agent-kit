import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { generateOrdersfromPattern } from "../../tools";
import { OrderParams } from "../../types";

export class SolanaLimitOrderTool extends Tool {
  name = "solana_limit_order";
  description = `This tool can be used to place limit orders using Manifest.

  Do not allow users to place multiple orders with this instruction, use solana_batch_order instead.

  Inputs ( input is a JSON string ):
  marketId: PublicKey, eg "ENhU8LsaR7vDD2G1CsWcsuSGNrih9Cv5WZEk7q9kPapQ" for SOL/USDC (required)
  quantity: number, eg 1 or 0.01 (required)
  side: string, eg "Buy" or "Sell" (required)
  price: number, in tokens eg 200 for SOL/USDC (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const tx = await this.solanaKit.limitOrder(
        new PublicKey(parsedInput.marketId),
        parsedInput.quantity,
        parsedInput.side,
        parsedInput.price,
      );

      return JSON.stringify({
        status: "success",
        message: "Trade executed successfully",
        transaction: tx,
        marketId: parsedInput.marketId,
        quantity: parsedInput.quantity,
        side: parsedInput.side,
        price: parsedInput.price,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaBatchOrderTool extends Tool {
  name = "solana_batch_order";
  description = `Places multiple limit orders in one transaction using Manifest. Submit orders either as a list or pattern:
  
    1. List format:
    {
      "marketId": "ENhU8LsaR7vDD2G1CsWcsuSGNrih9Cv5WZEk7q9kPapQ",
      "orders": [
        { "quantity": 1, "side": "Buy", "price": 200 },
        { "quantity": 0.5, "side": "Sell", "price": 205 }
      ]
    }
  
    2. Pattern format:
    {
      "marketId": "ENhU8LsaR7vDD2G1CsWcsuSGNrih9Cv5WZEk7q9kPapQ",
      "pattern": {
        "side": "Buy",
        "totalQuantity": 100,
        "priceRange": { "max": 1.0 },
        "spacing": { "type": "percentage", "value": 1 },
        "numberOfOrders": 5
      }
    }
  
    Examples:
    - "Place 5 buy orders totaling 100 tokens, 1% apart below $1"
    - "Create 3 sell orders of 10 tokens each between $50-$55"
    - "Place buy orders worth 50 tokens, $0.10 spacing from $0.80"
  
    Important: All orders must be in one transaction. Combine buy and sell orders into a single pattern or list. Never break the orders down to individual buy or sell orders.`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      let ordersToPlace: OrderParams[] = [];

      if (!parsedInput.marketId) {
        throw new Error("Market ID is required");
      }

      if (parsedInput.pattern) {
        ordersToPlace = generateOrdersfromPattern(parsedInput.pattern);
      } else if (Array.isArray(parsedInput.orders)) {
        ordersToPlace = parsedInput.orders;
      } else {
        throw new Error("Either pattern or orders array is required");
      }

      if (ordersToPlace.length === 0) {
        throw new Error("No orders generated or provided");
      }

      ordersToPlace.forEach((order: OrderParams, index: number) => {
        if (!order.quantity || !order.side || !order.price) {
          throw new Error(
            `Invalid order at index ${index}: quantity, side, and price are required`,
          );
        }
        if (order.side !== "Buy" && order.side !== "Sell") {
          throw new Error(
            `Invalid side at index ${index}: must be "Buy" or "Sell"`,
          );
        }
      });

      const tx = await this.solanaKit.batchOrder(
        new PublicKey(parsedInput.marketId),
        parsedInput.orders,
      );

      return JSON.stringify({
        status: "success",
        message: "Batch order executed successfully",
        transaction: tx,
        marketId: parsedInput.marketId,
        orders: parsedInput.orders,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaCancelAllOrdersTool extends Tool {
  name = "solana_cancel_all_orders";
  description = `This tool can be used to cancel all orders from a Manifest market.

  Input ( input is a JSON string ):
  marketId: string, eg "ENhU8LsaR7vDD2G1CsWcsuSGNrih9Cv5WZEk7q9kPapQ" for SOL/USDC (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const marketId = new PublicKey(input.trim());
      const tx = await this.solanaKit.cancelAllOrders(marketId);

      return JSON.stringify({
        status: "success",
        message: "Cancel orders successfully",
        transaction: tx,
        marketId,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaWithdrawAllTool extends Tool {
  name = "solana_withdraw_all";
  description = `This tool can be used to withdraw all funds from a Manifest market.

  Input ( input is a JSON string ):
  marketId: string, eg "ENhU8LsaR7vDD2G1CsWcsuSGNrih9Cv5WZEk7q9kPapQ" for SOL/USDC (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const marketId = new PublicKey(input.trim());
      const tx = await this.solanaKit.withdrawAll(marketId);

      return JSON.stringify({
        status: "success",
        message: "Withdrew successfully",
        transaction: tx,
        marketId,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaManifestCreateMarket extends Tool {
  name = "solana_manifest_create_market";
  description = `Manifest market

  Inputs (input is a json string):
  baseMint: string (required)
  quoteMint: string (required)
  `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);

      const tx = await this.solanaKit.manifestCreateMarket(
        new PublicKey(inputFormat.baseMint),
        new PublicKey(inputFormat.quoteMint),
      );

      return JSON.stringify({
        status: "success",
        message: "Create manifest market successfully",
        transaction: tx[0],
        marketId: tx[1],
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
