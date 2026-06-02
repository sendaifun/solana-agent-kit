import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { cancelStream } from "../tools";

const cancelStreamAction: Action = {
  name: "STREAMFLOW_CANCEL_STREAM",
  similes: [
    "cancel stream",
    "stop vesting",
    "terminate stream",
    "end payment stream",
    "revoke stream",
    "close stream",
  ],
  description:
    "Cancel an existing Streamflow stream. The sender receives the unstreamed balance back; the recipient keeps what has already been withdrawn. Only callable if the stream was created with cancelableBySender or cancelableByRecipient set to true.",
  examples: [
    [
      {
        input: {
          streamId: "7QJxKEGyjqPtYXQRfGPLXLKzJ3YxmMBgPqKzLGNHKLpU",
        },
        output: {
          status: "success",
          signature:
            "4vY6V8jKzMnGpQxR9T2WbLcDnEfHgJkLmNpQsRwTxYzAbCdEfGhIjKlMnOpQrStUvWxYz1234567890ABC",
          message:
            "Stream 7QJxKEGyjqPtYXQRfGPLXLKzJ3YxmMBgPqKzLGNHKLpU cancelled successfully",
        },
        explanation:
          "Cancels an active stream, returning unstreamed tokens to the sender",
      },
    ],
  ],
  schema: z.object({
    streamId: z
      .string()
      .min(1)
      .describe(
        "The Streamflow stream ID (public key of the stream account) to cancel",
      ),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await cancelStream(agent, input.streamId as string);

      return result;
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to cancel stream: ${error.message}`,
      };
    }
  },
};

export default cancelStreamAction;
