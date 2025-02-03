import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { PublicKey } from "@solana/web3.js";

export class SolanaCreate2by2Multisig extends Tool {
  name = "create_2by2_multisig";
  description = `Create a 2-of-2 multisig account on Solana with the user and the agent, where both approvals will be required to run the transactions.
  
  Note: For one AI agent, only one 2-by-2 multisig can be created as it is pair-wise.

  Inputs (JSON string):
  - creator: string, the public key of the creator (required).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const creator = new PublicKey(inputFormat.creator);

      const multisig = await this.solanaKit.createSquadsMultisig(creator);

      return JSON.stringify({
        status: "success",
        message: "2-by-2 multisig account created successfully",
        multisig,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "CREATE_2BY2_MULTISIG_ERROR",
      });
    }
  }
}
