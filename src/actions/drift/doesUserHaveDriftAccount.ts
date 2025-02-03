import { z } from "zod";
import { doesUserHaveDriftAccount } from "../../tools";
import type { Action } from "../../types";

export const doesUserHaveDriftAccountAction: Action = {
  name: "DOES_USER_HAVE_DRIFT_ACCOUNT",
  description: "Check if a user has a Drift account",
  similes: [
    "check if user has drift account",
    "check if user has account on drift",
    "do I have an account on drift",
  ],
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          message: "Nice! You have a Drift account",
          account: "4xKpN2...",
        },
        explanation: "Check if a user has a Drift account",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent) => {
    try {
      const res = await doesUserHaveDriftAccount(agent);

      if (!res.hasAccount) {
        return {
          status: "error",
          message: "You do not have a Drift account",
        };
      }

      return {
        status: "success",
        message: "Nice! You have a Drift account",
        account: res.account,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error message is a string
        message: `Failed to check if you have a Drift account: ${e.message}`,
      };
    }
  },
};

export default doesUserHaveDriftAccountAction;
