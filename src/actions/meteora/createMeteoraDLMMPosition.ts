import { z } from "zod";
import { Action } from "../../types";
import createMeteoraDLMMPosition from "../../tools/meteora/create_meteora_dlmm_position";

const createMeteoraDLMMPositionAction: Action = {
  name: "CREATE_METEORA_DLMM_POSITION_ACTION",
  description: "Create a Meteora DLMM position",
  similes: [
    "Create a Meteora DLMM position",
    "open a Meteora DLMM position",
    "start a Meteora DLMM position",
  ],
  examples: [
    [
      {
        input: {
          poolAddress: "poolAddress",
          tokenAAmount: 100,
          tokenBAmount: 100,
          strategy: "strategy",
          rangeInterval: 10,
        },
        output: {
          status: "success",
          data: {
            txSig: "txSig",
            positionAddress: "positionAddress",
          },
        },
        explanation: "Create a Meteora DLMM position",
      },
    ],
  ],
  schema: z.object({
    poolAddress: z.string(),
    tokenAAmount: z.number(),
    tokenBAmount: z.number(),
    strategy: z.string(),
    rangeInterval: z.number().optional(),
  }),
  handler: async (agent, input) => {
    try {
      const res = await createMeteoraDLMMPosition(
        agent,
        input.poolAddress,
        input.tokenAAmount,
        input.tokenBAmount,
        input.strategy,
      );

      return {
        status: "success",
        data: res,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error e is an object
        error: e.message,
      };
    }
  },
};

export default createMeteoraDLMMPositionAction;
