import { runEvals } from "../utils/runEvals";

const SINGLE_TOOL_CALL_DATASET = [
  {
    inputs: {
      query:
        "Can you transfer 0.0001 sol to GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB?",
    },
    referenceOutputs: {
      tool: "solana_transfer",
      response:
        '{"to":"GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB","amount":0.0001}',
    },
  },
  {
    inputs: {
      query:
        "Can you transfer like two sol to GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB for testing?",
    },
    referenceOutputs: {
      tool: "solana_transfer",
      response:
        '{"to":"GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB","amount":2}',
    },
  },
  {
    inputs: {
      query: "Send 250 SOL to GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
    },
    referenceOutputs: {
      tool: "solana_transfer",
      response:
        '{"to":"GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB","amount":250}',
    },
  },
  {
    inputs: {
      query: "Send 250 USDC to GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
    },
    referenceOutputs: {
      tool: "solana_transfer",
      response:
        '{"to":"GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB","amount":250, "mint":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"}',
    },
  },
];

runEvals(SINGLE_TOOL_CALL_DATASET, "Transfer SOL and tokens");
