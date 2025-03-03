import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaUpdateParaPregenWalletTool extends Tool {
  name = "solana_update_para_pregen_wallet";
  description = `Update a pre-generated wallet for Para.
  Inputs ( input is a JSON string ):
  walletId: string, eg "1234567890" (required)
  email: string, eg "popo@gmail.com" (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const response = await this.solanaKit.updateParaPregenWallet(
        inputFormat.walletId,
        inputFormat.email,
      );

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
