import { z } from "zod";
import type { Action } from "../../types";
import { requestUnstakeFromDriftInsuranceFund } from "../../tools";

const requestUnstakeFromDriftInsuranceFundAction: Action = {
  name: "REQUEST_UNSTAKE_FROM_DRIFT_INSURANCE_FUND_ACTION",
  description:
    "Request to unstake a certain amount of a token from the Drift Insurance Fund",
  similes: [
    "request an unstake from the drift insurance fund",
    "request to unstake an amount from the drift insurance fund",
  ],
  examples: [
    [
      {
        input: {
          amount: 100,
          symbol: "SOL",
        },
        output: {
          status: "success",
          message: "Requested to unstake 100 SOL from the Drift Insurance Fund",
          signature: "4FdasklhiIHyOI",
        },
        explanation: "Request to unstake 100 SOL from the Drift Insurance Fund",
      },
    ],
  ],
  schema: z.object({
    amount: z
      .number()
      .positive()
      .describe("Amount to unstake in normal units e.g 50 === 50 SOL"),
    symbol: z.string().describe("Symbol of the token to unstake"),
  }),
  handler: async (agent, input) => {
    try {
      const tx = await requestUnstakeFromDriftInsuranceFund(
        agent,
        input.amount,
        input.symbol,
      );

      return {
        status: "success",
        message: `Requested to unstake ${input.amount} ${input.symbol} from the Drift Insurance Fund`,
        data: {
          signature: tx,
        },
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error error is not a string
        message: e.message,
      };
    }
  },
};

export default requestUnstakeFromDriftInsuranceFundAction;
