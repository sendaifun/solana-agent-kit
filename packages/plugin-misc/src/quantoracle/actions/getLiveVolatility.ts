import { Action } from "solana-agent-kit";
import { z } from "zod";
import { getLiveVolatility } from "../tools";

const getLiveVolatilityAction: Action = {
  name: "QUANTORACLE_LIVE_VOLATILITY",
  description:
    "Get LIVE realized volatility (7d/30d/90d) + regime for a crypto asset, computed from fresh market data. Pass only the ticker — QuantOracle fetches the candles and runs the math. Use this for current volatility instead of estimating it. $0.01 per call via x402 past 20 free calls/IP/day.",
  similes: [
    "current volatility",
    "live realized vol",
    "how volatile is bitcoin right now",
    "crypto volatility now",
    "fresh volatility data",
  ],
  examples: [
    [
      {
        input: { asset: "BTC" },
        output: {
          status: "success",
          result: {
            asset: "BTC",
            spot: 61728.7,
            realized_vol_30d: 0.31,
            regime: "NORMAL",
            source: "kraken",
          },
        },
        explanation: "Fresh BTC realized vol: 31% annualized over 30 days, normal regime.",
      },
    ],
  ],
  schema: z.object({
    asset: z.string().describe("Crypto asset symbol, e.g. BTC, ETH, SOL (USD pair)"),
  }),
  handler: async (agent, input) => {
    try {
      const result = await getLiveVolatility(agent, input as any);
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

export default getLiveVolatilityAction;
