import { Tool } from "langchain/tools";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { VoteConfig } from "../../types";

export class SolanaCastVoteTool extends Tool {
  name = "cast_vote";
  description = "Cast a vote on a proposal";

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
      const args = JSON.parse(input || "{}") as VoteConfig;
      const result = await this.agent.castVote(args);
      return `Successfully cast vote on proposal: ${result.toString()}`;
    } catch (error) {
      throw new Error(`Failed to cast vote: ${error}`);
    }
  }
}