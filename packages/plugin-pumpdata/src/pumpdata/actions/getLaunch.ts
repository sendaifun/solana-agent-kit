import { type Action, type SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { pumpDataResultFields, pumpdataGetLaunch } from "../tools";

const pumpdataGetLaunchAction: Action = {
  name: "PUMPDATA_GET_LAUNCH",
  similes: [
    "pump.fun launch history",
    "check pump.fun coin deployer",
    "how did launches like this go",
    "pumpdata launch record",
    "pump.fun coin record",
  ],
  description:
    "Costs $0.005 in USDC, paid over x402 from the agent's wallet. One pump.fun launch, historically: the deployer's record (launches, graduations, best run, gaps between launches), the bundle at creation, the share of supply insiders hold, curve progress, and how launches that looked the same at the same age went over their next 24 h (peak and close as a spread, graduated or dead). Facts about the past, not a prediction.",
  examples: [
    [
      {
        input: { mint: "D27Lb9LA6D4dFpogGoXMXvZYkRsZ7UuctxAFpFQ3pump" },
        output: {
          status: "success",
          summary:
            "This launch was created 9 min ago by a deployer with 14 launches and 1 graduation on record; 6 buyers in the first 10 s took 21% of supply; 3120 launches matched it: 3% of them graduated.",
          paidUsd: 0.005,
        },
        explanation: "The record behind a fresh pump.fun coin before a buy",
      },
    ],
  ],
  schema: z.object({
    mint: z
      .string()
      .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "must be a base58 address")
      .describe("The pump.fun coin's mint address"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const response = await pumpdataGetLaunch(agent, input.mint);
      return {
        status: "success",
        ...pumpDataResultFields(response),
        message: `pumpdata.fun launch record for ${input.mint} fetched.`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch pumpdata.fun launch record: ${error.message}`,
      };
    }
  },
};

export default pumpdataGetLaunchAction;
