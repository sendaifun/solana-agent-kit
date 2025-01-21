import { z } from "zod";
import type { Action } from "../../types";
import { getLendingAndBorrowAPY } from "../../tools";

const lendAndBorrowAPYAction: Action = {
  name: "DRIFT_GET_LEND_AND_BORROW_APY_ACTION",
  description: "Get the lending and borrowing APY (in %) of a token on Drift",
  similes: [
    "get the lending and borrowing APY of a token on drift",
    "get the lending and borrowing APY of a token on drift",
    "get the lending and borrowing APY of the USDC token on drift",
    "get the lending and borrowing APY of the SOL token on drift",
  ],
  examples: [
    [
      {
        input: {
          symbol: "USDC",
        },
        output: {
          status: "success",
          data: {
            lendingAPY: 10,
            borrowingAPY: 12.1,
          },
        },
        explanation: "Get the lending and borrowing APY of the USDC token",
      },
    ],
  ],
  schema: z.object({
    symbol: z.string().describe("Symbol of the token"),
  }),
  handler: async (agent, input) => {
    try {
      const data = await getLendingAndBorrowAPY(agent, input.symbol);

      return {
        status: "success",
        data,
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

export default lendAndBorrowAPYAction;
