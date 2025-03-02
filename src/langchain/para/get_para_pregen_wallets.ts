import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaGetParaPregenWalletsTool extends Tool {
  name = "solana_get_para_pregen_wallets";
  description = `Get all pre-generated wallets for Para based on their email.
  Inputs ( input is a JSON string ):
  email: string, eg "popo@gmail.com" (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const response = await this.solanaKit.getParaPregenWallets(inputFormat.email);

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
