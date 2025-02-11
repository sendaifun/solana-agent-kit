import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { AlloraPriceInferenceResponse } from "../../index";
import { PriceInferenceTimeframe } from "@alloralabs/allora-sdk";
import { PriceInferenceToken } from "@alloralabs/allora-sdk";

export class SolanaAlloraGetPriceInference extends Tool {
  name = "solana_allora_get_price_inference";
  description = `Get the price inference for a given token and timeframe from Allora's API
    Inputs (JSON string):
    - tokenSymbol: string, e.g., BTC for bitcoin
    - timeframe: string, e.g., 5m for 5 minutes`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const { tokenSymbol, timeframe } = parsedInput;

      const priceInference = await this.solanaKit.getPriceInference(
        tokenSymbol as PriceInferenceToken,
        timeframe as PriceInferenceTimeframe,
      );

      const response: AlloraPriceInferenceResponse = {
        status: "success",
        message: "Price inference fetched successfully",
        tokenSymbol,
        timeframe,
        priceInference,
      };

      return JSON.stringify(response);
    } catch (error: any) {
      const response: AlloraPriceInferenceResponse = {
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      };
      return JSON.stringify(response);
    }
  }
}
