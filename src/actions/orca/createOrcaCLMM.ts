import { z } from "zod";
import type { Action } from "../../types";
import { PublicKey } from "@solana/web3.js";
import { orcaCreateCLMM } from "../../tools";
import Decimal from "decimal.js";

const createOrcaCLMMAction: Action = {
  name: "CREATE_ORCA_CLMM_ACTION",
  description:
    "Create a Concentrated Liquidity Market Maker (CLMM) pool on Orca, the most efficient and capital-optimized CLMM on Solana. This function initializes a CLMM pool but does not add liquidity. You can add liquidity later using a centered position or a single-sided position.",
  similes: [
    "create orca clmm",
    "create orca concentrated pool",
    "create orca clmm pool",
    "create orca concentrated liquidity",
  ],
  examples: [
    [
      {
        input: {
          mintDeploy: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
          mintPair: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          initialPrice: 1.1,
          feeTier: 1,
        },
        output: {
          status: "success",
          message:
            "CLMM pool created successfully. Note: No liquidity was added.",
        },
        explanation: "Create a CLMM pool with USDC and JUP",
      },
    ],
  ],
  schema: z.object({
    mintDeploy: z
      .string()
      .describe("The mint address of the token you want to deploy"),
    mintPair: z
      .string()
      .describe(
        "The mint address of the token you want to pair the deployed mint with",
      ),
    initialPrice: z
      .number()
      .positive()
      .describe("Initial price of mintDeploy in terms of mintPair"),
    feeTier: z
      .number()
      .positive()
      .min(1)
      .describe(
        "The fee tier in bps. Options: 1, 2, 4, 5, 16, 30, 65, 100, 200",
      ),
  }),
  handler: async (agent, input) => {
    try {
      const [mintDeploy, mintPair, initialPrice, feeTier] = [
        new PublicKey(input.mintDeploy),
        new PublicKey(input.mintPair),
        new Decimal(input.initialPrice),
        input.feeTier,
      ];

      const signature = await orcaCreateCLMM(
        agent,
        mintDeploy,
        mintPair,
        initialPrice,
        feeTier,
      );

      return {
        status: "success",
        message:
          "CLMM pool created successfully. Note: No liquidity was added.",
        signature,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - TS doesn't know that `e` has a `message` property
        message: `Failed to create Orca CLMM pool: ${e.message}`,
      };
    }
  },
};

export default createOrcaCLMMAction;
