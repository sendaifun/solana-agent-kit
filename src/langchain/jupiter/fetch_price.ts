import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

/**
 * Tool to fetch the price of a token in USDC
 */
export class SolanaFetchPriceTool extends Tool {
  name = "solana_fetch_price";
  description = `Fetch the price of a given token in USDC.

  Use this tool to check current token prices or value of tokens.
  
  Input should be the token mint address as a quoted JSON string.
  
  Example: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"
  
  Do NOT pass a JSON object, just pass the address as a quoted string.`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const price = await this.solanaKit.fetchTokenPrice(input.trim());
      return JSON.stringify({
        status: "success",
        tokenId: input.trim(),
        priceInUSDC: price,
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
