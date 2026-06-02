import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { getStreamData } from "../tools";

const getStreamDataAction: Action = {
  name: "STREAMFLOW_GET_STREAM",
  similes: [
    "get stream details",
    "check stream status",
    "stream info",
    "view vesting schedule",
    "check stream balance",
  ],
  description:
    "Get details of a specific Streamflow stream, including deposited/withdrawn amounts, schedule, cliff, period, and status.",
  examples: [
    [
      {
        input: {
          streamId: "7QJxKEGyjqPtYXQRfGPLXLKzJ3YxmMBgPqKzLGNHKLpU",
        },
        output: {
          status: "success",
          stream: {
            sender: "GpJFt6Cq5sRQVKPmB8x2uYz7qty5v5JzPYiYPsBqPqZ8",
            recipient: "8x2uYz7qty5v5JzPYiYPsBqPqZ8GJptF6Cq5sRQVKPmB",
            mint: "So11111111111111111111111111111111111111112",
            depositedAmount: "1000000000000",
            withdrawnAmount: "500000000000",
            startTime: 1717200000,
            endTime: 1728000000,
            cliff: 1719792000,
            cliffAmount: "200000000000",
            period: 86400,
            amountPerPeriod: "50000000000",
            cancelableBySender: true,
            cancelableByRecipient: false,
            transferableBySender: true,
            transferableByRecipient: true,
            automaticWithdrawal: false,
            name: "Team vesting Q2 2026",
            closed: false,
            createdAt: 1717000000,
          },
        },
        explanation:
          "Returns full stream details including vesting schedule, deposited/withdrawn amounts, and current status",
      },
    ],
  ],
  schema: z.object({
    streamId: z
      .string()
      .min(1)
      .describe("The Streamflow stream ID to query"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await getStreamData(
        agent,
        input.streamId as string,
      );

      return result;
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get stream data: ${error.message}`,
      };
    }
  },
};

export default getStreamDataAction;
