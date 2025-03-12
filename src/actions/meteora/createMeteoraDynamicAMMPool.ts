import { z } from "zod";
import { Action } from "../../types";
import { createMeteoraDynamicAMMPool } from "../../tools";
import { ActivationType } from "@meteora-ag/dlmm";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

const createDynamicMeteoraAMMPoolAction: Action = {
  name: "CREATE_DYNAMIC_METEORA_AMM_POOL_ACTION",
  description: "Create a dynamic Meteora AMM pool",
  similes: [
    "Create a dynamic Meteora AMM pool",
    "open a dynamic Meteora AMM pool",
    "start a dynamic Meteora AMM pool",
  ],
  examples: [
    [
      {
        input: {
          tokenAMint: "So11111111111111111111111111111111111111112",
          tokenBMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          tokenAAmount: 100,
          tokenBAmount: 100,
          tradeFeeNumerator: 25,
          activationType: "Timestamp",
          activationPoint: null,
          hasAlphaVault: false,
          padding: Array(90).fill(0),
        },
        output: {
          status: "success",
          data: {
            signature: "4jRr...",
          },
        },
        explanation: "Create a dynamic Meteora AMM pool",
      },
    ],
  ],
  schema: z.object({
    tokenAMint: z.string(),
    tokenBMint: z.string(),
    tokenAAmount: z.number(),
    tokenBAmount: z.number(),
    tradeFeeNumerator: z.number(),
    activationType: z.nativeEnum(ActivationType),
    activationPoint: z.null(),
    hasAlphaVault: z.boolean(),
    padding: z.array(z.number()).optional(),
  }),
  handler: async (agent, input) => {
    try {
      const res = await createMeteoraDynamicAMMPool(
        agent,
        new PublicKey(input.tokenAMint),
        new PublicKey(input.tokenBMint),
        new BN(input.tokenAAmount),
        new BN(input.tokenBAmount),
        {
          tradeFeeNumerator: input.tradeFeeNumerator,
          padding: input.padding ?? Array(90).fill(0),
          hasAlphaVault: input.hasAlphaVault,
          activationType: input.activationType,
          activationPoint: input.activationPoint
            ? new BN(input.activationPoint)
            : null,
        },
      );

      return {
        status: "success",
        data: {
          signature: res,
        },
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - e is an Error object
        error: e.message,
      };
    }
  },
};

export default createDynamicMeteoraAMMPoolAction;
