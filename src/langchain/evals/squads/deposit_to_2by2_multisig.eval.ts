import { runEvals } from "../utils/runEvals";

const DEPOSIT_TO_2BY2_MS_DATASET = [
  {
    inputs: {
      query: "Deposit 1.5 SOL to our 2-of-2 squads multisig",
    },
    referenceOutputs: {
      tool: "deposit_to_2by2_multisig",
      response: JSON.stringify({
        amount: 1.5
      }),
    },
  },
  {
    inputs: {
      query: "Put 0.25 SOL into our squads multisig account for future proposals",
    },
    referenceOutputs: {
      tool: "deposit_to_2by2_multisig",
      response: JSON.stringify({
        amount: 0.25
      }),
    },
  },
];

runEvals(DEPOSIT_TO_2BY2_MS_DATASET, "deposit_to_2by2_multisig eval");