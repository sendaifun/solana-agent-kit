import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { orbitRemoveLiquidity } from "../tools";

const orbitRemoveLiquidityAction: Action = {
  name: "ORBIT_REMOVE_LIQUIDITY",
  description:
    "Withdraw liquidity from an Orbit Finance DLMM position (partial or full)",
  similes: [
    "remove liquidity from orbit",
    "orbit remove liquidity",
    "withdraw from orbit",
    "orbit withdraw liquidity",
    "close orbit position",
  ],
  examples: [
    [
      {
        input: {
          poolId: "EoLGqHKvtK9NcxjjnvSxTYYuFMYDeWTFFyKYj1DcJyPB",
          positionId: "YourPositionAddressHere",
          bpsToRemove: 10000,
        },
        output: {
          status: "success",
          transaction: "8mNqR1...",
          message: "Successfully removed liquidity from Orbit Finance position",
        },
        explanation: "Withdraw 100% of liquidity from an Orbit DLMM position and close it",
      },
    ],
  ],
  schema: z.object({
    poolId: z.string().min(1).describe("Pool public key (base58)"),
    positionId: z.string().min(1).describe("Position public key (base58)"),
    bpsToRemove: z
      .number()
      .int()
      .min(1)
      .max(10000)
      .optional()
      .describe("Basis points of liquidity to remove (default: 10000 = 100%)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await orbitRemoveLiquidity(
        agent,
        input.poolId as string,
        input.positionId as string,
        input.bpsToRemove as number | undefined
      );
      return {
        status: "success",
        transaction: JSON.parse(result).transactionId,
        message: "Successfully removed liquidity from Orbit Finance position",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
      };
    }
  },
};

export default orbitRemoveLiquidityAction;
