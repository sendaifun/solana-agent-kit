import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import Decimal from "decimal.js";
import { raydiumCreateClmm } from "../tools";

const raydiumCreateClmmAction: Action = {
  name: "RAYDIUM_CREATE_CLMM",
  similes: [
    "create clmm pool",
    "create concentrated liquidity pool",
    "raydium clmm setup",
    "launch concentrated liquidity market maker",
  ],
  description: `Create a Raydium Concentrated Liquidity Market Maker (CLMM) pool with custom ranges, providing increased capital efficiency`,
  examples: [
    [
      {
        input: {
          mint1: "9xU1vzz456... (PublicKey)",
          mint2: "EfrsBcG98... (PublicKey)",
          configId: "D6yTTr... (Config PublicKey)",
          initialPrice: 123.12,
          startTime: 0, // or current UNIX timestamp
        },
        output: {
          status: "success",
          message: "Create raydium clmm pool successfully",
          transaction: "3skCN8... (transaction signature)",
        },
        explanation:
          "Creates a CLMM pool between mint1 and mint2 at an initial price of 123.12 and start time of 0.",
      },
    ],
  ],
  // Validate tool inputs using zod
  schema: z.object({
    mint1: z.string().min(1).describe("First token mint address (public key)"),
    mint2: z.string().min(1).describe("Second token mint address (public key)"),
    configId: z.string().min(1).describe("Raydium configId (public key)"),
    initialPrice: z.number().describe("Initial price for the CLMM pool"),
    startTime: z
      .number()
      .describe("Start time in seconds (UNIX timestamp or zero)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { mint1, mint2, configId, initialPrice, startTime } = input;

      const tx = await raydiumCreateClmm(
        agent,
        new PublicKey(mint1),
        new PublicKey(mint2),
        new PublicKey(configId),
        new Decimal(initialPrice),
        new BN(startTime),
      );

      return {
        status: "success",
        message: "Create raydium clmm pool successfully",
        transaction: tx,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to create CLMM pool: ${error.message}`,
        code: error.code || "UNKNOWN_ERROR",
      };
    }
  },
};

export default raydiumCreateClmmAction;
