import { z } from "zod";
import { Action } from "../../types";
import removeOrCloseLiquidityFromMeteoraDLMMPosition from "../../tools/meteora/remove_liquidity_from_meteora_dlmm_position";

const removeLiquidityFromMeteoraDLMMPositionOrClosePositionAction: Action = {
  name: "REMOVE_LIQUIDITY_FROM_DLMM_POSITION_OR_CLOSE_POSITION_ACTION",
  description: "Remove liquidity from Meteora DLMM position or close position",
  similes: [
    "remove liquidity from a dlmm position",
    "close a meteora dlmm position",
    "remove liquidity from a meteora dlmm position",
  ],
  examples: [
    [
      {
        input: {
          poolAddress: "4jRr...",
          positionAddress: "8nRi...",
          percentageOfLiquidityToRemove: 100,
          shouldClaimAndClose: true,
        },
        output: {
          status: "success",
          data: {
            txSig: "33jHD...",
            positionAddress: "8nRi...",
          },
        },
        explanation:
          "Close a liquidity a Meteora DLMM position and claim the rewards",
      },
    ],
  ],
  schema: z.object({
    poolAddress: z.string().nonempty(),
    positionAddress: z.string().nonempty(),
    percentageOfLiquidityToRemove: z.number().int().positive(),
    shouldClaimAndClose: z.boolean().optional(),
  }),
  handler: async (agent, input) => {
    try {
      const result = await removeOrCloseLiquidityFromMeteoraDLMMPosition(
        agent,
        input.poolAddress,
        input.positionAddress,
        input.percentageOfLiquidityToRemove,
        input.shouldClaimAndClose,
      );

      return {
        status: "success",
        data: result,
      };
    } catch (error) {
      return {
        status: "error",
        // @ts-expect-error error message is a string
        message: `An error occurred while removing liquidity from Meteora DLMM position or closing position: ${error.message}`,
      };
    }
  },
};

export default removeLiquidityFromMeteoraDLMMPositionOrClosePositionAction;
