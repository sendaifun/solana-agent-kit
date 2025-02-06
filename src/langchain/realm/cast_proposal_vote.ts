import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { PublicKey } from "@solana/web3.js";

export class SolanaCastGovernanceVoteTool extends Tool {
    name = "solana_governance_vote";
    description = `Cast a vote on a governance proposal.
     Inputs (input is a JSON string):
    - realmAccount: string, the address eg "7nxQB..." of the realm (required)
    - proposalAccount: string, the address eg "8x2dR..." of the proposal (required)
    - vote: string, the type of vote, either "yes" or "no" (required)`;
  
    constructor(private solanaKit: SolanaAgentKit) {
      super();
    }
  
    protected async _call(input: string): Promise<string> {
      try {
        const { realmAccount, proposalAccount, vote } = JSON.parse(input);
  
        if (!["yes", "no"].includes(vote.toLowerCase())) {
          throw new Error("Invalid voteType. Allowed values: 'yes', 'no'");
        }
        // Validate public keys
        if (
          !PublicKey.isOnCurve(realmAccount) ||
          !PublicKey.isOnCurve(proposalAccount)
        ) {
          throw new Error("Invalid realmAccount or proposalAccount");
        }
        const signature = await this.solanaKit.castProposalVote(
          new PublicKey(realmAccount),
          new PublicKey(proposalAccount),
          vote,
        );
  
        return JSON.stringify({
          status: "success",
          message: "Vote cast successfully",
          transaction: signature,
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