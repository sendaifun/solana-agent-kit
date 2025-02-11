import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class CheckDebridgeStatusTool extends Tool {
  name = "check_bridge_status";
  description = `This tool checks the status of a bridge transaction.

  Inputs (input is a JSON string):
  txHashOrOrderId: string, eg "0x1234abcd..." or "3Dq8kH5oeN..." - Transaction hash (0x-prefixed for EVM) or Solana Signature to check (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const { txHashOrOrderId } = JSON.parse(input);
      if (!txHashOrOrderId) {
        throw new Error("Missing txHashOrOrderId in input");
      }
      const result =
        await this.solanaKit.checkDebridgeTransactionStatus(txHashOrOrderId);
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
