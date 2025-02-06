import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class BridgeTool extends Tool {
  name = "bridge";
  description = `Executes a bridge order by sending its transaction.
    Input should be a JSON string with:
    - orderData: Hex-encoded transaction data from createBridgeOrder
    
    Returns the transaction signature after execution.`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const { orderData } = JSON.parse(input);
      if (!orderData) {
        throw new Error("Missing orderData in input");
      }
      const result = await this.solanaKit.bridge(orderData);
      return JSON.stringify({
        status: "success",
        message: "Successfully executed bridge order",
        data: result,
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
