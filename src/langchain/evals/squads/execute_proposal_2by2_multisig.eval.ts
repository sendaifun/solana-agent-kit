import { runEvals } from "../utils/runEvals";

const EXECUTE_PROPOSAL_2BY2_MS_DATASET = [
  {
    inputs: {
      query: "Execute squads proposal #7 now that it's approved"
    },
    referenceOutputs: {
      tool: "execute_proposal_2by2_multisig",
      response: JSON.stringify({
        proposalIndex: 7
      }),
    },
  },
  {
    inputs: {
      query: "Execute the latest squads proposal"
    },
    referenceOutputs: {
      tool: "execute_proposal_2by2_multisig",
      response: JSON.stringify({}),
    },
  },
];

runEvals(EXECUTE_PROPOSAL_2BY2_MS_DATASET, "execute_proposal_2by2_multisig eval");