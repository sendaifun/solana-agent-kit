import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaTokenDataTool extends Tool {
  name = "solana_token_data";
  description = `Get information about a token using its mint address.
  
  Use this tool to find details about a specific token like its name, symbol, and supply.
  
  Input should be the token mint address as a quoted JSON string.
  
  Example: "So11111111111111111111111111111111111111112"
  Example: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  
  Do NOT pass a JSON object, just pass the address as a quoted string.`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = input.trim();

      const tokenData = await this.solanaKit.getTokenDataByAddress(parsedInput);

      return JSON.stringify({
        status: "success",
        tokenData,
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
