import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { PublicKey } from "@solana/web3.js";

export class SolanaTrackVotingPowerTool extends Tool {
    name = "solana_track_voting_power";
    description = `Track the voting power of a user in a realm.
    
    Inputs (input is a JSON string):
    - realmId: string, the address of the realm (required)
    - tokenOwnerRecordPk: string, the PublicKey of the Token Owner Record (required)`;
  
    constructor(private solanaKit: SolanaAgentKit) {
      super();
    }
  
    protected async _call(input: string): Promise<string> {
      try {
        const { tokenOwnerRecordPk } = JSON.parse(input);
  
        const votingPower = await this.solanaKit.trackVotingPower(
          new PublicKey(tokenOwnerRecordPk),
        );
  
        return JSON.stringify({
          status: "success",
          message: "Successfully tracked voting power",
          votingPower,
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