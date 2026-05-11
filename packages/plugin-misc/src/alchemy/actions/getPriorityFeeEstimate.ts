import { z } from "zod";
import { alchemyGetPriorityFeeEstimate } from "../tools";
import type {
  AlchemyAction as Action,
  AlchemyAgent as SolanaAgentKit,
} from "../types";

const alchemyGetPriorityFeeEstimateAction: Action = {
  name: "ALCHEMY_GET_PRIORITY_FEE_ESTIMATE",
  similes: [
    "alchemy priority fee",
    "estimate solana priority fee",
    "get priority fee estimate",
    "alchemy get priority fee estimate",
  ],
  description:
    "Fetches a Solana priority fee estimate through Alchemy's getPriorityFeeEstimate JSON-RPC method",
  examples: [
    [
      {
        input: {
          transaction: "base58-serialized-transaction",
          priorityLevel: "High",
        },
        output: {
          status: "success",
          result: {
            priorityFeeEstimate: 10000,
          },
          message: "Alchemy priority fee estimate fetched.",
        },
        explanation:
          "Requests a priority fee estimate for a serialized Solana transaction.",
      },
    ],
  ],
  schema: z.object({
    transaction: z
      .string()
      .min(1)
      .describe("Base58 serialized Solana transaction"),
    priorityLevel: z
      .enum(["Min", "Low", "Medium", "High", "VeryHigh", "UnsafeMax"])
      .optional()
      .describe("Requested priority fee level"),
    network: z
      .string()
      .optional()
      .describe(
        "Alchemy Solana network, such as solana-mainnet or solana-devnet",
      ),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await alchemyGetPriorityFeeEstimate(
        agent,
        [
          {
            transaction: input.transaction,
            options: {
              priorityLevel: input.priorityLevel ?? "Medium",
            },
          },
        ],
        { network: input.network },
      );

      return {
        status: "success",
        result,
        message: "Alchemy priority fee estimate fetched.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch Alchemy priority fee estimate: ${error.message}`,
      };
    }
  },
};

export default alchemyGetPriorityFeeEstimateAction;
