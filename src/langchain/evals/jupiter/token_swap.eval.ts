import { runEvals } from "../utils/runEvals";

const TOKEN_SWAP_TOOL_CALL_DATASET = [
  {
    inputs: { query: "I want to trade 5 USDC for SOL" },
    referenceOutputs: {
      tool: "solana_trade",
      response:
        '{"outputMint":"So11111111111111111111111111111111111111112","inputAmount":5,"inputMint":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"}',
    },
  },
  {
    inputs: { query: "Exchange 1 SOL for JUP tokens" },
    referenceOutputs: {
      tool: "solana_trade",
      response:
        '{"outputMint":"JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN","inputAmount":1,"inputMint":"So11111111111111111111111111111111111111112"}',
    },
  },
  {
    inputs: { query: "Swap 10 USDC for JUP with 1% slippage" },
    referenceOutputs: {
      tool: "solana_trade",
      response:
        '{"outputMint":"JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN","inputAmount":10,"inputMint":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v","slippageBps":100}',
    },
  },
];

runEvals(TOKEN_SWAP_TOOL_CALL_DATASET, "Token swap tests");
