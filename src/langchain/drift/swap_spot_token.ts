import { Tool } from "langchain/tools";
import type { SolanaAgentKit } from "../../agent";

export class SolanaDriftSpotTokenSwapTool extends Tool {
  name = "drift_spot_token_swap";
  description = `Swap spot tokens on Drift protocol.
  
  Inputs (JSON string):
  - fromSymbol: string, symbol of token to swap from (required)
  - toSymbol: string, symbol of token to swap to (required)
  - fromAmount: number, amount to swap from (optional) required if toAmount is not provided
  - toAmount: number, amount to swap to (optional) required if fromAmount is not provided
  - slippage: number, slippage tolerance in percentage (optional)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const tx = await this.solanaKit.driftSpotTokenSwap(parsedInput);

      return JSON.stringify({
        status: "success",
        message: `Swapped ${parsedInput.fromAmount} ${parsedInput.fromSymbol} for ${parsedInput.toSymbol}`,
        signature: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "DRIFT_SPOT_TOKEN_SWAP_ERROR",
      });
    }
  }
}
