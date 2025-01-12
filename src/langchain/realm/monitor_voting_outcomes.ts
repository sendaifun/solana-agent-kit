import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { PublicKey } from "@solana/web3.js";

export class SolanaMonitorVotingOutcomesTool extends Tool {
    name = "solana_monitor_voting_outcomes";
    description = `Monitor the voting outcomes for a given proposal.
    
    Inputs (input is a JSON string):
    - proposalId: string, the address of the proposal (required)`;
  
    constructor(private solanaKit: SolanaAgentKit) {
      super();
    }
  
    protected async _call(input: string): Promise<string> {
      try {
        const { proposalId } = JSON.parse(input);
  
        const votingOutcomes = await this.solanaKit.monitorVotingOutcomes(
          new PublicKey(proposalId),
        );
  
        return JSON.stringify({
          status: "success",
          message: "Successfully monitored voting outcomes",
          votingOutcomes,
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