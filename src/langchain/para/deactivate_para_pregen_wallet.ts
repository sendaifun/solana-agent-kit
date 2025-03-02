import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaDeactivateParaPregenWalletTool extends Tool {
  name = "solana_deactivate_para_pregen_wallet";
  description = `Deactivate a pre-generated wallet for Para.`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(): Promise<string> {
    try { 
      const response = await this.solanaKit.deactivateParaPregenWallet();

      return JSON.stringify({
        status: "success",
        ...response
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message
      });
    }
  }
}
