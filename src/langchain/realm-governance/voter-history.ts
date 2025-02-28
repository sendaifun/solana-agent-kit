import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";

export class SolanaGetVoterHistoryTool extends Tool {
    name = "get_voter_history";
    description = "Get voting history for a specific voter";
  
    override schema = z
      .object({
        input: z.string().optional(),
      })
      .transform((args) => args.input);
  
    constructor(private agent: SolanaAgentKit) {
      super();
    }
  
    protected async _call(input: string): Promise<string> {
      try {
        const args = JSON.parse(input || "{}") as {
          voter: string;
        };
  
        const result = await this.agent.getVoterHistory(
          new PublicKey(args.voter),
        );
        return JSON.stringify(result);
      } catch (error) {
        throw new Error(`Failed to get voter history: ${error}`);
      }
    }
  }