import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaTradeDriftPerpAccountTool extends Tool {
  name = "trade_drift_perp_account";
  description = `Trade a perpetual account on Drift protocol.
  
  Inputs (JSON string):
  - amount: number, amount to trade (required)
  - symbol: string, token symbol (required)
  - action: "long" | "short", trade direction (required)
  - type: "market" | "limit", order type (required)
  - price: number, required for limit orders`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const signature = await this.solanaKit.tradeUsingDriftPerpAccount(
        parsedInput.amount,
        parsedInput.symbol,
        parsedInput.action,
        parsedInput.type,
        parsedInput.price,
      );

      return JSON.stringify({
        status: "success",
        signature,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "TRADE_PERP_ACCOUNT_ERROR",
      });
    }
  }
}
