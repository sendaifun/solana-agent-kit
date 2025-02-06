import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class CheckBridgeStatusTool extends Tool {
  name = "check_bridge_status";
  description = `Checks the status of a bridge order using its transaction hash or order ID.
    Input should be a JSON string with:
    - txHashOrOrderId: Transaction hash or order ID to check
    
    Returns order status which can be one of:
    - "None": Initial state
    - "Created": Order has been created
    - "Fulfilled": Order has been fulfilled
    - "SentUnlock": Unlock transaction has been sent
    - "OrderCancelled": Order has been cancelled
    - "SentOrderCancel": Cancel transaction has been sent
    - "ClaimedUnlock": Unlock has been claimed
    - "ClaimedOrderCancel": Cancel has been claimed`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const { txHashOrOrderId } = JSON.parse(input);
      if (!txHashOrOrderId) {
        throw new Error("Missing txHashOrOrderId in input");
      }
      const result = await this.solanaKit.checkBridgeStatus(txHashOrOrderId);
      return JSON.stringify({
        status: "success",
        message: "Successfully retrieved bridge order status",
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
