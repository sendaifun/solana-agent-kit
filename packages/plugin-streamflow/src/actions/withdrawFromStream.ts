import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { withdrawFromStream } from "../tools";

const withdrawFromStreamAction: Action = {
  name: "STREAMFLOW_WITHDRAW",
  similes: [
    "withdraw from stream",
    "claim unlocked tokens",
    "withdraw vested tokens",
    "claim stream tokens",
    "get stream payout",
  ],
  description:
    "Withdraw available unlocked tokens from a Streamflow stream. Only the recipient (or sender if automaticWithdrawal is set) can call this. The amount withdrawn cannot exceed the currently unlocked amount.",
  examples: [
    [
      {
        input: {
          streamId: "7QJxKEGyjqPtYXQRfGPLXLKzJ3YxmMBgPqKzLGNHKLpU",
          amount: 100,
          decimals: 9,
        },
        output: {
          status: "success",
          signature:
            "3wX5y7ZaBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789AbCdEfGhIjKlMnOpQrStUvWxYz9876543210DEF",
          message:
            "Withdrew 100 tokens from stream 7QJxKEGyjqPtYXQRfGPLXLKzJ3YxmMBgPqKzLGNHKLpU",
        },
        explanation:
          "Withdraws 100 unlocked tokens from the stream to the caller's wallet",
      },
    ],
  ],
  schema: z.object({
    streamId: z
      .string()
      .min(1)
      .describe("The Streamflow stream ID to withdraw from"),
    amount: z
      .number()
      .positive()
      .describe(
        "Number of tokens to withdraw (in token units, not lamports)",
      ),
    decimals: z
      .number()
      .describe("Number of decimals for the SPL token mint"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await withdrawFromStream(
        agent,
        input.streamId as string,
        input.amount as number,
        input.decimals as number,
      );

      return result;
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to withdraw from stream: ${error.message}`,
      };
    }
  },
};

export default withdrawFromStreamAction;
