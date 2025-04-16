import { sanctumGetLSTTVL } from "../../tools";
import { Action } from "../../types/action";
import { z } from "zod";

const sanctumGetLSTTVLTool: Action = {
  name: "GET_SANCTUM_TVL",
  similes: ["get sanctum LST TVL", "fetch sanctum LST TVL"],
  description:
    "Fetch the TVL of a LST(Liquid Staking Token) on Sanctum with specified mint addresses or symbols",

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
          pwrsol: "3100602224977",
          INF: "620838653321879",
          mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: "4892112998338119",
          laineSOL: "55512833109331",
        },
        explanation: "Fetch the TVL of LSTs on Sanctum",
      },
    ],
  ],
  schema: z.object({
    inputs: z.array(z.string()),
  }),
  handler: async (input: Record<string, any>) => {
    try {
      const tvls = await sanctumGetLSTTVL(input.inputs);

      return {
        status: "success",
        message: "TVL fetched successfully",
        tvls: tvls,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Fetching Sanctum LST TVL failed: ${error.message}`,
      };
    }
  },
};

export default sanctumGetLSTTVLTool;
