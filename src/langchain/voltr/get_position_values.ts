import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { PublicKey } from "@solana/web3.js";

export class SolanaVoltrGetPositionValues extends Tool {
  name = "solana_voltr_get_position_values";
  description = `Get the total asset value and current value for each strategy of a given Voltr vault
    
    Inputs:
    vault: string (required)
    `;
  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }
  async _call(input: string): Promise<string> {
    return this.solanaKit.voltrGetPositionValues(new PublicKey(input));
  }
}
