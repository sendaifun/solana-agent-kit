import { z } from "zod";
import type { Action } from "../../types";
import { stakeToDriftInsuranceFund } from "../../tools";

const stakeToDriftInsuranceFundAction: Action = {
  name: "STAKE_TO_DRIFT_INSURANCE_FUND_ACTION",
  description: "Stake a token to Drift Insurance Fund",
  similes: ["Stake a token to Drift Insurance Fund"],
  examples: [
    [
      {
        input: {
          amount: 100,
          symbol: "SOL",
        },
        output: {
          status: "success",
          message: "Staked 100 SOL to the Drift Insurance Fund",
          data: {
            signature: "signature",
          },
        },
        explanation: "Stake 100 SOL to the Drift Insurance Fund",
      },
    ],
  ],
  schema: z.object({
    amount: z
      .number()
      .positive()
      .describe("Amount to stake in normal units e.g 50 === 50 SOL"),
    symbol: z.string().describe("Symbol of the token stake"),
  }),
  handler: async (agent, input) => {
    try {
      const tx = await stakeToDriftInsuranceFund(
        agent,
        input.amount,
        input.symbol,
      );

      return {
        status: "sucess",
        message: `Staked ${input.amount} ${input.symbol} to the Drift Insurance Fund`,
        data: {
          signature: tx,
        },
      };
    } catch (error) {
      return {
        status: "error",
        // @ts-expect-error error is not a string
        message: error.message,
      };
    }
  },
};

export default stakeToDriftInsuranceFundAction;
