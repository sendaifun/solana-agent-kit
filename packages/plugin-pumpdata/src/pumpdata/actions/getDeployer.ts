import { type Action, type SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { pumpDataResultFields, pumpdataGetDeployer } from "../tools";

const pumpdataGetDeployerAction: Action = {
  name: "PUMPDATA_GET_DEPLOYER",
  similes: [
    "pump.fun deployer record",
    "how many coins has this dev launched",
    "pump.fun creator history",
    "pumpdata deployer",
  ],
  description:
    "Costs $0.005 in USDC, paid over x402 from the agent's wallet. A pump.fun deployer's record, no coin needed: launches, graduations, best run, the gap between launches and its last launch; over the last 90 days how many of its launches doubled, did 10x, held 2x a day later or died within a day, its newest launches by mint; and the base rate for its next launch from deployers with the same record.",
  examples: [
    [
      {
        input: { address: "7ufmve7ZSFCzuNcKRunYrGtyb2Ka1MXzkWwf7jZhVsmL" },
        output: {
          status: "success",
          data: {
            record: { launches: 437, graduations: 152 },
            last_90_days: { launches_measured: 195, doubled: 59, ten_x: 5 },
          },
          paidUsd: 0.005,
        },
        explanation: "A deployer's launches and how they went",
      },
    ],
  ],
  schema: z.object({
    address: z
      .string()
      .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "must be a base58 address")
      .describe("The deployer's wallet address"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const response = await pumpdataGetDeployer(agent, input.address);
      return {
        status: "success",
        ...pumpDataResultFields(response),
        message: `pumpdata.fun deployer record for ${input.address} fetched.`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch pumpdata.fun deployer record: ${error.message}`,
      };
    }
  },
};

export default pumpdataGetDeployerAction;
