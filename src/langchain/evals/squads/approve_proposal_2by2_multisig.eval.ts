import { runEvals } from "../utils/runEvals";

const APPROVE_PROPOSAL_2BY2_MS_DATASET = [
  {
    inputs: {
      query: "Approve the squads proposal #5"
    },
    referenceOutputs: {
      tool: "approve_proposal_2by2_multisig",
      response: JSON.stringify({
        proposalIndex: 5
      }),
    },
  },
  {
    inputs: {
      query: "Approve the latest squads proposal"
    },
    referenceOutputs: {
      tool: "approve_proposal_2by2_multisig",
      response: JSON.stringify({}),
    },
  },
];

runEvals(APPROVE_PROPOSAL_2BY2_MS_DATASET, "approve_proposal_2by2_multisig eval");