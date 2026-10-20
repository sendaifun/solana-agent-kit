import { Action } from "solana-agent-kit";
import { z } from "zod";
import { dexraLaunchCheck } from "../tools";

const dexraLaunchCheckAction: Action = {
  name: "DEXRA_LAUNCH_CHECK",
  description:
    "Check fresh Solana launches (pump.fun, LetsBonk, PumpSwap, Raydium, Meteora) before buying: mint and freeze authority, liquidity and lock, the creator's earlier launches and collapses, and who funded the first buyers. Returns a verdict per launch (ok, caution, avoid, or unknown while data is missing) with reasons.",
  similes: [
    "is this new token a rug",
    "check pump.fun coin before buying",
    "check new launch",
    "who are the first buyers",
    "is the dev a serial rugger",
  ],
  examples: [
    [
      {
        input: {
          mints: ["<pump.fun mint>"],
        },
        output: {
          status: "success",
          result: {
            results: [
              {
                mint: "<pump.fun mint>",
                found: true,
                launches: [
                  {
                    platform: "pump_fun",
                    verdict: "avoid",
                    reasons: ["the creator's 4 earlier launches collapsed"],
                  },
                ],
              },
            ],
          },
        },
        explanation: "Check a fresh pump.fun coin before buying it",
      },
    ],
  ],
  schema: z.object({
    mints: z
      .array(z.string().min(32))
      .min(1)
      .max(50)
      .describe("Token mints to check, up to 5 on a free key"),
  }),
  handler: async (agent, input) => {
    try {
      const result = await dexraLaunchCheck(agent, input.mints);
      return { status: "success", result };
    } catch (error: any) {
      return { status: "error", message: error.message };
    }
  },
};

export default dexraLaunchCheckAction;
