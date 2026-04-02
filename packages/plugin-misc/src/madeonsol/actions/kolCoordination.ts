import { Action } from "solana-agent-kit";
import { z } from "zod";
import { madeonsol_kol_coordination } from "../tools";

const madeonsolKolCoordinationAction: Action = {
  name: "MADEONSOL_KOL_COORDINATION_ACTION",
  similes: [
    "kol coordination",
    "tokens multiple kols are buying",
    "coordinated kol trades",
    "kol convergence",
    "smart money consensus",
  ],
  description:
    "Detect tokens that multiple Solana KOLs are trading simultaneously via MadeOnSol. Surfaces potential coordinated moves or organic convergence on the same token.",
  examples: [
    [
      {
        input: { period: "1h", min_kols: 3, limit: 5 },
        output: {
          status: "success",
          result: {
            tokens: [
              {
                token: "BONK",
                kol_count: 5,
                total_volume_usd: 250000,
              },
            ],
          },
        },
        explanation:
          "Find tokens that at least 3 KOLs traded in the last hour",
      },
    ],
  ],
  schema: z.object({
    period: z
      .string()
      .default("1h")
      .describe("Time period to check (e.g. 1h, 4h, 24h)"),
    min_kols: z
      .number()
      .min(2)
      .max(50)
      .default(3)
      .describe("Minimum number of KOLs that must have traded the token"),
    limit: z
      .number()
      .min(1)
      .max(50)
      .default(10)
      .describe("Number of results to return"),
  }),
  handler: async (agent, input) => {
    try {
      const data = await madeonsol_kol_coordination(agent, input);
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

export default madeonsolKolCoordinationAction;
