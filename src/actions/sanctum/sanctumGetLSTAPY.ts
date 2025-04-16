import { sanctumGetLSTAPY } from "../../tools";
import { Action } from "../../types/action";
import { z } from "zod";

const sanctumGetLSTAPYAction: Action = {
  name: "GET_SANCTUM_APY",
  similes: ["get sanctum LST APY", "fetch sanctum LST APY"],
  description:
    "Fetch the APY of a LST(Liquid Staking Token) on Sanctum with specified mint addresses or symbols",
  examples: [
    [
      {
        input: {
          inputs: [
            "INF",
            "pwrsol",
            "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
            "laineSOL",
          ],
        },
        output: {
          pwrsol: 0.08321988140942367,
          laineSOL: 0.0831767225669587,
          INF: 0.06542961909093714,
          mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: 0.08143705823579084,
        },
        explanation: "Fetch the APY of LSTs on Sanctum",
      },
    ],
  ],
  schema: z.object({
    inputs: z.array(z.string()),
  }),
  handler: async (input: Record<string, any>) => {
    try {
      const apys = await sanctumGetLSTAPY(input.inputs);

      return {
        status: "success",
        message: "APY fetched successfully",
        apys: apys,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Fetching Sanctum LST APY failed: ${error.message}`,
      };
    }
  },
};

export default sanctumGetLSTAPYAction;
