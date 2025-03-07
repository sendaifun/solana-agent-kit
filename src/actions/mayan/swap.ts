import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { swap } from "../../tools";

const swapAction: Action = {
  name: "SWAP",
  similes: ["swap tokens", "exchange tokens", "cross-chain swap"],
  description: `This tool can be used to swap tokens to another token cross-chain (It uses Mayan Swap SDK).`,
  examples: [
    [
      {
        input: {
          amount: "0.02",
          fromChain: "solana",
          fromToken: "SOL",
          toChain: "polygon",
          toToken: "pol",
          dstAddr: "0x0cae42c0ce52e6e64c1e384ff98e686c6ee225f0",
        },
        output: {
          status: "success",
          message: "Swap executed successfully",
          url: "https://explorer.mayan.finance/swap/3JywZA6om5t1c5gT1bkFX91bEewHGmntJAqRZniEzETDEBMERvzxBeXVUUMFaernRCmvniZTKsAM7TVG3CTumc12",
        },
        explanation:
          "swap 0.02 SOL from solana to pol polygon destination 0x0cae42c0ce52e6e64c1e384ff98e686c6ee225f0",
      },
      {
        input: {
          amount: "0.02",
          fromChain: "solana",
          fromToken: "SOL",
          toChain: "solana",
          toToken: "HNT",
          dstAddr: "4ZgCP2idpqrxuQNfsjakJEm9nFyZ2xnT4CrDPKPULJPk",
        },
        output: {
          status: "success",
          message: "Swap executed successfully",
          url: "https://explorer.mayan.finance/swap/2GLNqs5gXCBSwRt6VjtfQRnLWYbcU1gzkgjWMWautv1RUj13Di4qJPjV29YRpoAdMYxgXj8ArMLzF3bCCZmVUXHz",
        },
        explanation:
          "swap 0.02 sol from solana to hnt solana destination 4ZgCP2idpqrxuQNfsjakJEm9nFyZ2xnT4CrDPKPULJPk",
      },
    ],
    [
      {
        input: {
          amount: "0.02",
          fromChain: "solana",
          fromToken: "SOL",
          toChain: "solana",
          toToken: "HNT",
          dstAddr: "4ZgCP2idpqrxuQNfsjakJEm9nFyZ2xnT4CrDPKPULJPk",
        },
        output: {
          status: "success",
          message: "Swap executed successfully",
          url: "https://explorer.mayan.finance/swap/2GLNqs5gXCBSwRt6VjtfQRnLWYbcU1gzkgjWMWautv1RUj13Di4qJPjV29YRpoAdMYxgXj8ArMLzF3bCCZmVUXHz",
        },
        explanation:
          "swap 0.02 sol from solana to hnt solana destination 4ZgCP2idpqrxuQNfsjakJEm9nFyZ2xnT4CrDPKPULJPk",
      },
    ],
  ],
  schema: z.object({
    amount: z
      .string()
      .refine(
        (val) => !isNaN(+val) && Number(val).toString() === val,
        "amount is not a valid number",
      ),
    fromChain: z.enum([
      "solana",
      "ethereum",
      "bsc",
      "polygon",
      "avalanche",
      "arbitrum",
      "optimism",
      "base",
    ]),
    fromToken: z.string(),
    toChain: z.enum([
      "solana",
      "ethereum",
      "bsc",
      "polygon",
      "avalanche",
      "arbitrum",
      "optimism",
      "base",
    ]),
    toToken: z.string(),
    dstAddr: z.string().min(32, "Invalid destination address"),
    inputAmount: z.number().positive("Input amount must be positive"),
    slippageBps: z.number().min(0).max(10000).optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    // TODO: should we allow evm to evm?
    if (input.fromChain !== "solana" && input.toChain !== "solana") {
      throw new Error("one of the from or to chain should be solana.");
    }

    const url = await swap(
      agent,
      input.amount,
      input.fromChain,
      input.fromToken,
      input.toChain,
      input.toToken,
      input.dstAddr,
      input.slippageBps,
    );

    return {
      status: "success",
      message: "Swap executed successfully",
      url,
    };
  },
};

export default swapAction;
