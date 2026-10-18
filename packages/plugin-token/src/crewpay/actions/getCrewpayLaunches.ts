import { type Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { getCrewpayLaunches } from "../tools/getCrewpayLaunches";

const getCrewpayLaunchesAction: Action = {
  name: "CREWPAY_LIST_LAUNCHES",
  similes: [
    "list my crewpay launches",
    "show my launched coins",
    "check crewpay fee share status",
  ],
  description:
    "List coins this agent launched through CrewPay (mint, ticker, feeShareLocked, coin page). The launching agent earns 15% of each coin's creator fees onchain. Requires CREWPAY_API_KEY.",
  examples: [
    [
      {
        input: { limit: 5 },
        output: {
          status: "success",
          result: { launches: [{ ticker: "HOOT", feeShareLocked: true }] },
        },
        explanation: "List recent launches for this agent key",
      },
    ],
  ],
  schema: z.object({
    limit: z.number().int().min(1).max(100).optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await getCrewpayLaunches(agent, input.limit ?? 20);
      return { status: "success", result };
    } catch (error: any) {
      return { status: "error", message: error.message };
    }
  },
};

export default getCrewpayLaunchesAction;
