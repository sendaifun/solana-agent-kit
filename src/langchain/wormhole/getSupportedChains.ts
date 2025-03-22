import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class GetWormholeSupportedChainsTool extends Tool {
  name = "get_supported_chains";
  description = "Get a list of supported chains by Wormhole Protocol";

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(_input: string): Promise<string> {
    const supportedChains = await this.solanaKit.getWormholeSupportedChains();
    return JSON.stringify(supportedChains);
  }
}
