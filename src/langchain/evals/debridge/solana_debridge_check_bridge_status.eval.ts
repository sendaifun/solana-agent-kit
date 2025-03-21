import { runEvals } from "../utils/runEvals";

const DEBRIDGE_CHECK_STATUS_DATASET = [
  {
    inputs: {
      query: "Check the status of my cross chain transaction 0x1234567890ABCDEF"
    },
    referenceOutputs: {
      tool: "check_bridge_status",
      response: JSON.stringify({
        txHashOrOrderId: "0x1234567890ABCDEF"
      }),
    },
  },
  {
    inputs: {
      query: "Check the status of solana signature 4rgN7S9Ev8SBRyZCgcMpe1hwsfztCDUh6QWHRJdJmTgoz3gUrZ4eSgkpzLVma2gk2EcQ2fK1Bx46UNsGPZNV9xAD"
    },
    referenceOutputs: {
      tool: "check_bridge_status",
      response: JSON.stringify({
        txHashOrOrderId: "4rgN7S9Ev8SBRyZCgcMpe1hwsfztCDUh6QWHRJdJmTgoz3gUrZ4eSgkpzLVma2gk2EcQ2fK1Bx46UNsGPZNV9xAD"
      }),
    },
  },
];

runEvals(DEBRIDGE_CHECK_STATUS_DATASET, "check_bridge_status eval");