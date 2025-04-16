import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaGetOrderHistoryTool extends Tool {
  name = "solana_get_order_history";
  description = `Get limit order history on Jupiter.`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(): Promise<string> {
    try {
      const result = await this.solanaKit.getJupiterLimitOrderHistory();
      return JSON.stringify({
        status: "success",
        message: "Order history retrieved successfully",
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
