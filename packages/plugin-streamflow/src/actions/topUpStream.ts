import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { topUpStream } from "../tools";

const topUpStreamAction: Action = {
  name: "STREAMFLOW_TOPUP",
  similes: [
    "top up stream",
    "add funds to stream",
    "deposit more to stream",
    "increase stream balance",
    "refill stream",
  ],
  description:
    "Add more tokens to an existing Streamflow stream. Only the sender can top up a stream. This extends the total deposited amount without changing the schedule.",
  examples: [
    [
      {
        input: {
          streamId: "7QJxKEGyjqPtYXQRfGPLXLKzJ3YxmMBgPqKzLGNHKLpU",
          amount: 500,
          decimals: 9,
        },
        output: {
          status: "success",
          signature:
            "2yB4d6F8hJ0lN2pR4tV6wX8zA0bC2eG4iK6mO8qS0uW2yY4aC6eG8iK0mO2qS4uW6yY8aB0cD2eF4hJ6lN8p",
          message:
            "Topped up stream 7QJxKEGyjqPtYXQRfGPLXLKzJ3YxmMBgPqKzLGNHKLpU with 500 tokens",
        },
        explanation:
          "Adds 500 more tokens to an existing stream, increasing total payout",
      },
    ],
  ],
  schema: z.object({
    streamId: z
      .string()
      .min(1)
      .describe("The Streamflow stream ID to top up"),
    amount: z
      .number()
      .positive()
      .describe(
        "Number of additional tokens to deposit (in token units)",
      ),
    decimals: z
      .number()
      .describe("Number of decimals for the SPL token mint"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await topUpStream(
        agent,
        input.streamId as string,
        input.amount as number,
        input.decimals as number,
      );

      return result;
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to top up stream: ${error.message}`,
      };
    }
  },
};

export default topUpStreamAction;
