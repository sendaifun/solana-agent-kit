import { runEvals } from "../utils/runEvals";

const CREATE_2BY2_MS_DATASET = [
  {
    inputs: {
      query:
        "Create a 2-of-2 multisig with me at GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
    },
    referenceOutputs: {
      tool: "create_2by2_multisig",
      response: JSON.stringify({
        creator: "GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
      }),
    },
  },
];

runEvals(CREATE_2BY2_MS_DATASET, "create_2by2_multisig eval");
