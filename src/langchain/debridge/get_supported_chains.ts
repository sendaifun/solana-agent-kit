import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class GetSupportedChainsTool extends Tool {
  name = "get_supported_chains";
  description = `Gets a list of chains supported by the deBridge DLN protocol.
    No input required. Returns a list of supported chains with their IDs and configurations.
    Example chains:
    - "1": Ethereum
    - "7565164": Solana
    - "56": BNB Chain
    - "137": Polygon`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(_input: string): Promise<string> {
    try {
      const result = await this.solanaKit.getBridgeSupportedChains();
      return JSON.stringify({
        status: "success",
        message: "Successfully retrieved supported chains",
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
