import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaSwitchParaToMainWalletTool extends Tool {
  name = "solana_switch_para_to_main_wallet";
  description = `Switch a pre-generated wallet for Para to the main wallet.`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(): Promise<string> {
    try {
      const response = await this.solanaKit.switchParaToMainWallet();

      return JSON.stringify({
        status: "success",
        ...response,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
      });
    }
  }
}
