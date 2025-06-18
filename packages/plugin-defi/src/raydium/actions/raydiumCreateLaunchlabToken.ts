import { TxVersion } from "@raydium-io/raydium-sdk-v2";
import { Action } from "solana-agent-kit";
import { z } from "zod";
import { raydiumCreateLaunchlabToken } from "../tools/raydium_create_launchlab_token";
import BN from "bn.js";

const raydiumCreateLaunchlabTokenAction: Action = {
  name: "RAYDIUM_CREATE_LAUNCHLAB_TOKEN",
  similes: [
    "create launchlab token",
    "create raydium launchpad token",
    "launchlab token setup",
  ],
  description:
    "Create a Raydium Launchpad token with custom parameters, including name, symbol, supply, and URI.",
  examples: [
    [
      {
        input: {
          name: "My Launchpad Token",
          symbol: "MLT",
          decimals: 9,
          supply: 1000000,
          uri: "https://example.com/token-metadata.json",
          createOnly: true,
        },
        output: {
          status: "success",
          message: "Create raydium launchlab token successfully",
          transaction: "3skCN8... (transaction signature)",
        },
        explanation:
          "Creates a new Raydium Launchpad token with the specified parameters.",
      },
    ],
  ],
  schema: z.object({
    name: z.string().min(1).describe("Token name"),
    symbol: z.string().min(1).describe("Token symbol"),
    decimals: z.number().int().min(0).max(255).default(6).describe("Decimals"),
    supply: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("Initial token supply"),
    uri: z.string().url().describe("Token metadata URI"),
    platformId: z
      .string()
      .optional()
      .describe("Platform ID (default is Raydium platform)"),
    migrateType: z
      .enum(["amm", "cpmm"])
      .optional()
      .default("amm")
      .describe("Migration type (default is 'amm')"),
    txVersion: z
      .nativeEnum(TxVersion)
      .optional()
      .default(TxVersion.V0)
      .describe(
        "Transaction version (default is '0' for V0), other option is '1' for Legacy",
      ),
    slippageBps: z
      .number()
      .int()
      .min(0)
      .max(10000)
      .optional()
      .default(100)
      .describe("Slippage in basis points (default is 100 bps)"),
    buyAmount: z
      .number()
      .int()
      .min(1)
      .optional()
      .default(1)
      .describe("Buy amount in lamports (default is 0)"),
    createOnly: z
      .boolean()
      .optional()
      .default(false)
      .describe("Create mint only, without buying tokens"),
  }),
  handler: async (agent, input: Record<string, any>) => {
    const {
      name,
      symbol,
      decimals,
      supply,
      uri,
      platformId,
      migrateType,
      txVersion,
      slippageBps,
      buyAmount,
      createOnly,
    } = input;

    try {
      const tokenParams = {
        name,
        symbol,
        decimals,
        supply, // default supply
        uri,
        platformId,
        migrateType,
        txVersion,
        slippageBps, // default 1% slippage
        createOnly, // default false
        buyAmount: new BN(buyAmount as number), // default no buy amount
      };

      const result = await raydiumCreateLaunchlabToken(agent, tokenParams);

      if (agent.config.signOnly) {
        return {
          status: "success",
          message: "Create raydium launchlab token successfully",
          transactions: result,
        };
      }

      return {
        status: "success",
        // @ts-expect-error result is not typed yet
        message: `Launchlab token successfully created. The token mint address is ${result.newTokenAddress}.`,
        // @ts-expect-error result is not typed yet
        signatures: result.signatures,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to create launchlab token: ${error.message}`,
      };
    }
  },
};

export default raydiumCreateLaunchlabTokenAction;
