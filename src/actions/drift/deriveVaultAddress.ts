import { z } from "zod";
import type { Action } from "../../types";
import { getVaultAddress } from "../../tools";

const deriveDriftVaultAddressAction: Action = {
  name: "DERIVE_DRIFT_VAULT_ADDRESS_ACTION",
  similes: ["derive drift vault address", "get drift vault address"],
  description: "Derive a drift vault address from the vaults name",
  examples: [
    [
      {
        input: {
          name: "My Drift Vault",
        },
        output: {
          status: "success",
          message: "Vault address derived successfully",
          address: "2nFeP7taii3wGVgrWk4YiLMPmhtu3Zg9iXCUu4zGBD",
        },
        explanation: "Derive a drift vault address",
      },
    ],
  ],
  schema: z.object({
    name: z.string().describe("The name of the vault to derive the address of"),
  }),
  handler: async (agent, input) => {
    try {
      const address = await getVaultAddress(agent, input.name as string);

      return {
        status: "success",
        message: "Vault address derived successfully",
        address,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error message
        message: `Failed to derive vault address: ${e.message}`,
      };
    }
  },
};

export default deriveDriftVaultAddressAction;
