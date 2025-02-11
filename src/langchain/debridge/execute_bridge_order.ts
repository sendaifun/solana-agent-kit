import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { executeDebridgeBridgeOrder } from "../../tools/debridge/executeBridgeOrder";

export class ExecuteDebridgeOrderTool extends Tool {
  name = "execute_bridge_order";
  description = `Execute a cross-chain bridge transaction on Solana.

  Inputs (input is a JSON string):
  - transactionData: string, hex-encoded transaction data from create_bridge_order (e.g., "0x23b872dd...")`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const signature = await executeDebridgeBridgeOrder(
        this.solanaKit,
        parsedInput.transactionData,
      );

      return JSON.stringify({
        status: "success",
        message: "Bridge transaction executed successfully",
        signature,
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
