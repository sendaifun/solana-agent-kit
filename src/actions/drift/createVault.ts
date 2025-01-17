import { z } from "zod";
import type { Action } from "../../types";
import type { SolanaAgentKit } from "../..";
import { createVault } from "../../tools";

const createDriftVaultAction: Action = {
  name: "CREATE_DRIFT_VAULT",
  similes: ["create a drift vault", "open a drift vault", "create vault"],
  description:
    "Create a new drift vault delegating the agents address as the owner.",
  examples: [
    [
      {
        input: {
          name: "My Drift Vault",
          marketName: "SOL-SPOT",
          redeemPeriod: 30,
          maxTokens: 1000,
          minDepositAmount: 100,
          managementFee: 10,
          profitShare: 5,
          hurdleRate: 0.1,
          permissioned: false,
        },
        output: {
          status: "success",
          message: "Drift vault created successfully",
          signature:
            "2nFeP7taii3wGVgrWk4YiLMPmhtu3Zg9iXCUu4zGBDadwunHw8reXFxRWT7khbFsQ9JT3zK4RYDLNDFDRYvM3wJk",
        },
        explanation: "Create a drift vault",
      },
    ],
  ],
  schema: z.object({
    name: z
      .string()
      .min(5, "Name must be at least 5 characters")
      .describe("Has to be unique. 2 Vaults can not have the same name."),
    // regex matches SOL-SPOT
    marketName: z
      .string()
      .describe('Market name must be in the format "TOKEN-SPOT"'),
    redeemPeriod: z
      .number()
      .int()
      .min(1, "Redeem period must be at least 1")
      .describe(
        "Number of days to wait before funds deposited in a vault can be redeemed ",
      ),
    maxTokens: z
      .number()
      .int()
      .min(100, "Max tokens must be at least 100")
      .describe(
        "The maximum amount of tokens the vault will be accomodating. For example some vaults have a cap at 10 million USDC",
      ),
    minDepositAmount: z.number().positive().describe("Minimum deposit amount"),
    managementFee: z
      .number()
      .positive()
      .max(20)
      .describe(
        "How much of a fee you'll be taking to manage depositors funds. This is in percentage e.g 2 for 2%",
      ),
    profitShare: z
      .number()
      .positive()
      .max(90)
      .optional()
      .default(5)
      .describe(
        "How much of the profit you'll be sharing with depositors. This is in percentage e.g 2 for 2%. Defaults to 5%",
      ),
    hurdleRate: z.number().optional(),
    permissioned: z
      .boolean()
      .optional()
      .describe("Should the vault have a whitelist of not"),
  }),
  handler: async (agent: SolanaAgentKit, input) => {
    try {
      const tx = await createVault(
        agent,
        // @ts-expect-error - zod schema validation
        {
          ...input,
        },
      );

      return {
        status: "success",
        message:
          "Drift vault created successfully. Please note down the name of your vault as it is unique and was used to derive your vault address",
        vaultName: input.name,
        signature: tx,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - e is not a string
        message: `Failed to create drift vault: ${e.message}`,
      };
    }
  },
};

export default createDriftVaultAction;
