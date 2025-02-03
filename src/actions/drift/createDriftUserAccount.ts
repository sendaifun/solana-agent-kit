import { z } from "zod";
import type { Action } from "../../types";
import { createDriftUserAccount } from "../../tools";

const createDriftUserAccountAction: Action = {
  name: "CREATE_DRIFT_USER_ACCOUNT",
  similes: [
    "create drift account",
    "create drift user account",
    "create user account on drift",
  ],
  description: "Create a new user account on Drift protocol",
  examples: [
    [
      {
        input: {
          amount: 100,
          symbol: "SOL",
        },
        output: {
          status: "success",
          message: "User account created with 100 SOL successfully deposited",
          account: "4xKpN2...",
        },
        explanation: "Create a new user account with 100 SOL",
      },
    ],
  ],
  schema: z.object({
    amount: z
      .number()
      .positive()
      .describe(
        "Amount of the token to deposit. In normal token amounts e.g 50 SOL, 100 USDC, etc",
      ),
    symbol: z.string().describe("Symbol of the token to deposit"),
  }),
  handler: async (agent, input) => {
    try {
      const res = await createDriftUserAccount(
        agent,
        input.amount,
        input.symbol,
      );

      return {
        status: "success",
        message:
          res.message ??
          `User account created with ${input.amount} ${input.symobl} successfully deposited.`,
        account: res.account,
        signature: res.txSignature,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error message is a string
        message: `Failed to create user account: ${e.message}`,
      };
    }
  },
};

export default createDriftUserAccountAction;
