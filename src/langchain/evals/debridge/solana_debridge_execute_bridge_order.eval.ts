import { runEvals } from "../utils/runEvals";

const DEBRIDGE_EXECUTE_ORDER_DATASET = [
  {
    inputs: {
      query: "Execute a bridging transaction with transactionData=0xabcdef1234..."
    },
    referenceOutputs: {
      tool: "execute_bridge_order",
      response: JSON.stringify({
        transactionData: "0xabcdef1234..."
      }),
    },
  },
  {
    inputs: {
      query: "Finish bridging using transactionData=0x999999999888999777666"
    },
    referenceOutputs: {
      tool: "execute_bridge_order",
      response: JSON.stringify({
        transactionData: "0x999999999888999777666"
      }),
    },
  },
];

runEvals(DEBRIDGE_EXECUTE_ORDER_DATASET, "execute_bridge_order eval");