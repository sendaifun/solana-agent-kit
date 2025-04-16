import { runEvals } from "../utils/runEvals";

const REJECT_PROPOSAL_2BY2_MS_DATASET = [
  {
    inputs: {
      query: "Reject the squads proposal #10"
    },
    referenceOutputs: {
      tool: "reject_proposal_2by2_multisig",
      response: JSON.stringify({
        proposalIndex: 10
      }),
    },
  },
  {
    inputs: {
      query: "Reject the latest squads proposal"
    },
    referenceOutputs: {
      tool: "reject_proposal_2by2_multisig",
      response: JSON.stringify({}),
    },
  },
];

runEvals(REJECT_PROPOSAL_2BY2_MS_DATASET, "reject_proposal_2by2_multisig eval");