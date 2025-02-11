import { z } from "zod";
import { Action } from "../../types";
import getMeteoraDLMMPositionsByUser from "../../tools/meteora/get_meteora_dlmm_positions_by_user";

const getMeteoraDLMMPositionByUserAction: Action = {
  name: "GET_METEORA_DLMM_POSITION_BY_USER_ACTION",
  description: "Get Meteora DLMM position by user",
  similes: [
    "Get Meteora DLMM position by user",
    "get my meteora dlmm position",
    "get my wallet's meteora dlmm position",
  ],
  examples: [
    [
      {
        input: {
          userPubKey: "8Uikj...",
        },
        output: {
          status: "success",
          data: {
            pools: {
              poolAddress: "4jrR...",
              tokenX: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
              tokenY: "So11111111111111111111111111111111111111112",
              positions: [
                {
                  positionAddress: "4jrR...",
                  xAmount: 100,
                  yAmount: 100,
                  xReward: 100,
                  yReward: 100,
                  xFee: 100,
                  yFee: 100,
                },
              ],
            },
          },
        },
        explanation: "Get Meteora DLMM positions by user",
      },
    ],
  ],
  schema: z.object({
    userPublicKey: z.string().optional(),
  }),
  handler: async (agent, input) => {
    try {
      const res = await getMeteoraDLMMPositionsByUser(
        agent,
        input.userPublicKey,
      );
      return {
        status: "success",
        data: res,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error error has a message property
        message: e.message,
      };
    }
  },
};

export default getMeteoraDLMMPositionByUserAction;
