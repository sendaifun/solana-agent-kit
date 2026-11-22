import { PublicKey } from "@solana/web3.js";
import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { HELMSWAP_SOL_MINT } from "../tools/constants";
import { getHelmswapQuote } from "../tools/quote";

const getHelmswapQuoteAction: Action = {
  name: "GET_HELMSWAP_QUOTE",
  similes: [
    "helmswap quote",
    "quote swap on helmswap",
    "get helmswap price",
    "helmswap estimate",
  ],
  description:
    "Get a HelmSwap swap quote on Solana. Returns the expected output, the minimum output after slippage, and the disclosed fee. Nothing is executed. Amounts are in whole tokens (for example 0.01 SOL).",
  examples: [
    [
      {
        input: {
          outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          inputAmount: 0.01,
        },
        output: {
          status: "success",
          expectedOut: "701353",
          minOut: "697846",
          fee: { disclosed: true, feeBps: 25 },
          inputToken: "SOL",
          outputToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        explanation: "Quote swapping 0.01 SOL for USDC on HelmSwap",
      },
    ],
  ],
  schema: z.object({
    outputMint: z.string().min(32, "Invalid output mint address"),
    inputAmount: z.number().positive("Input amount must be positive"),
    inputMint: z.string().min(32, "Invalid input mint address").optional(),
    slippageBps: z.number().min(0).max(1000).optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const quote = await getHelmswapQuote(
      agent,
      new PublicKey(input.outputMint),
      input.inputAmount,
      input.inputMint ? new PublicKey(input.inputMint) : HELMSWAP_SOL_MINT,
      input.slippageBps,
    );

    return {
      status: "success",
      message: "HelmSwap quote fetched successfully",
      expectedOut: quote.expectedOut,
      minOut: quote.minOut,
      fee: quote.fee,
      inputAmount: input.inputAmount,
      inputToken: input.inputMint || "SOL",
      outputToken: input.outputMint,
    };
  },
};

export default getHelmswapQuoteAction;
