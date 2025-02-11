import { z } from "zod";
import { Action } from "../../types";
import { ActivationType } from "@meteora-ag/dlmm";
import { PublicKey } from "@solana/web3.js";
import { createMeteoraDlmmPool } from "../../tools";
import { BN } from "bn.js";

const createMeteoraDLMMPoolAction: Action = {
  name: "CREATE_METEORA_DLMM_POOL_ACTION",
  description: "Create a Meteora DLMM pool",
  similes: [
    "create a meteora dlmm pool",
    "create a dlmm pool",
    "create a meteora pool",
  ],
  examples: [
    [
      {
        input: {
          binStep: 100,
          tokenAMint: "4jRr...",
          tokenBMint: "8nRi...",
          initialPrice: 1,
          priceRoundingUp: true,
          feeBps: 100,
          activationType: "Timestamp",
          hasAlphaVault: true,
          activationPoint: 100,
        },
        output: {
          status: "success",
          signature: "33jHD...",
        },
        explanation: "Create a Meteora DLMM pool",
      },
    ],
  ],
  schema: z.object({
    binStep: z.number().int().positive(),
    tokenAMint: z.string().nonempty(),
    tokenBMint: z.string().nonempty(),
    initialPrice: z.number().nonnegative(),
    priceRoundingUp: z.boolean().optional(),
    feeBps: z.number().int().positive().max(500),
    activationType: z.nativeEnum(ActivationType),
    hasAlphaVault: z.boolean().optional(),
    activationPoint: z.number().int().optional(),
  }),
  handler: async (agent, input) => {
    try {
      const signature = await createMeteoraDlmmPool(
        agent,
        input.binStep,
        new PublicKey(input.tokenAMint),
        new PublicKey(input.tokenBMint),
        input.initialPrice,
        input.priceRoundingUp,
        input.feeBps,
        input.activationType,
        input.hasAlphaVault,
        input.activationPoint ? new BN(input.activationPoint) : undefined,
      );

      return {
        status: "success",
        signature,
      };
    } catch (error) {
      console.log(error);
      return {
        status: "error",
        // @ts-expect-error error message is a string
        message: `An error occurred while creating a Meteora DLMM pool: ${error.message}`,
      };
    }
  },
};

export default createMeteoraDLMMPoolAction;
