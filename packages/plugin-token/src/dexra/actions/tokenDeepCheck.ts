import { Action } from "solana-agent-kit";
import { z } from "zod";
import { dexraTokenDeepCheck } from "../tools";

const dexraTokenDeepCheckAction: Action = {
  name: "DEXRA_TOKEN_DEEP_CHECK",
  description:
    "Check who really holds a Solana token before buying or holding it: top holders funded from the same address, real concentration after merging linked wallets, holder and liquidity history, blacklist proximity, and authorities and Token-2022 extensions. Returns a verdict (ok, caution, avoid, unknown) with reasons.",
  similes: [
    "who holds this token",
    "holder concentration",
    "are the top holders linked",
    "deep token check",
  ],
  examples: [
    [
      {
        input: { mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
        output: {
          status: "success",
          result: {
            verdict: "caution",
            reasons: ["3 top holders funded by one address hold 21% of supply"],
          },
        },
        explanation: "Check who really holds a token",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().min(32).describe("Token mint address"),
  }),
  handler: async (agent, input) => {
    try {
      const result = await dexraTokenDeepCheck(agent, input.mint);
      return { status: "success", result };
    } catch (error: any) {
      return { status: "error", message: error.message };
    }
  },
};

export default dexraTokenDeepCheckAction;
