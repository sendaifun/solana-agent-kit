import { Tool } from "langchain/tools";
import type { SolanaAgentKit } from "../../agent";

export class SolanaDriftEntryQuoteOfPerpTradeTool extends Tool {
  name = "drift_entry_quote_of_perp_trade";
  description = `Get an entry quote for a perpetual trade on Drift protocol.
  
  Inputs (JSON string):
  - amount: number, amount to trade (required)
  - symbol: string, market symbol (required)
  - action: "long" | "short", trade direction (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const quote = await this.solanaKit.getEntryQuoteOfPerpTrade(
        parsedInput.amount,
        parsedInput.symbol,
        parsedInput.action,
      );

      return JSON.stringify({
        status: "success",
        message: `Entry quote retrieved for ${parsedInput.action} ${parsedInput.amount} ${parsedInput.symbol}`,
        data: quote,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "ENTRY_QUOTE_OF_PERP_TRADE_ERROR",
      });
    }
  }
}
