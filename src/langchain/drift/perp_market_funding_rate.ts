import { Tool } from "langchain/tools";
import type { SolanaAgentKit } from "../../agent";

export class SolanaDriftPerpMarketFundingRateTool extends Tool {
  name = "drift_perp_market_funding_rate";
  description = `Get the funding rate for a perpetual market on Drift protocol.
  
  Inputs (JSON string):
  - symbol: string, market symbol (required)
	- period: year or hour (default: hour)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const fundingRate = await this.solanaKit.getPerpMarketFundingRate(
        parsedInput.symbol,
        parsedInput.period,
      );

      return JSON.stringify({
        status: "success",
        message: `Funding rate retrieved for ${parsedInput.symbol}`,
        data: fundingRate,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
      });
    }
  }
}
