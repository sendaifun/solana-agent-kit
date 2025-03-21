import { runEvals } from "../utils/runEvals";

const CROSS_CHAIN_SWAP_DATASET = [
  {
    inputs: {
      query:
        "Swap 0.5 sol from Solana to Ethereum, receiving ETH in wallet 0x1234123412341234123412341234123412341234"
    },
    referenceOutputs: {
      tool: "cross_chain_swap",
      response: JSON.stringify({
        amount: "0.5",
        fromChain: "solana",
        fromToken: "sol",
        toChain: "ethereum",
        toToken: "eth",
        dstAddr: "0x1234123412341234123412341234123412341234"
      }),
    },
  },
  {
    inputs: {
      query:
        "Cross chain swap 10 USDC from EVM to Solana, deposit to 9aUn5swQzUTRanaaTwmszxiv89cvFwUCjEBv1vZCoT1u with 0.2% slippage"
    },
    referenceOutputs: {
      tool: "cross_chain_swap",
      response: JSON.stringify({
        amount: "10",
        fromChain: "ethereum",
        fromToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        toChain: "solana",
        toToken: "hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux",
        dstAddr: "9aUn5swQzUTRanaaTwmszxiv89cvFwUCjEBv1vZCoT1u",
        slippageBps: 20
      }),
    },
  },
];

runEvals(CROSS_CHAIN_SWAP_DATASET, "solana_cross_chain_swap eval");