import { MintLayout } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import Decimal from "decimal.js";
import { Action } from "solana-agent-kit";
import { z } from "zod";
import { createMeteoraDynamicAMMPool } from "../tools";

const createMeteoraDynamicAMMPoolAction: Action = {
  name: "CREATE_METEORA_DYNAMIC_AMM_POOL",
  description: "Create a new dynamic AMM pool on Meteora",
  similes: [
    "create dynamic AMM pool",
    "setup AMM pool",
    "new dynamic AMM pool",
    "create AMM pool",
    "setup liquidity pool",
    "new AMM pool",
  ],
  examples: [
    [
      {
        input: {
          tokenAAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          tokenBAddress: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
          tokenAAmount: 100,
          tokenBAmount: 100,
          tradeFeeNumerator: 1000,
          activationType: "Timestamp",
          activationPoint: 0,
          hasAlphaVault: false,
        },
        output: {
          status: "success",
          transaction: "78fj2...",
          message: "Successfully created Meteora dynamic AMM pool",
        },
        explanation: "Create a new dynamic AMM pool on Meteora for USDC/JUP",
      },
    ],
  ],
  schema: z.object({
    tokenAAddress: z.string().min(1).describe("The token A mint address"),
    tokenBAddress: z.string().min(1).describe("The token B mint address"),
    tokenAAmount: z
      .number()
      .positive()
      .describe("The token A amount in lamport units"),
    tokenBAmount: z
      .number()
      .positive()
      .describe("The token B amount in lamport units"),
    tradeFeeNumerator: z.number().positive().describe("Trade fee numerator"),
    activationType: z
      .enum(["Timestamp", "Slot"])
      .describe("Activation type")
      .optional(),
    activationPoint: z.number().describe("Activation point").optional(),
    hasAlphaVault: z
      .boolean()
      .describe("Whether the pool has Meteora alpha vault or not")
      .default(false),
  }),
  handler: async (agent, input) => {
    try {
      const tokenAMint = new PublicKey(input.tokenAMint);
      const tokenBMint = new PublicKey(input.tokenBMint);

      const tokenAMintInfo = await agent.connection.getAccountInfo(tokenAMint);
      const tokenBMintInfo = await agent.connection.getAccountInfo(tokenBMint);

      if (!tokenAMintInfo) {
        return {
          status: "error",
          message: "failed to fetch tokenAMint info",
          code: "UNKNOWN_ERROR",
        };
      }
      if (!tokenBMintInfo) {
        return {
          status: "error",
          message: "failed to fetch tokenBMint info",
          code: "UNKNOWN_ERROR",
        };
      }

      const tokenADecimals = MintLayout.decode(tokenAMintInfo.data).decimals;
      const tokenBDecimals = MintLayout.decode(tokenBMintInfo.data).decimals;

      const tokenAAmount = new BN(
        new Decimal(input.tokenAAmount).mul(10 ** tokenADecimals).toString(),
      );
      const tokenBAmount = new BN(
        new Decimal(input.tokenBAmount).mul(10 ** tokenBDecimals).toString(),
      );

      const tradeFeeNumerator = new BN(
        input.tradeFeeNumerator.toString(),
      ).toNumber();
      const activationType = input.activationType ?? 1;
      const activationPoint = input.activationPoint
        ? new BN(input.activationPoint)
        : null;
      const hasAlphaVault = input.hasAlphaVault ?? false;

      const transaction = await createMeteoraDynamicAMMPool(
        agent,
        tokenAMint,
        tokenBMint,
        tokenAAmount,
        tokenBAmount,
        {
          activationPoint,
          activationType,
          hasAlphaVault,
          tradeFeeNumerator,
          padding: Array(90).fill(0),
        },
      );

      return {
        status: "success",
        message: "Meteora Dynamic pool created successfully.",
        transaction,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      };
    }
  },
};

export default createMeteoraDynamicAMMPoolAction;
