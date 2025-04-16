import { runComplexEval, ComplexEvalDataset } from "../utils/runEvals";

const DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn SOL transfer",
    inputs: {
      query: "I want to send some SOL",
    },
    turns: [
      {
        input: "I want to send some SOL",
        expectedResponse:
          "Sure, how much SOL and what is the recipient address?",
      },
      {
        input: "Please transfer 0.05 SOL",
        expectedResponse: "Alright, to which address?",
      },
      {
        input: "Send it to wallet GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
        expectedToolCall: {
          tool: "solana_transfer",
          params: {
            to: "GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
            amount: 0.05,
          },
        },
      },
    ],
  },
  {
    description: "Multi-turn SOL transfer",
    inputs: {
      query: "Send large SOL amount",
    },
    turns: [
      {
        input: "I want to send 1000 SOL",
        expectedResponse: "Sure, what is the recipient address?",
      },
      {
        input: "Send it to wallet GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
        expectedToolCall: {
          tool: "solana_transfer",
          params: {
            to: "GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
            amount: 1000,
          },
        },
      },
    ],
  },
  {
    description: "Multi-turn SOL transfer",
    inputs: {
      query: "Send more SOL than in balance",
    },
    turns: [
      {
        input: "Check my balance of SOL",
        expectedToolCall: {
          tool: "solana_balance",
          params: {},
        },
      },
      {
        input:
          "Send twice my balance to GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
        expectedToolCall: {
          tool: "", // should be no tool call since you can't transfer 2x balance
          params: {},
        },
      },
    ],
  },
  {
    description: "Multi-turn SOL transfer",
    inputs: {
      query: "Send more SOL than in balance",
    },
    turns: [
      {
        input:
          "Check my friends SOL balance, his address is: zZNEUiAq2kLgWFJiZofHfcar91ph7yE2nUfLmXswkvP",
        expectedToolCall: {
          tool: "solana_balance_other",
          params: {
            walletAddress: "zZNEUiAq2kLgWFJiZofHfcar91ph7yE2nUfLmXswkvP",
          },
        },
      },
      {
        input:
          "Transfer from him to my address: GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
        expectedToolCall: {
          tool: "", // should be no tool call since the user is asking to transfer from non owned account.
          params: {},
        },
      },
    ],
  },
];

runComplexEval(DATASET, "Multi-turn Transfer test");
