import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaFlashCloseTrade extends Tool {
  name = "solana_flash_close_trade";
  description = `Close an existing leveraged trading position on Flash.Trade exchange.

  Inputs ( input is a JSON string ):
  token: string, eg "SOL", "BTC", "ETH" (required)
  side: string, eg "long", "short" (required)
  
  Example prompt is Close a 20x leveraged trade for SOL on long side`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      // Validate input parameters
      if (!parsedInput.token) {
        throw new Error("Token is required");
      }
      if (!["SOL", "BTC", "ETH"].includes(parsedInput.token)) {
        throw new Error('Token must be one of ["SOL", "BTC", "ETH"]');
      }
      if (!["long", "short"].includes(parsedInput.side)) {
        throw new Error('Side must be either "long" or "short"');
      }

      const tx = await this.solanaKit.flashCloseTrade({
        token: parsedInput.token,
        side: parsedInput.side,
      });

      return JSON.stringify({
        status: "success",
        message: "Flash trade position closed successfully",
        transaction: tx,
        token: parsedInput.token,
        side: parsedInput.side,
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
