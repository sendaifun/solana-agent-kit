import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { CreateJupiterOrderRequest } from "../../types";

export class SolanaCreateLimitOrderTool extends Tool {
  name = "solana_create_limit_order";
  description = `Create a limit order on Jupiter.

  Inputs (input is a JSON string):
  - inputMint: string, the input token mint address (required)
  - outputMint: string, the output token mint address (required)
  - params: object, containing makingAmount, takingAmount, expiredAt (optional)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const params: CreateJupiterOrderRequest = JSON.parse(input);
      const result = await this.solanaKit.createJupiterLimitOrder(params);
      return JSON.stringify({
        status: "success",
        message: "Limit order created successfully",
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
