import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { raydiumCreateCpmm } from "../../tools";

const raydiumCreateCpmmAction: Action = {
  name: "RAYDIUM_CREATE_CPMM",
  similes: [
    "create raydium pool",
    "setup raydium liquidity pool",
    "initialize raydium amm",
    "create constant product market maker",
    "setup raydium cpmm",
    "create raydium trading pair",
  ],
  description:
    "Create a new Constant Product Market Maker (CPMM) pool on Raydium",
  examples: [
    [
      {
        input: {
          baseMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
          quoteMint: "So11111111111111111111111111111111111111112", // SOL
          baseAmount: 1000,
          quoteAmount: 10,
          startTime: 1672531200, // Unix timestamp
        },
        output: {
          status: "success",
          signature: "2ZE7Rz...",
          poolId: "7nxQB...",
          message: "Successfully created Raydium CPMM pool",
        },
        explanation:
          "Create a USDC-SOL pool with initial liquidity of 1000 USDC and 10 SOL",
      },
    ],
  ],
  schema: z.object({
    baseMint: z.string().min(1).describe("The base token mint address"),
    quoteMint: z.string().min(1).describe("The quote token mint address"),
    baseAmount: z
      .number()
      .positive()
      .describe("Initial base token amount to provide as liquidity"),
    quoteAmount: z
      .number()
      .positive()
      .describe("Initial quote token amount to provide as liquidity"),
    startTime: z
      .number()
      .positive()
      .describe("Unix timestamp when trading should start"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const mintA = new PublicKey(input.baseMint);
      const mintB = new PublicKey(input.quoteMint);
      const configId = new PublicKey(input.configId);
      const mintAAmount = new BN(input.baseAmount);
      const mintBAmount = new BN(input.quoteAmount);
      const startTime = new BN(input.startTime);

      const txId = await raydiumCreateCpmm(
        agent,
        mintA,
        mintB,
        configId,
        mintAAmount,
        mintBAmount,
        startTime,
      );

      return {
        status: "success",
        signature: txId,
        message: "Successfully created Raydium CPMM pool",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to create CPMM pool: ${error.message}`,
      };
    }
  },
};

export default raydiumCreateCpmmAction;
