import type { Action } from "../../types";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import { InputAssetStruct, PriorityFee } from "../../tools/solutiofi/types";

const mergeTokensAction: Action = {
  name: "SOLUTIOFI_MERGE_TOKENS",
  description: "Merge multiple tokens into one using SolutioFi",
  similes: [
    "merge tokens",
    "combine tokens",
    "swap tokens",
    "merge tokens with solutiofi",
    "swap multiple tokens for one",
    "convert tokens into a single asset",
    "merge SPL tokens",
    "swap tokens into one",
    "combine assets into one token",
    "convert multiple tokens into one",
    "swap multiple assets into a single token",
    "combine token holdings",
    "exchange tokens for a unified asset",
    "aggregate tokens into one",
  ],
  examples: [
    [
      {
        input: {
          inputAssets: [
            { mint: "mint1", amount: "100" },
            { mint: "mint2", amount: "200" },
          ],
          outputMint: "outputMint123",
          priorityFee: "fast",
        },
        output: {
          status: "success",
          message: "Successfully merged tokens",
          result: { transaction: "tx_signature" },
        },
        explanation: "Merge multiple tokens into one output token",
      },
    ],
  ],
  schema: z.object({
    inputAssets: z
      .array(
        z.object({
          mint: z.string(),
          amount: z.string(),
        }),
      )
      .describe("Array of input assets to merge"),
    outputMint: z.string().describe("Output token mint address"),
    priorityFee: z
      .enum(["fast", "turbo", "ultra"])
      .describe("Transaction priority level"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { inputAssets, outputMint, priorityFee } = input;
      const result = await agent.mergeTokens(
        inputAssets as InputAssetStruct[],
        outputMint,
        priorityFee as PriorityFee,
      );

      return {
        status: "success",
        result,
        message: "Successfully merged tokens",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to merge tokens: ${error.message}`,
        code: error.code || "MERGE_TOKENS_ERROR",
      };
    }
  },
};

export default mergeTokensAction;
