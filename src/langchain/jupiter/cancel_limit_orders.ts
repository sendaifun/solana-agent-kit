import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { CancelJupiterOrderRequest } from "../../types";

export class SolanaCancelLimitOrdersTool extends Tool {
  name = "solana_cancel_limit_orders";
  description = `Cancel limit orders on Jupiter.

  Inputs (input is a JSON string):
  - orders: string[], array of order IDs to cancel`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const params: CancelJupiterOrderRequest = JSON.parse(input);
      const result = await this.solanaKit.cancelJupiterLimitOrders(params);
      return JSON.stringify({
        status: "success",
        message: "Limit orders canceled successfully",
        result,
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
