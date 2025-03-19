import { runEvals } from "../utils/runEvals";

const TRANSFER_2BY2_MS_DATASET = [
  {
    inputs: {
      query: "Transfer 2 SOL to 9aUn5swQzUTRanaaTwmszxiv89cvFwUCjEBv1vZCoT1u from our 2by2 multisig"
    },
    referenceOutputs: {
      tool: "transfer_from_2by2_multisig",
      response: JSON.stringify({
        amount: 2,
        recipient: "9aUn5swQzUTRanaaTwmszxiv89cvFwUCjEBv1vZCoT1u"
      }),
    },
  },
  {
    inputs: {
      query: "Send 5.5 SOL to 8ZZbHJkZvn2Yb2puML26C96Rx7LQK8yZDAezAGV12sSe from the 2-of-2 multisig"
    },
    referenceOutputs: {
      tool: "transfer_from_2by2_multisig",
      response: JSON.stringify({
        amount: 5.5,
        recipient: "8ZZbHJkZvn2Yb2puML26C96Rx7LQK8yZDAezAGV12sSe"
      }),
    },
  },
];

runEvals(TRANSFER_2BY2_MS_DATASET, "transfer_from_2by2_multisig eval");