import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaClaimParaPregenWalletTool extends Tool {
  name = "solana_claim_para_pregen_wallet";
  description = `Claim a pre-generated wallet for Para.
  Inputs ( input is a JSON string ):
  userShare: string, eg "wadawdawdajbjvbs" (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const response = await this.solanaKit.claimParaPregenWallet(inputFormat.userShare);

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
