import { Action } from "solana-agent-kit";
import { z } from "zod";
import { getLiveFundingRate } from "../tools";

const getLiveFundingRateAction: Action = {
  name: "QUANTORACLE_LIVE_FUNDING_RATE",
  description:
    "Get the LIVE perpetual funding rate + annualized carry for a crypto asset, from a fresh exchange feed. Pass only the ticker. Use this for current funding instead of estimating it — funding erodes collateral on perps and shifts liquidation prices. $0.005 per call via x402 past 20 free calls/IP/day.",
  similes: [
    "current funding rate",
    "live perp funding",
    "what is the funding rate",
    "perpetual funding now",
    "annualized carry",
  ],
  examples: [
    [
      {
        input: { asset: "ETH" },
        output: {
          status: "success",
          result: {
            asset: "ETH",
            funding_rate: -0.000104,
            annualized_rate: -0.1137,
            regime: "BACKWARDATION",
            source: "okx",
          },
        },
        explanation: "ETH perp funding is negative (-11.4% annualized) — shorts pay longs.",
      },
    ],
  ],
  schema: z.object({
    asset: z.string().describe("Crypto asset symbol, e.g. BTC, ETH, SOL (USD pair)"),
  }),
  handler: async (agent, input) => {
    try {
      const result = await getLiveFundingRate(agent, input as any);
      return { status: "success", result };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error is not a property of unknown
        message: e.message,
      };
    }
  },
};

export default getLiveFundingRateAction;
