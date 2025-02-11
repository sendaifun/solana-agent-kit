import type { Action } from "../../types";
import { z } from "zod";
import { SolanaAgentKit } from "../../agent";
import {
  InputAssetStruct,
  TargetTokenStruct,
  PriorityFee,
} from "../../tools/solutiofi/types";

const spreadTokenAction: Action = {
  name: "SOLUTIOFI_SPREAD_TOKEN",
  description: "Split a token into multiple tokens using SolutioFi",
  similes: [
    "spread token",
    "split token",
    "swap token",
    "spread tokens with solutiofi",
    "swap one token for multiple",
    "buy multiple tokens at once",
    "break token into parts",
    "split token into multiple assets",
    "convert one token into many",
    "swap token into different tokens",
    "allocate token to multiple assets",
    "spread token balance across multiple tokens",
    "swap and distribute token",
    "convert token into smaller portions",
    "exchange one token for multiple",
    "redistribute token into other tokens",
    "convert and spread token balance",
    "swap one asset for multiple tokens",
  ],
  examples: [
    [
      {
        input: {
          inputAsset: { mint: "inputMint", amount: "1000" },
          targetTokens: [
            { mint: "targetMint1", percentage: 60 },
            { mint: "targetMint2", percentage: 40 },
          ],
          priorityFee: "fast",
        },
        output: {
          status: "success",
          message: "Successfully spread token",
          result: { transaction: "tx_signature" },
        },
        explanation: "Split one token into multiple target tokens",
      },
    ],
  ],
  schema: z.object({
    inputAsset: z
      .object({
        mint: z.string(),
        amount: z.string(),
      })
      .describe("Input asset to spread"),
    targetTokens: z
      .array(
        z.object({
          mint: z.string(),
          percentage: z.number(),
        }),
      )
      .describe("Target tokens with allocation percentages"),
    priorityFee: z
      .enum(["fast", "turbo", "ultra"])
      .describe("Transaction priority level"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { inputAsset, targetTokens, priorityFee } = input;
      const result = await agent.spreadToken(
        inputAsset as InputAssetStruct,
        targetTokens as TargetTokenStruct[],
        priorityFee as PriorityFee,
      );

      return {
        status: "success",
        result,
        message: "Successfully spread token",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to spread token: ${error.message}`,
        code: error.code || "SPREAD_TOKEN_ERROR",
      };
    }
  },
};

export default spreadTokenAction;
