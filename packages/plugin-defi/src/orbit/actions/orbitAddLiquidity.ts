import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { orbitAddLiquidity } from "../tools";

const orbitAddLiquidityAction: Action = {
  name: "ORBIT_ADD_LIQUIDITY",
  description:
    "Open a liquidity position on Orbit Finance DLMM across a bin range (max 64 bins wide)",
  similes: [
    "add liquidity to orbit",
    "orbit add liquidity",
    "orbit provide liquidity",
    "orbit dlmm liquidity",
    "deposit to orbit pool",
  ],
  examples: [
    [
      {
        input: {
          poolId: "EoLGqHKvtK9NcxjjnvSxTYYuFMYDeWTFFyKYj1DcJyPB",
          amountX: 0,
          amountY: 100,
          lowerBinId: -32,
          upperBinId: 32,
          strategy: "uniform",
        },
        output: {
          status: "success",
          transaction: "3hJp7K...",
          message: "Successfully added liquidity to Orbit Finance pool",
        },
        explanation:
          "Add 100 USDC single-sided liquidity to the CIPHER/USDC Orbit pool across 64 bins",
      },
    ],
  ],
  schema: z.object({
    poolId: z.string().min(1).describe("Pool public key (base58)"),
    amountX: z.number().min(0).describe("Token X amount in human-readable units"),
    amountY: z.number().min(0).describe("Token Y amount in human-readable units"),
    lowerBinId: z.number().int().describe("Lower bound bin ID (inclusive)"),
    upperBinId: z.number().int().describe("Upper bound bin ID (inclusive, max lowerBinId + 63)"),
    strategy: z
      .enum(["uniform", "balanced", "concentrated", "skew_bid", "skew_ask", "bid_ask"])
      .optional()
      .describe("Distribution strategy (default: uniform)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await orbitAddLiquidity(
        agent,
        input.poolId as string,
        input.amountX as number,
        input.amountY as number,
        input.lowerBinId as number,
        input.upperBinId as number,
        input.strategy as any
      );
      return {
        status: "success",
        transaction: JSON.parse(result).transactionId,
        message: "Successfully added liquidity to Orbit Finance pool",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
      };
    }
  },
};

export default orbitAddLiquidityAction;
