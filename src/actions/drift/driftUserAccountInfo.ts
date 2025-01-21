import { z } from "zod";
import type { Action } from "../../types";
import { driftUserAccountInfo } from "../../tools";

const driftUserAccountInfoAction: Action = {
  name: "DRIFT_USER_ACCOUNT_INFO",
  similes: ["get drift user account info", "get drift account info"],
  description: "Get information about your drift account",
  examples: [
    [
      {
        input: {},
        explanation: "Get information about your drift account",
        output: {
          status: "success",
          data: {},
        },
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent) => {
    try {
      const accountInfo = await driftUserAccountInfo(agent);
      return {
        status: "success",
        data: accountInfo,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error message is a string
        message: `Failed to get drift account info: ${e.message}`,
      };
    }
  },
};

export default driftUserAccountInfoAction;
