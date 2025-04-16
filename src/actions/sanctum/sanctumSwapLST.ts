import { z } from "zod";
import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { sanctumSwapLST } from "../../tools";

const sanctumSwapLSTAction: Action = {
  name: "SANCTUM_SWAP_LST",
  similes: ["swap lst in sanctum", "swap lst", "trade lst in sanctum"],
  description: `Swap LST(Liquid Staking Token) on Sanctum with specified parameters`,
  examples: [
    [
      {
        input: {
          inputLstMint: "So11111111111111111111111111111111111111112",
          amount: "1000000000",
          quotedAmount: "900000000",
          priorityFee: 5000,
          outputLstMint: "bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1",
        },
        output: {
          status: "success",
          message: "LST swapped successfully",
          txId: "2FqduazbmVrYAs6VMj7whKvFhEJnCyCvm7GiX4xCj1FSVr4CquPqFoCPDokUuJJ3T24EpXLPxrJWmGq6EnpsrJWf",
        },
        explanation: "Swap lst successfully on Sanctum",
      },
    ],
  ],
  schema: z.object({
    inputLstMint: z.string(),
    amount: z.string(),
    quotedAmount: z.string(),
    priorityFee: z.number(),
    outputLstMint: z.string(),
  }),

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await sanctumSwapLST(
        agent,
        input.inputLstMint,
        input.amount,
        input.quotedAmount,
        input.priorityFee,
        input.outputLstMint,
      );

      return {
        status: "success",
        message: "LST swapped successfully",
        txId: result.txId,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Swapping LST on Sanctum failed: ${error.message}`,
      };
    }
  },
};

export default sanctumSwapLSTAction;
