import { z } from "zod";
import type { Action } from "../../types";
import { unstakeFromDriftInsuranceFund } from "../../tools";

const unstakeFromDriftInsuranceFundAction: Action = {
  name: "UNSTAKE_FROM_DRIFT_INSURANCE_FUND_ACTION",
  description:
    "Unstake requested unstake token from the Drift Insurance fund once the cool period has elapsed",
  similes: [
    "unstake from the drift insurance fund",
    "withdraw from the drift insurance fund",
    "take out funds from the drift insurance fund",
  ],
  examples: [
    [
      {
        input: {
          symbol: "SOL",
        },
        output: {
          status: "success",
          message: "Unstaked your SOL from the Drift Insurance Fund",
          signature: "4FdasklhiIHyOI",
        },
        explanation: "Unstake SOL from the Drift Insurance Fund",
      },
    ],
  ],
  schema: z.object({
    symbol: z.string().describe("Symbol of the token to unstake"),
  }),
  handler: async (agent, input) => {
    try {
      const tx = await unstakeFromDriftInsuranceFund(agent, input.symbol);

      return {
        status: "success",
        message: `Unstaked your ${input.symbol} from the Drift Insurance Fund`,
        signature: tx,
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

export default unstakeFromDriftInsuranceFundAction;
