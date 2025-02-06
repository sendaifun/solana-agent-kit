import { PublicKey } from "@solana/web3.js";
import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { monitorVotingOutcomes } from "../../tools/realm/monitor_voting_outcomes";

const monitorVotingOutcomesAction: Action = {
  name: "MONITOR_VOTING_OUTCOMES",
  similes: [
    "check voting results",
    "view proposal outcomes",
    "get vote results",
    "show proposal status",
  ],
  description: `Monitor and retrieve the voting outcomes of a proposal within a governance realm.`,
  examples: [
    [
      {
        input: {
          realm: "ASNJL4uXNNiNuC7XibsKw5VfB3Ce9wNsXwqGsxqrNbF4",
        },
        output: {
          status: "success",
          proposalState: "Completed",
          voteResults: {
            yes: 1200,
            no: 300,
            abstain: 100,
          },
        },
        explanation: "Get the voting results of a proposal after voting ends",
      },
    ],
  ],
  schema: z.object({
    realm: z.string(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    console.log("Monitoring voting outcomes for realm:", input.realm);
    const outcome = await monitorVotingOutcomes(
      agent,
      new PublicKey(input.realm),
    );

    return {
      status: "success",
      proposalState: outcome.account.state.toString(),
      voteResults: {
        yes: outcome.account.yesVotesCount,
        no: outcome.account.noVotesCount,
        abstain: outcome.account.abstainVoteWeight,
      },
    };
  },
};

export default monitorVotingOutcomesAction;
