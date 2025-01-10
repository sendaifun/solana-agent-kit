import { agentKit } from "../utils/solanaAgent";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";

export const swapTool = tool(
  async ({ outputMint, inputAmount, inputMint, inputDecimal }) => {
    try {
      const inputAmountWithDecimals = inputAmount * 10 ** inputDecimal;
      const outputMintAddress = new PublicKey(outputMint);
      const inputMintAddress = new PublicKey(inputMint);

      console.log(inputAmountWithDecimals, outputMintAddress, inputMintAddress);
      const tx = await agentKit.trade(
        outputMintAddress,
        inputAmountWithDecimals,
        inputMintAddress,
        200,
      );
      return tx;
    } catch (error) {
      console.error(error);
      return "error";
    }
  },
  {
    name: "swap",
    description:
      "call to swap/trade tokens from one token to the other using Jupiter exchange",
    schema: z.object({
      outputMint: z
        .string()
        .describe("The mint address of destination token to be swapped to"),
      inputAmount: z
        .number()
        .describe(
          "the input amount of the token to be swapped without adding any decimals",
        ),
      inputMint: z.string().describe("The mint address of the origin token "),
      inputDecimal: z
        .number()
        .describe("The decimal of the input token that is being traded"),
    }),
  },
);
