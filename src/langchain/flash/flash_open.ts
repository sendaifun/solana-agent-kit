import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { marketTokenMap } from "../../utils/flashUtils";

export class SolanaFlashOpenTrade extends Tool {
  name = "solana_flash_open_trade";
  description = `This tool can be used to open a new leveraged trading position on Flash.Trade exchange.

  Inputs ( input is a JSON string ):
  token: string, eg "SOL", "BTC", "ETH" (required)
  type: string, eg "long", "short" (required) 
  collateral: number, eg 10, 100, 1000 (required) 
  leverage: number, eg 5, 10, 20 (required)
  
  Example prompt is Open a 20x leveraged trade for SOL on long side using flash trade with 500 USD as collateral`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      // Validate input parameters
      if (!parsedInput.token) {
        throw new Error("Token is required, received: " + parsedInput.token);
      }
      if (!Object.keys(marketTokenMap).includes(parsedInput.token)) {
        throw new Error(
          "Token must be one of " +
            Object.keys(marketTokenMap).join(", ") +
            ", received: " +
            parsedInput.token +
            "\n" +
            "Please check https://beast.flash.trade/ for the list of supported tokens",
        );
      }
      if (!["long", "short"].includes(parsedInput.type)) {
        throw new Error(
          'Type must be either "long" or "short", received: ' +
            parsedInput.type,
        );
      }
      if (!parsedInput.collateral || parsedInput.collateral <= 0) {
        throw new Error(
          "Collateral amount must be positive, received: " +
            parsedInput.collateral,
        );
      }
      if (!parsedInput.leverage || parsedInput.leverage <= 0) {
        throw new Error(
          "Leverage must be positive, received: " + parsedInput.leverage,
        );
      }

      const tx = await this.solanaKit.flashOpenTrade({
        token: parsedInput.token,
        side: parsedInput.type,
        collateralUsd: parsedInput.collateral,
        leverage: parsedInput.leverage,
      });

      return JSON.stringify({
        status: "success",
        message: "Flash trade position opened successfully",
        transaction: tx,
        token: parsedInput.token,
        side: parsedInput.type,
        collateral: parsedInput.collateral,
        leverage: parsedInput.leverage,
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
