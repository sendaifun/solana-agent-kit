import { z } from "zod";
import type { Action } from "../../types";
import { updateVaultDelegate } from "../../tools";

const updateDriftVaultDelegateAction: Action = {
  name: "UPDATE_DRIFT_VAULT_DELEGATE_ACTION",
  similes: ["update drift vault delegate", "change drift vault delegate"],
  description: "Update the delegate of a drift vault",
  examples: [
    [
      {
        input: {
          vaultAddress: "2nFeP7taii3wGVgrWk4YiLMPmhtu3Zg9iXCUu4zGBD",
          newDelegate: "2nFeP7tai",
        },
        output: {
          status: "success",
          message: "Vault delegate updated successfully",
          signature:
            "2nFeP7taii3wGVgrWk4YiLMPmhtu3Zg9iXCUu4zGBDadwunHw8reXFxRWT7khbFsQ9JT3zK4RYDLNDFDRYvM3wJk",
        },
        explanation: "Update the delegate of a drift vault to another address",
      },
    ],
  ],
  schema: z.object({
    vaultAddress: z.string().describe("vault's address"),
    newDelegate: z.string().describe("new address to delegate the vault to"),
  }),
  handler: async (agent, input) => {
    try {
      const tx = await updateVaultDelegate(
        agent,
        input.vaultAddress as string,
        input.newDelegate as string,
      );

      return {
        status: "success",
        message: "Vault delegate updated successfully",
        signature: tx,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error message
        message: `Failed to update vault delegate: ${e.message}`,
      };
    }
  },
};

export default updateDriftVaultDelegateAction;
