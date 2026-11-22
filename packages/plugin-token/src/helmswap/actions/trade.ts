import { PublicKey } from "@solana/web3.js";
import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { HELMSWAP_SOL_MINT } from "../tools/constants";
import { tradeWithHelmswap } from "../tools/trade";

const tradeWithHelmswapAction: Action = {
  name: "TRADE_WITH_HELMSWAP",
  similes: [
    "swap with helmswap",
    "trade with helmswap",
    "helmswap swap",
    "exchange tokens with helmswap",
  ],
  description:
    "Swap tokens on Solana using HelmSwap. HelmSwap builds an unsigned transaction and the agent's wallet signs and sends it. The API never signs or broadcasts. A disclosed fee is included in the quote. Amounts are in whole tokens (for example 0.01 SOL). Building a swap requires a free API key (HELMSWAP_API_KEY) from https://helmswap.com/developers.",
  examples: [
    [
      {
        input: {
          outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          inputAmount: 0.01,
        },
        output: {
          status: "success",
          message: "HelmSwap trade executed successfully",
          transaction:
            "5UfgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
          inputAmount: 0.01,
          inputToken: "SOL",
          outputToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          expectedOut: "701353",
          minOut: "697846",
          fee: { disclosed: true, feeBps: 25 },
        },
        explanation: "Swap 0.01 SOL for USDC using HelmSwap",
      },
    ],
    [
      {
        input: {
          outputMint: "So11111111111111111111111111111111111111112",
          inputAmount: 1,
          inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          slippageBps: 100,
        },
        output: {
          status: "success",
          message: "HelmSwap trade executed successfully",
          transaction:
            "4VfgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgqJKxEqy9k4Rz9LpXrHF9kUZB7",
          inputAmount: 1,
          inputToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          outputToken: "So11111111111111111111111111111111111111112",
        },
        explanation: "Swap 1 USDC for SOL on HelmSwap with 1% slippage",
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
    const result = await tradeWithHelmswap(
      agent,
      new PublicKey(input.outputMint),
      input.inputAmount,
      input.inputMint ? new PublicKey(input.inputMint) : HELMSWAP_SOL_MINT,
      input.slippageBps,
    );

    return {
      status: "success",
      message: "HelmSwap trade executed successfully",
      transaction: result.transaction,
      inputAmount: result.inputAmount,
      inputToken: input.inputMint || "SOL",
      outputToken: input.outputMint,
      expectedOut: result.expectedOut,
      minOut: result.minOut,
      fee: result.fee,
    };
  },
};

export default tradeWithHelmswapAction;
