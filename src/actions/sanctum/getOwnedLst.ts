import { SolanaAgentKit } from "../../agent";
import { get_owned_lst } from "../../tools/sanctum/get_owned_lst";
import { Action } from "../../types/action";
import { z } from "zod";

const sanctumGetOwnedLstAction: Action = {
  name: "SANCTUM_GET_OWNED_LST",
  similes: [
    "get owned lst",
    "get owned lst tokens",
    "get owned lst assets",
    "get owned lst assets list",
  ],
  description:
    "Fetch the owned LST(Liquid Staking Token) on Sanctum with specified account",
  examples: [
    [
      {
        input: {},
        output: {
          lsts: [
            {
              mint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
              balance: 0.0035,
            },
          ],
        },
        explanation: "Owned LSTs fetched successfully",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentKit) => {
    try {
      const result = await get_owned_lst(agent);

      return {
        status: "success",
        message: "Owned LSTs fetched successfully",
        lsts: result,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Fetching owned LSTs failed: ${error.message}`,
      };
    }
  },
};

export default sanctumGetOwnedLstAction;
