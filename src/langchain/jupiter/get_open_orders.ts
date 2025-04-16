import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaGetOpenOrdersTool extends Tool {
  name = "solana_get_open_orders";
  description = `Get open limit orders on Jupiter.`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(): Promise<string> {
    try {
      const result = await this.solanaKit.getOpenJupiterLimitOrders();
      return JSON.stringify({
        status: "success",
        message: "Open orders retrieved successfully",
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
