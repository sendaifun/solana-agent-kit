import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaCreateParaPregenWalletTool extends Tool {
  name = "solana_create_para_pregen_wallet";
  description = `Create a pre-generated wallet for Para.
  Inputs ( input is a JSON string ):
  email: string, eg "popo@gmail.com" (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const response = await this.solanaKit.createParaPregenWallet(
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
