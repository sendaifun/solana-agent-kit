import { PublicKey } from "@solana/web3.js";
import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { trade } from "../tools";
import { normalizeScaled } from "../utils/format";

const tradeAction: Action = {
  name: "TRADE",
  similes: [
    "swap tokens",
    "exchange tokens",
    "trade tokens",
    "convert tokens",
    "swap sol",
  ],
  description: `This tool can be used to swap tokens to another token (It uses DFlow).`,
  examples: [
    [
      {
        input: {
          outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          inputAmount: 0.25,
        },
        output: {
          status: "success",
          message: "Trade executed successfully",
          inputAmount: "0.25",
          inputToken: "SOL",
          outputAmount: "53.613066",
          outputToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          orderAddress: "45NbncPuuEwdijcbeizUVp215sG636LYctPc64a492Ur",
        },
        explanation: "Swap 0.25 SOL for USDC",
      },
    ],
    [
      {
        input: {
          outputMint: "So11111111111111111111111111111111111111112",
          inputAmount: 50,
          inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          slippageBps: 100,
        },
        output: {
          status: "success",
          message: "Trade executed successfully",
          inputAmount: "50",
          inputToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          outputAmount: "0.233879797",
          outputToken: "So11111111111111111111111111111111111111112",
          orderAddress: "9wT8YPyCJFS4BQmVyw2AiE8EhrZtLUu8VKdZHbVm97tX",
        },
        explanation: "Swap 50 USDC for SOL with 1% slippage",
      },
    ],
  ],
  schema: z.object({
    outputMint: z.string().min(32, "Invalid output mint address"),
    inputAmount: z.number().positive("Input amount must be positive"),
    inputMint: z.string().min(32, "Invalid input mint address").optional(),
    slippageBps: z.number().min(0).max(10000).optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const result = await trade(
      agent,
      new PublicKey(input.outputMint),
      input.inputAmount,
      input.inputMint
        ? new PublicKey(input.inputMint)
        : new PublicKey("So11111111111111111111111111111111111111112"),
      input.slippageBps,
    );

    return {
      status: "success",
      message: "Trade executed successfully",
      inputAmount: normalizeScaled(result.qtyIn, result.inputDecimals),
      inputToken: input.inputMint || "SOL",
      outputAmount: normalizeScaled(result.qtyOut, result.outputDecimals),
      outputToken: input.outputMint,
      orderAddress: result.orderAddress,
    };
  },
};

export default tradeAction;
