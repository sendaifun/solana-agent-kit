import { runEvals } from "../utils/runEvals";

const BALANCE_TOOL_CALL_DATASET = [
  {
    inputs: {
      query:
        "How much SOL does GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB have?",
    },
    referenceOutputs: {
      tool: "solana_balance_other",
      response:
        '{"walletAddress":"GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB"}',
    },
  },
  {
    inputs: {
      query:
        "How much USDC does GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB have?",
    },
    referenceOutputs: {
      tool: "solana_balance_other",
      response:
        '{"walletAddress":"GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB","tokenAddress":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"}',
    },
  },
];

runEvals(BALANCE_TOOL_CALL_DATASET, "Other accounts balance tests");
