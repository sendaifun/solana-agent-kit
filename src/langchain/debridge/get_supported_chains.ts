import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class GetDebridgeSupportedChainsTool extends Tool {
  name = "get_supported_chains";
  description = `This tool gets a list of chains supported by the deBridge DLN protocol.

  Inputs: No input required`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(_input: string): Promise<string> {
    try {
      const result = await this.solanaKit.getDebridgeSupportedChains();
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
