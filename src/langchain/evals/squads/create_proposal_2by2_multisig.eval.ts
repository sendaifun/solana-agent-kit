import { runEvals } from "../utils/runEvals";

const CREATE_PROPOSAL_2BY2_MS_DATASET = [
  {
    inputs: {
      query: "Create a new squads proposal with transaction index 7",
    },
    referenceOutputs: {
      tool: "create_proposal_2by2_multisig",
      response: JSON.stringify({
        transactionIndex: 7
      }),
    },
  },
  {
    inputs: {
      query: "Open a squads proposal without specifying an index",
    },
    referenceOutputs: {
      tool: "create_proposal_2by2_multisig",
      response: JSON.stringify({}),
    },
  },
];

runEvals(CREATE_PROPOSAL_2BY2_MS_DATASET, "create_proposal_2by2_multisig eval");