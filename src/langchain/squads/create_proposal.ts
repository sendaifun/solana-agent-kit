import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaCreateProposal2by2Multisig extends Tool {
  name = "create_proposal_2by2_multisig";
  description = `Create a proposal to transfer funds from a 2-of-2 multisig account on Solana with the user and the agent, where both approvals will be required to run the transactions.
  
  If transactionIndex is not provided, the latest index will automatically be fetched and used.

  Inputs (JSON string):
  - transactionIndex: number, the index of the transaction (optional).`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const transactionIndex = inputFormat.transactionIndex ?? undefined;

      const tx = await this.solanaKit.createMultisigProposal(transactionIndex);

      return JSON.stringify({
        status: "success",
        message: "Proposal created successfully",
        transaction: tx,
        transactionIndex: transactionIndex?.toString(),
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "CREATE_PROPOSAL_2BY2_MULTISIG_ERROR",
      });
    }
  }
}
