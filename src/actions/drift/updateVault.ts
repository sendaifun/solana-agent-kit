import { z } from "zod";
import type { Action } from "../../types";
import type { SolanaAgentKit } from "../../agent";
import { updateVault } from "../../tools";

const updateDriftVaultAction: Action = {
  name: "UPDATE_DRIFT_VAULT",
  similes: ["update a drift vault", "modify a drift vault", "update vault"],
  description: "Update an existing drift vault with new settings.",
  examples: [
    [
      {
        input: {
          redeemPeriod: 30,
          maxTokens: 10000,
          minDepositAmount: 10,
          managementFee: 5,
          profitShare: 10,
          handleRate: 0.1,
          permissioned: false,
          vaultAddress: "2nFeP7taii3wGVgrWk4YiLMPmhtu3Zg9iXCUu4zGBD",
        },
        output: {
          status: "success",
          message: "Drift vault updated successfully",
          signature:
            "2nFeP7taii3wGVgrWk4YiLMPmhtu3Zg9iXCUu4zGBDadwunHw8reXFxRWT7khbFsQ9JT3zK4RYDLNDFDRYvM3wJk",
        },
        explanation: "Update a drift vault",
      },
    ],
  ],
  schema: z.object({
    vaultAddress: z.string(),
    name: z.string().min(5, "Name must be at least 5 characters").optional(),
    // regex matches SOL-SPOT
    marketName: z
      .string()
      .regex(/^([A-Za-z0-9]{2,7})-SPOT$/)
      .optional(),
    redeemPeriod: z
      .number()
      .int()
      .min(1, "Redeem period must be at least 1")
      .optional(),
    maxTokens: z
      .number()
      .int()
      .min(100, "Max tokens must be at least 100")
      .optional(),
    minDepositAmount: z.number().positive().optional(),
    managementFee: z.number().positive().max(20).optional(),
    profitShare: z.number().positive().max(90).optional(),
    handleRate: z.number().optional(),
    permissioned: z
      .boolean()
      .optional()
      .describe("Should the vault have a whitelist of not"),
  }),
  handler: async (agent: SolanaAgentKit, input) => {
    try {
      const tx = await updateVault(agent, input.vaultAddress, {
        hurdleRate: input.hurdleRate,
        maxTokens: input.maxTokens,
        minDepositAmount: input.minDepositAmount,
        profitShare: input.profitShare,
        managementFee: input.managementFee,
        permissioned: input.permissioned,
        redeemPeriod: input.redeemPeriod,
      });

      return {
        status: "success",
        message: "Drift vault parameters updated successfully",
        signature: tx,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error message
        message: `Failed to update drift vault: ${e.message}`,
      };
    }
  },
};

export default updateDriftVaultAction;
