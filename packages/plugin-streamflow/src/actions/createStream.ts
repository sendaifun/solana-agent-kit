import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { createStream } from "../tools";

const createStreamAction: Action = {
  name: "STREAMFLOW_CREATE_STREAM",
  similes: [
    "create token stream",
    "start vesting schedule",
    "create payment stream",
    "stream tokens",
    "start token vesting",
    "create vesting contract",
  ],
  description:
    "Create a new token stream or vesting schedule on Streamflow. Supports linear vesting, cliff unlocks, and periodic payments.",
  examples: [
    [
      {
        input: {
          recipient: "8x2uYz7qty5v5JzPYiYPsBqPqZ8GJptF6Cq5sRQVKPmB",
          mint: "So11111111111111111111111111111111111111112",
          depositedAmount: 1000,
          period: 86400,
          cliffAmount: 200,
          amountPerPeriod: 50,
          decimals: 9,
          cancelableBySender: true,
          name: "Team vesting Q2 2026",
        },
        output: {
          status: "success",
          signature:
            "5KtUMRZ3bGMmZHKgWzY7cD9Xy8YwVKxvGxQFQEVcMZnJLjR9TChMBjiF9tEj7TMaJN5j9YJGBLDtXRyA6jFyBgjG",
          metadataId: "7QJxKEGyjqPtYXQRfGPLXLKzJ3YxmMBgPqKzLGNHKLpU",
          message:
            "Stream created successfully with 1000 tokens for 8x2uYz7qty5v5JzPYiYPsBqPqZ8GJptF6Cq5sRQVKPmB",
        },
        explanation:
          "Creates a vesting stream with a cliff (200 tokens), then linear daily unlock (50 tokens/day) for the recipient",
      },
    ],
  ],
  schema: z.object({
    recipient: z
      .string()
      .min(1)
      .describe("Solana wallet address of the stream recipient"),
    mint: z
      .string()
      .min(1)
      .describe("SPL token mint address to stream"),
    depositedAmount: z
      .number()
      .positive()
      .describe(
        "Total amount of tokens to deposit into the stream (in token units, not lamports)",
      ),
    period: z
      .number()
      .positive()
      .describe(
        "Number of seconds between each unlock period (e.g., 86400 for daily, 2592000 for monthly)",
      ),
    start: z
      .number()
      .optional()
      .describe("Unix timestamp (seconds) when the stream starts. Defaults to current time"),
    cliff: z
      .number()
      .optional()
      .describe(
        "Unix timestamp of the cliff — no tokens unlock before this time. Defaults to start if omitted",
      ),
    cliffAmount: z
      .number()
      .optional()
      .describe("Number of tokens released at the cliff (in token units). 0 if omitted"),
    amountPerPeriod: z
      .number()
      .optional()
      .describe(
        "Number of tokens released per period after the cliff (in token units). 0 if omitted",
      ),
    cancelableBySender: z
      .boolean()
      .optional()
      .default(true)
      .describe("Whether the sender can cancel the stream"),
    cancelableByRecipient: z
      .boolean()
      .optional()
      .default(false)
      .describe("Whether the recipient can cancel the stream"),
    transferableBySender: z
      .boolean()
      .optional()
      .default(true)
      .describe(
        "Whether the sender can transfer the stream to another party",
      ),
    transferableByRecipient: z
      .boolean()
      .optional()
      .default(true)
      .describe("Whether the recipient can transfer the stream"),
    automaticWithdrawal: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "Whether to automatically withdraw tokens as they unlock",
      ),
    name: z
      .string()
      .optional()
      .describe("Optional human-readable name for the stream"),
    decimals: z
      .number()
      .describe(
        "Number of decimals for the SPL token mint (e.g., 9 for SOL, 6 for USDC)",
      ),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await createStream(agent, {
        recipient: input.recipient as string,
        mint: input.mint as string,
        depositedAmount: input.depositedAmount as number,
        period: input.period as number,
        start: input.start as number | undefined,
        cliff: input.cliff as number | undefined,
        cliffAmount: input.cliffAmount as number | undefined,
        amountPerPeriod: input.amountPerPeriod as number | undefined,
        cancelableBySender:
          input.cancelableBySender as boolean | undefined,
        cancelableByRecipient:
          input.cancelableByRecipient as boolean | undefined,
        transferableBySender:
          input.transferableBySender as boolean | undefined,
        transferableByRecipient:
          input.transferableByRecipient as boolean | undefined,
        automaticWithdrawal:
          input.automaticWithdrawal as boolean | undefined,
        name: input.name as string | undefined,
        decimals: input.decimals as number,
      });

      return result;
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to create stream: ${error.message}`,
      };
    }
  },
};

export default createStreamAction;
