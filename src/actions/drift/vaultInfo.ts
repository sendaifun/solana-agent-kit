import { z } from "zod";
import type { Action } from "../../types";
import { getVaultInfo } from "../../tools";
import type { SolanaAgentKit } from "../../agent";

const vaultInfoAction: Action = {
  name: "DRIFT_VAULT_INFO",
  similes: ["get drift vault info", "vault info", "vault information"],
  description: "Get information about a drift vault",
  examples: [
    [
      {
        input: {
          vaultNameOrAddress: "test-vault",
        },
        output: {
          status: "success",
          message: "Vault info retrieved successfully",
          data: {
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
        },
        explanation: "Get information about a drift vault",
      },
    ],
  ],
  schema: z.object({
    vaultNameOrAddress: z.string().describe("Name or address of the vault"),
  }),
  handler: async (agent: SolanaAgentKit, input) => {
    try {
      const vaultInfo = await getVaultInfo(agent, input.vaultNameOrAddress);

      return {
        status: "success",
        message: "Vault info retrieved successfully",
        data: vaultInfo,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error message
        message: `Failed to retrieve vault info: ${e.message}`,
      };
    }
  },
};

export default vaultInfoAction;
