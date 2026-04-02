import { Action } from "solana-agent-kit";
import { z } from "zod";
import { madeonsol_deployer_alerts } from "../tools";

const madeonsolDeployerAlertsAction: Action = {
  name: "MADEONSOL_DEPLOYER_ALERTS_ACTION",
  similes: [
    "deployer alerts",
    "new token launches",
    "deployer activity",
    "pump fun deployers",
    "serial deployer alerts",
    "new solana tokens",
  ],
  description:
    "Get alerts for suspicious or notable Solana token deployers via MadeOnSol. Tracks serial deployers, rug patterns, and new token launches on Pump.fun and Raydium.",
  examples: [
    [
      {
        input: { limit: 10 },
        output: {
          status: "success",
          result: {
            alerts: [
              {
                deployer: "5xYz...",
                token_count: 12,
                risk_score: 0.85,
                latest_token: "SCAM",
              },
            ],
          },
        },
        explanation: "Get the 10 most recent deployer alerts",
      },
    ],
  ],
  schema: z.object({
    limit: z
      .number()
      .min(1)
      .max(100)
      .default(10)
      .describe("Number of alerts to return"),
    since: z
      .string()
      .optional()
      .describe("ISO timestamp to filter alerts after"),
    offset: z.number().optional().describe("Pagination offset"),
  }),
  handler: async (agent, input) => {
    try {
      const data = await madeonsol_deployer_alerts(agent, input);
      return { status: "success", result: data };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error is not a property of unknown
        message: e.message,
      };
    }
  },
};

export default madeonsolDeployerAlertsAction;
